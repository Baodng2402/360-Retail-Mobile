import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatCard, SoldSummaryCard, MiniBarChart, ProgressCard, ActivityCard } from '@/src/components/ui';
import { activityFeed, dashboardStats } from '@/src/data/mockData';
import { formatRelativeTime, formatCompact } from '@/src/utils/format';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';

export function HomeScreen() {
    const insets = useSafeAreaInsets();
    const user = useAuthStore((s) => s.user);
    const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View className="bg-surface border-b border-divider px-5 pb-4"
                style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-extrabold text-foreground">Tổng quan</Text>
                        <Text className="text-sm text-muted mt-0.5">
                            Xin chào, {user?.fullName || 'Quản lý'} 👋
                        </Text>
                    </View>
                    <TouchableOpacity className="w-11 h-11 rounded-2xl bg-primary-light items-center justify-center"
                        activeOpacity={0.7}>
                        <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

                {/* Stats Row 1 */}
                <View className="flex-row mb-1">
                    <StatCard label="Doanh thu" value={formatCompact(dashboardStats.totalSales)}
                        trend={dashboardStats.totalSalesTrend} icon="trending-up" iconColor={COLORS.success} />
                    <StatCard label="Đơn hàng" value={dashboardStats.activeOrders.toString()}
                        trend={dashboardStats.activeOrdersTrend} icon="receipt-outline" iconColor={COLORS.primary} />
                </View>

                {/* Stats Row 2 */}
                <View className="flex-row mt-1">
                    <StatCard label="KH mới" value={dashboardStats.newCustomers.toString()}
                        icon="people-outline" iconColor={COLORS.info} />
                    <StatCard label="Tỷ lệ đổi trả" value={`${dashboardStats.returnRate}%`}
                        icon="swap-horizontal-outline" iconColor={COLORS.warning} />
                </View>

                {/* Revenue Chart */}
                <MiniBarChart title="Doanh thu 7 ngày"
                    subtitle={`Mục tiêu tháng: ${formatCompact(dashboardStats.monthlyTarget)}`}
                    data={dashboardStats.weeklyRevenue} labels={weekLabels}
                    height={130} barColor={COLORS.primary} />

                {/* Orders Chart */}
                <MiniBarChart title="Đơn hàng theo ngày" subtitle="So sánh với tuần trước"
                    data={dashboardStats.weeklyOrders} labels={weekLabels}
                    height={100} barColor={COLORS.accent} />

                {/* Sold Summary */}
                <SoldSummaryCard count={dashboardStats.productsSold} percentage={dashboardStats.soldCapacity} />

                {/* Progress Cards */}
                <View className="flex-row mt-2">
                    <ProgressCard percentage={dashboardStats.soldCapacity} label="Mục tiêu bán hàng"
                        value={`${dashboardStats.productsSold} SP`} color={COLORS.primary} />
                    <ProgressCard
                        percentage={Math.round((dashboardStats.totalSales / dashboardStats.monthlyTarget) * 100)}
                        label="Mục tiêu doanh thu" value={formatCompact(dashboardStats.totalSales)} color={COLORS.accent} />
                </View>

                {/* Recent Activity */}
                <View className="mt-5">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-bold text-foreground">Hoạt động gần đây</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    {activityFeed.map((item) => (
                        <ActivityCard key={item.id} icon={item.icon} iconColor={item.iconColor}
                            title={item.title} subtitle={item.subtitle} time={formatRelativeTime(item.time)} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
