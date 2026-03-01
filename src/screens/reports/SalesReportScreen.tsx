import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatCard, MiniBarChart, BestSellerCard } from '@/src/components/ui';
import { HorizontalChips, ScreenHeader } from '@/src/components';
import { bestSellers, dashboardStats } from '@/src/data/mockData';
import { formatCompact } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';

const FILTERS = ['Hôm nay', 'Tuần này', 'Tháng này', 'Từ đầu năm'];

export function SalesReportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('Hôm nay');
  const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const filterItems = FILTERS.map((filter) => ({ key: filter, label: filter }));

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Báo cáo doanh thu"
        topInset={insets.top}
        rightSlot={
          <TouchableOpacity
            className="flex-row items-center rounded-lg bg-primary/10 px-3 py-1.5"
            activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <Text className="ml-1 text-xs font-semibold text-primary">Tháng 10/2023</Text>
          </TouchableOpacity>
        }>
        <View className="absolute left-4 top-0" style={{ marginTop: insets.top + 10 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-2 h-10 w-10 items-center justify-center rounded-full"
            activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </ScreenHeader>

      <HorizontalChips items={filterItems} activeKey={activeFilter} onPress={setActiveFilter} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View className="mb-2 flex-row">
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
            iconColor={COLORS.accent}
          />
        </View>

        <MiniBarChart
          title="Phân tích doanh thu"
          subtitle="So sánh với kỳ trước"
          data={dashboardStats.weeklyRevenue}
          labels={weekLabels}
          height={150}
          barColor={COLORS.primary}
        />

        <View className="mt-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">Sản phẩm bán chạy</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
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
