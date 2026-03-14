import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StatCard,
  SoldSummaryCard,
  ProgressCard,
  ActivityCard,
  ModernRevenueChart,
} from '@/src/components/ui';
import { ScreenHeader } from '@/src/components';
import { formatRelativeTime, formatCompact } from '@/src/utils/format';
import { useSubscriptionStore, useStoreStore, useRefreshStore } from '@/src/stores';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { COLORS } from '@/src/constants/colors';
import { TrialStartModal } from '@/src/components/subscription/TrialStartModal';
import { TrialExpiredAlert } from '@/src/components/subscription/TrialExpiredAlert';
import { FeatureGate } from '@/src/components/subscription/FeatureGate';
import { StoreSwitcher } from '@/src/components/store/StoreSwitcher';
import { hasRole } from '@/src/utils/role';
import { salesDashboardApi } from '@/src/api';
import type {
  SalesOverview,
  RevenueChartResponse,
  InventorySummary,
  RecentActivityItem,
  TopProduct,
  OrderStatusOverview,
} from '@/src/api/salesDashboard.api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface DashboardData {
  overview: SalesOverview | null;
  revenueChart: RevenueChartResponse | null;
  inventory: InventorySummary | null;
  recentActivities: RecentActivityItem[];
  topProducts: TopProduct[];
  orderStatus: OrderStatusOverview | null;
}

const EMPTY_DASHBOARD: DashboardData = {
  overview: null,
  revenueChart: null,
  inventory: null,
  recentActivities: [],
  topProducts: [],
  orderStatus: null,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // ── Stores ──────────────────────────────────
  const subStatus = useSubscriptionStore((s) => s.status);
  const fetchSubStatus = useSubscriptionStore((s) => s.fetchStatus);
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const activeStore = useStoreStore((s) => s.activeStore);
  const rawRole = useAuthStore((s) => s.user?.role);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  const lastSubscriptionRefresh = useRefreshStore((s) => s.lastRefreshTime.subscription);

  // ── UI State ────────────────────────────────
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [showTrialModal, setShowTrialModal] = useState(false);

  // ── Guards ──────────────────────────────────
  // Prevent concurrent fetches and state updates after unmount
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  // Track previous store id to detect real store switches (not just re-renders)
  const prevStoreIdRef = useRef<string | undefined>(undefined);

  // ─────────────────────────────────────────────
  // loadDashboard — STABLE (empty deps)
  //
  // Đọc state trực tiếp từ Zustand .getState() thay vì closure
  // → Không bao giờ bị recreate → Không trigger cascade useEffect
  // ─────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    // Read latest values at call-time, not from stale closure
    const currentStore = useStoreStore.getState().activeStore;
    const currentSub = useSubscriptionStore.getState().status;

    // Guard: no active store yet
    if (!currentStore) return;

    // Guard: prevent concurrent fetches
    if (isFetchingRef.current) return;

    // Trial users → backend returns 403, skip early
    if (currentSub?.status === 'Trial') {
      if (isMountedRef.current) {
        setDashboard(EMPTY_DASHBOARD);
        setLoading(false);
      }
      return;
    }

    isFetchingRef.current = true;
    if (isMountedRef.current) setLoading(true);

    try {
      const [ovData, chartData, invData, actData, topProducts, orderStatus] = await Promise.all([
        salesDashboardApi.getOverview(),
        salesDashboardApi.getRevenueChart({ groupBy: 'day' }),
        salesDashboardApi.getInventorySummary(),
        salesDashboardApi.getRecentActivity(5),
        salesDashboardApi.getTopProducts({ top: 5 }),
        salesDashboardApi.getOrderStatus(),
      ]);

      // Discard results if component unmounted during fetch
      if (!isMountedRef.current) return;

      setDashboard({
        overview: ovData,
        revenueChart: chartData,
        inventory: invData,
        recentActivities: actData.activities ?? [],
        topProducts,
        orderStatus,
      });
    } catch (error: any) {
      if (!isMountedRef.current) return;

      // 403 = feature gate (handled by interceptor modal), not a crash
      if (error?.response?.status !== 403) {
        console.error('[HomeScreen] Failed to load dashboard:', error);
      }
      setDashboard(EMPTY_DASHBOARD);
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) setLoading(false);
    }
  }, []); // ← INTENTIONALLY EMPTY — reads from Zustand .getState()

  // ─────────────────────────────────────────────
  // Effect 1: Initial load — runs ONCE on mount
  //
  // Sequence: fetch meta (sub + stores) → THEN load dashboard
  // Sequential ensures dashboard reads correct store/sub state
  // ─────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      // Fetch meta in parallel (they don't depend on each other)
      await Promise.all([fetchSubStatus(), fetchStores()]);
      // Only now load dashboard — store and subscription are ready
      await loadDashboard();
    };

    init();

    return () => {
      isMountedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // Effect 2: Active store switch
  //
  // Fires only when user actively switches store (not on mount)
  // Uses prevStoreIdRef to skip the initial value set by Effect 1
  // ─────────────────────────────────────────────
  useEffect(() => {
    const newId = activeStore?.id;

    // First time: record current value, skip fetch (Effect 1 already handles it)
    if (prevStoreIdRef.current === undefined) {
      prevStoreIdRef.current = newId;
      return;
    }

    // Only reload when store actually changes
    if (newId === prevStoreIdRef.current) return;
    prevStoreIdRef.current = newId;

    loadDashboard();
  }, [activeStore?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // Effect 3: Subscription refresh event
  //
  // When sub changes (upgrade/downgrade/trial start):
  // Re-fetch meta THEN reload dashboard — sequential, not concurrent
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (lastSubscriptionRefresh === 0) return;

    const timer = setTimeout(async () => {
      if (!isMountedRef.current) return;
      // Refresh meta first, then dashboard reads fresh state
      await Promise.all([fetchSubStatus(), fetchStores()]);
      await loadDashboard();
    }, 300);

    return () => clearTimeout(timer);
  }, [lastSubscriptionRefresh]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // Effect 4: Trial modal trigger
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (subStatus?.status === 'Registered' && !subStatus.hasStore) {
      setShowTrialModal(true);
    }
  }, [subStatus?.status, subStatus?.hasStore]);

  // ─────────────────────────────────────────────
  // Derived values (memoized)
  // ─────────────────────────────────────────────
  const revenueTargetProgress = useMemo(() => {
    if (!dashboard.overview) return 0;
    const target = 50_000_000;
    return Math.min(Math.round((dashboard.overview.totalRevenue / target) * 100), 100);
  }, [dashboard.overview]);

  const soldCapacity = useMemo(() => {
    const inv = dashboard.inventory;
    if (!inv || inv.totalProducts === 0) return 0;
    return Math.min(
      Math.round(((inv.totalProducts - inv.inStockCount) / inv.totalProducts) * 100),
      100,
    );
  }, [dashboard.inventory]);

  const soldCount = useMemo(() => {
    const inv = dashboard.inventory;
    return inv ? Math.max(0, inv.totalProducts - inv.inStockCount) : 0;
  }, [dashboard.inventory]);

  const dashboardSubtitle = useMemo(() => {
    if (hasRole(rawRole, 'StoreOwner')) return 'Xin chao Store Owner';
    if (hasRole(rawRole, 'Manager')) return 'Xin chao Quan ly';
    if (hasRole(rawRole, 'Staff')) return 'Xin chao Nhan vien';
    return 'Chao mung ban quay lai';
  }, [rawRole]);

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleTrialSuccess = useCallback(() => {
    setShowTrialModal(false);
    triggerRefresh('subscription');
  }, [triggerRefresh]);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Tổng quan"
        subtitle={dashboardSubtitle}
        topInset={insets.top}
        rightSlot={
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        }>
        <StoreSwitcher />
      </ScreenHeader>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <TrialExpiredAlert daysRemaining={subStatus?.daysRemaining ?? null} />

        {loading ? (
          <View className="flex-1 py-20 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="mt-4 text-muted">Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {/* ── Stat Cards ─────────────────────── */}
            <View className="mb-1 flex-row">
              <StatCard
                label="Doanh thu"
                value={formatCompact(dashboard.overview?.totalRevenue ?? 0)}
                trend={dashboard.overview?.revenueGrowth ?? 0}
                icon="trending-up"
                iconColor={COLORS.success}
              />
              <StatCard
                label="Đơn hàng"
                value={String(dashboard.overview?.totalOrders ?? 0)}
                trend={dashboard.overview?.orderGrowth ?? 0}
                icon="receipt-outline"
                iconColor={COLORS.primary}
              />
            </View>

            <View className="mt-1 flex-row">
              <StatCard
                label="KH Hệ thống"
                value={String(dashboard.overview?.totalCustomers ?? 0)}
                icon="people-outline"
                iconColor={COLORS.info}
              />
              <StatCard
                label="SP Đã bán"
                value={String(dashboard.overview?.totalProducts ?? 0)}
                icon="cube-outline"
                iconColor={COLORS.warning}
              />
            </View>

            {/* ── Feature-gated content ──────────── */}
            <FeatureGate feature="dashboard">
              <ModernRevenueChart
                title="Doanh thu gần đây"
                subtitle="Biểu đồ doanh thu theo thời gian"
                dataPoints={dashboard.revenueChart?.dataPoints ?? []}
              />

              {dashboard.inventory && (
                <SoldSummaryCard count={soldCount} percentage={soldCapacity} />
              )}

              <View className="mt-2 flex-row">
                <ProgressCard
                  percentage={soldCapacity}
                  label="Mục tiêu bán hàng"
                  value={`${soldCount} SP`}
                  color={COLORS.primary}
                />
                <ProgressCard
                  percentage={revenueTargetProgress}
                  label="Mục tiêu doanh thu"
                  value={formatCompact(dashboard.overview?.totalRevenue ?? 0)}
                  color={COLORS.accent}
                />
              </View>

              <View className="mt-5 rounded-2xl bg-surface p-4">
                <Text className="mb-2 text-base font-bold text-foreground">Top selling products</Text>
                {dashboard.topProducts.length > 0 ? (
                  dashboard.topProducts.map((p, idx) => (
                    <View key={p.productId} className="mb-2 flex-row items-center justify-between">
                      <Text className="text-sm text-foreground">{idx + 1}. {p.productName}</Text>
                      <Text className="text-xs text-muted">{p.quantitySold} sold</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-muted">Không có dữ liệu</Text>
                )}
              </View>

              <View className="mt-4 rounded-2xl bg-surface p-4">
                <Text className="mb-2 text-base font-bold text-foreground">Order status distribution</Text>
                {dashboard.orderStatus?.statuses?.length ? (
                  dashboard.orderStatus.statuses.map((s) => (
                    <View key={s.status} className="mb-2">
                      <View className="mb-1 flex-row items-center justify-between">
                        <Text className="text-xs text-muted">{s.status}</Text>
                        <Text className="text-xs text-muted">{s.count} ({s.percentage.toFixed(0)}%)</Text>
                      </View>
                      <View className="h-2 rounded-full bg-bg">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(5, s.percentage)}%`, backgroundColor: COLORS.info }}
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-muted">Không có dữ liệu</Text>
                )}
              </View>

              {!!dashboard.inventory && (
                <View className="mt-4 rounded-2xl bg-surface p-4">
                  <Text className="mb-2 text-base font-bold text-foreground">Inventory alerts</Text>
                  <Text className="text-xs text-muted">Low stock: {dashboard.inventory.lowStockCount}</Text>
                  <Text className="text-xs text-muted">Out of stock: {dashboard.inventory.outOfStockCount}</Text>
                </View>
              )}

              {/* ── Recent Activity ─────────────── */}
              <View className="mt-5">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-foreground">Hoạt động gần đây</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Orders')}>
                    <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                {dashboard.recentActivities.length > 0 ? (
                  dashboard.recentActivities.map((item, idx) => (
                    <ActivityCard
                      key={`${item.code}-${idx}`}
                      icon={item.type === 'Order' ? 'cart-outline' : 'cube-outline'}
                      iconColor={item.type === 'Order' ? COLORS.primary : COLORS.info}
                      title={item.description || item.code}
                      subtitle={`Trạng thái: ${item.status}`}
                      time={formatRelativeTime(item.createdAt)}
                    />
                  ))
                ) : (
                  <Text className="p-4 text-center text-muted">Chưa có hoạt động nào</Text>
                )}
              </View>
            </FeatureGate>
          </>
        )}
      </ScrollView>

      <TrialStartModal visible={showTrialModal} onSuccess={handleTrialSuccess} />
    </View>
  );
}
