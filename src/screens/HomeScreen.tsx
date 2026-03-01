import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StatCard,
  SoldSummaryCard,
  MiniBarChart,
  ProgressCard,
  ActivityCard,
} from '@/src/components/ui';
import { ScreenHeader } from '@/src/components';
import { activityFeed, dashboardStats } from '@/src/data/mockData';
import { formatRelativeTime, formatCompact } from '@/src/utils/format';
import { useSubscriptionStore } from '@/src/stores';
import { useStoreStore } from '@/src/stores/useStoreStore';
import { COLORS } from '@/src/constants/colors';
import { TrialStartModal } from '@/src/components/subscription/TrialStartModal';
import { TrialExpiredAlert } from '@/src/components/subscription/TrialExpiredAlert';
import { FeatureGate } from '@/src/components/subscription/FeatureGate';
import { StoreSwitcher } from '@/src/components/store/StoreSwitcher';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const revenueTargetProgress = useMemo(
    () => Math.round((dashboardStats.totalSales / dashboardStats.monthlyTarget) * 100),
    []
  );

  // Subscription
  const subStatus = useSubscriptionStore((s) => s.status);
  const fetchSubStatus = useSubscriptionStore((s) => s.fetchStatus);
  const [showTrialModal, setShowTrialModal] = useState(false);

  // Stores
  const fetchStores = useStoreStore((s) => s.fetchStores);
  const activeStore = useStoreStore((s) => s.activeStore);

  // Init — fetch subscription + stores khi mount
  useEffect(() => {
    fetchSubStatus();
    fetchStores();
  }, [fetchSubStatus, fetchStores]);

  // Hiện trial modal khi chưa có store
  useEffect(() => {
    if (subStatus?.status === 'Registered' && !subStatus.hasStore) {
      setShowTrialModal(true);
    }
  }, [subStatus]);

  // Re-fetch stores & subscription khi active store thay đổi
  useEffect(() => {
    if (activeStore) {
      fetchSubStatus();
    }
  }, [activeStore, fetchSubStatus]);

  const handleTrialSuccess = () => {
    setShowTrialModal(false);
    fetchSubStatus();
    fetchStores(); // Refresh DS stores sau khi start trial tạo store
  };

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

        <View className="mb-1 flex-row">
          <StatCard
            label="Doanh thu"
            value={formatCompact(dashboardStats.totalSales)}
            trend={dashboardStats.totalSalesTrend}
            icon="trending-up"
            iconColor={COLORS.success}
          />
          <StatCard
            label="Đơn hàng"
            value={dashboardStats.activeOrders.toString()}
            trend={dashboardStats.activeOrdersTrend}
            icon="receipt-outline"
            iconColor={COLORS.primary}
          />
        </View>

        <View className="mt-1 flex-row">
          <StatCard
            label="KH mới"
            value={dashboardStats.newCustomers.toString()}
            icon="people-outline"
            iconColor={COLORS.info}
          />
          <StatCard
            label="Tỷ lệ đổi trả"
            value={`${dashboardStats.returnRate}%`}
            icon="swap-horizontal-outline"
            iconColor={COLORS.warning}
          />
        </View>

        {/* Dashboard Charts — cần gói Basic+ */}
        <FeatureGate feature="dashboard">
          <MiniBarChart
            title="Doanh thu 7 ngày"
            subtitle={`Mục tiêu tháng: ${formatCompact(dashboardStats.monthlyTarget)}`}
            data={dashboardStats.weeklyRevenue}
            labels={weekLabels}
            height={130}
            barColor={COLORS.primary}
          />

          <MiniBarChart
            title="Đơn hàng theo ngày"
            subtitle="So sánh với tuần trước"
            data={dashboardStats.weeklyOrders}
            labels={weekLabels}
            height={100}
            barColor={COLORS.accent}
          />

          <SoldSummaryCard
            count={dashboardStats.productsSold}
            percentage={dashboardStats.soldCapacity}
          />

          <View className="mt-2 flex-row">
            <ProgressCard
              percentage={dashboardStats.soldCapacity}
              label="Mục tiêu bán hàng"
              value={`${dashboardStats.productsSold} SP`}
              color={COLORS.primary}
            />
            <ProgressCard
              percentage={revenueTargetProgress}
              label="Mục tiêu doanh thu"
              value={formatCompact(dashboardStats.totalSales)}
              color={COLORS.accent}
            />
          </View>

          <View className="mt-5">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Hoạt động gần đây</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {activityFeed.map((item) => (
              <ActivityCard
                key={item.id}
                icon={item.icon}
                iconColor={item.iconColor}
                title={item.title}
                subtitle={item.subtitle}
                time={formatRelativeTime(item.time)}
              />
            ))}
          </View>
        </FeatureGate>
      </ScrollView>

      <TrialStartModal visible={showTrialModal} onSuccess={handleTrialSuccess} />
    </View>
  );
}
