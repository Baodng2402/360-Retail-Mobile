import { useEffect, useMemo, useState } from 'react';
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
import { useSubscriptionStore, useStoreStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';
import { TrialStartModal } from '@/src/components/subscription/TrialStartModal';
import { TrialExpiredAlert } from '@/src/components/subscription/TrialExpiredAlert';
import { FeatureGate } from '@/src/components/subscription/FeatureGate';
import { StoreSwitcher } from '@/src/components/store/StoreSwitcher';
import { salesDashboardApi } from '@/src/api';
import type {
  SalesOverview,
  RevenueChartResponse,
  InventorySummary,
  RecentActivityItem
} from '@/src/api/salesDashboard.api';

export function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  // Subscription
  const subStatus = useSubscriptionStore((s) => s.status);
  const fetchSubStatus = useSubscriptionStore((s) => s.fetchStatus);
  const [showTrialModal, setShowTrialModal] = useState(false);

  // Stores
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const activeStore = useStoreStore((s) => s.activeStore);

  // Dashboard Data State
  const [overview, setOverview] = useState<SalesOverview | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartResponse | null>(null);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Init fetch
  useEffect(() => {
    fetchSubStatus();
    fetchStores();
  }, [fetchSubStatus, fetchStores]);

  useEffect(() => {
    if (subStatus?.status === 'Registered' && !subStatus.hasStore) {
      setShowTrialModal(true);
    }
  }, [subStatus]);

  useEffect(() => {
    if (activeStore) {
      fetchSubStatus();
    }
  }, [activeStore, fetchSubStatus]);

  // Fetch Dashboard Data
  useEffect(() => {
    async function loadDashboard() {
      if (!activeStore) return;
      try {
        setLoading(true);
        const [ovData, chartData, invData, actData] = await Promise.all([
          salesDashboardApi.getOverview(),
          salesDashboardApi.getRevenueChart({ groupBy: 'day' }),
          salesDashboardApi.getInventorySummary(),
          salesDashboardApi.getRecentActivity(5),
        ]);
        setOverview(ovData);
        setRevenueChart(chartData);
        setInventory(invData);
        setRecentActivities(actData.activities || []);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [activeStore]);

  const handleTrialSuccess = () => {
    setShowTrialModal(false);
    fetchSubStatus();
    fetchStores();
  };

  const revenueTargetProgress = useMemo(() => {
    if (!overview) return 0;
    // Assume 50M is monthly target for demo
    const target = 50_000_000;
    return Math.min(Math.round((overview.totalRevenue / target) * 100), 100);
  }, [overview]);

  const soldCapacity = useMemo(() => {
    if (!inventory || inventory.totalProducts === 0) return 0;
    return Math.min(Math.round(((inventory.totalProducts - inventory.inStockCount) / inventory.totalProducts) * 100), 100);
  }, [inventory]);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Tổng quan"
        subtitle="Chào mừng bạn quay lại, quản trị viên"
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
            <View className="mb-1 flex-row">
              <StatCard
                label="Doanh thu"
                value={formatCompact(overview?.totalRevenue || 0)}
                trend={overview?.revenueGrowth || 0}
                icon="trending-up"
                iconColor={COLORS.success}
              />
              <StatCard
                label="Đơn hàng"
                value={(overview?.totalOrders || 0).toString()}
                trend={overview?.orderGrowth || 0}
                icon="receipt-outline"
                iconColor={COLORS.primary}
              />
            </View>

            <View className="mt-1 flex-row">
              <StatCard
                label="KH Hệ thống"
                value={(overview?.totalCustomers || 0).toString()}
                icon="people-outline"
                iconColor={COLORS.info}
              />
              <StatCard
                label="SP Đã bán"
                value={(overview?.totalProducts || 0).toString()}
                icon="cube-outline"
                iconColor={COLORS.warning}
              />
            </View>

            <FeatureGate feature="dashboard">
              <ModernRevenueChart
                title="Doanh thu gần đây"
                subtitle="Biểu đồ doanh thu theo thời gian"
                dataPoints={revenueChart?.dataPoints || []}
              />

              {inventory && (
                <SoldSummaryCard
                  count={inventory.totalProducts - inventory.inStockCount}
                  percentage={soldCapacity}
                />
              )}

              <View className="mt-2 flex-row">
                <ProgressCard
                  percentage={soldCapacity}
                  label="Mục tiêu bán hàng"
                  value={`${inventory ? Math.max(0, inventory.totalProducts - inventory.inStockCount) : 0} SP`}
                  color={COLORS.primary}
                />
                <ProgressCard
                  percentage={revenueTargetProgress}
                  label="Mục tiêu doanh thu"
                  value={formatCompact(overview?.totalRevenue || 0)}
                  color={COLORS.accent}
                />
              </View>

              <View className="mt-5">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-foreground">Hoạt động gần đây</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Orders')}>
                    <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                {recentActivities.length > 0 ? recentActivities.map((item, idx) => (
                  <ActivityCard
                    key={`${item.code}-${idx}`}
                    icon={item.type === 'Order' ? 'cart-outline' : 'cube-outline'}
                    iconColor={item.type === 'Order' ? COLORS.primary : COLORS.info}
                    title={item.description || item.code}
                    subtitle={`Trạng thái: ${item.status}`}
                    time={formatRelativeTime(item.createdAt)}
                  />
                )) : (
                  <Text className="text-center text-muted p-4">Chưa có hoạt động nào</Text>
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
