import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatCard, MiniBarChart, BestSellerCard } from '@/src/components/ui';
import { bestSellers, dashboardStats } from '@/src/data/mockData';
import { formatCompact } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import { useNavigation } from '@react-navigation/native';

export function SalesReportScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState('Tháng này');
    const filters = ['Hôm nay', 'Tuần này', 'Tháng này', 'Năm nay'];
    const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
            <View
                style={{
                    backgroundColor: COLORS.surface,
                    paddingTop: insets.top + 12,
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.divider,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="stats-chart" size={22} color={COLORS.primary} />
                        <Text style={{ fontSize: 20, fontWeight: '800', color: COLORS.text, marginLeft: 8 }}>
                            Báo Cáo Doanh Thu
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: COLORS.primaryLight,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 8,
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.primary, marginLeft: 4 }}>
                            Th10 2023
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            >
                {/* Time Filter Pills */}
                <View style={{ flexDirection: 'row', marginBottom: 16, gap: 8 }}>
                    {filters.map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            style={{
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                borderRadius: 10,
                                backgroundColor: activeFilter === f ? COLORS.primary : COLORS.surface,
                                borderWidth: activeFilter === f ? 0 : 1,
                                borderColor: COLORS.border,
                            }}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '600',
                                    color: activeFilter === f ? '#fff' : COLORS.textMuted,
                                }}
                            >
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats */}
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <StatCard
                        label="Tổng doanh thu"
                        value={formatCompact(dashboardStats.totalSales)}
                        trend={dashboardStats.totalSalesTrend}
                        icon="trending-up"
                        iconColor={COLORS.success}
                    />
                    <StatCard
                        label="Giá trị kho"
                        value={formatCompact(dashboardStats.inventoryValue)}
                        trend={dashboardStats.inventoryTrend}
                        icon="cube-outline"
                        iconColor={COLORS.primary}
                    />
                </View>

                {/* Revenue Chart */}
                <MiniBarChart
                    title="Phân tích doanh thu"
                    subtitle="So sánh với tuần trước"
                    data={dashboardStats.weeklyRevenue}
                    labels={weekLabels}
                    height={140}
                    barColor={COLORS.primary}
                />

                {/* Best Sellers */}
                <View style={{ marginTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>Bán chạy nhất</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primary }}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>
                    {bestSellers.map((item, idx) => (
                        <BestSellerCard
                            key={item.id}
                            rank={idx + 1}
                            name={item.name}
                            category={item.category}
                            revenue={item.revenue}
                            trend={item.trend}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
