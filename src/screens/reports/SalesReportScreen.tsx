import { useMemo, useState } from 'react';
import { ActivityIndicator, TextInput, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fromByteArray } from 'base64-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { reportsApi, salesDashboardApi } from '@/src/api';
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
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<{
    revenue: number;
    orders: number;
    products: number;
  } | null>(null);

  const weekLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const filterItems = FILTERS.map((filter) => ({ key: filter, label: filter }));

  const handleLoadPreview = async () => {
    setLoadingPreview(true);
    try {
      const overview = await salesDashboardApi.getOverview({
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setPreview({
        revenue: overview.totalRevenue,
        orders: overview.totalOrders,
        products: overview.totalProducts,
      });
    } catch (error) {
      console.error('[SalesReportScreen.handleLoadPreview] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tải được dữ liệu preview' });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await reportsApi.exportSalesReport({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });

      const arrayBuffer = await blob.arrayBuffer();
      const base64 = fromByteArray(new Uint8Array(arrayBuffer));

      const fileUri = `${FileSystem.cacheDirectory}sales-report-${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Export Sales Report',
          UTI: 'org.openxmlformats.spreadsheetml.sheet',
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Export thành công',
        text2: canShare ? 'Đã mở menu chia sẻ file Excel' : `Đã lưu file tại ${fileUri}`,
      });
    } catch (error) {
      console.error('[SalesReportScreen.handleExport] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không export được báo cáo' });
    } finally {
      setExporting(false);
    }
  };

  const resolvedPreview = useMemo(
    () =>
      preview ?? {
        revenue: dashboardStats.totalSales,
        orders: 0,
        products: 0,
      },
    [preview],
  );

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
        <View className="mb-3 rounded-2xl bg-surface p-4">
          <Text className="mb-2 text-sm font-semibold text-foreground">Date range (YYYY-MM-DD)</Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground"
              placeholder="From"
              value={fromDate}
              onChangeText={setFromDate}
            />
            <TextInput
              className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground"
              placeholder="To"
              value={toDate}
              onChangeText={setToDate}
            />
          </View>

          <View className="mt-3 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 items-center rounded-lg border border-border py-2.5"
              onPress={handleLoadPreview}>
              <Text className="font-semibold text-foreground">Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center rounded-lg py-2.5"
              style={{ backgroundColor: COLORS.primary }}
              onPress={handleExport}
              disabled={exporting}>
              <Text className="font-semibold text-white">{exporting ? 'Exporting...' : 'Export'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loadingPreview && (
          <View className="mb-3 items-center rounded-2xl bg-surface py-4">
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text className="mt-2 text-xs text-muted">Đang tải preview...</Text>
          </View>
        )}

        <View className="mb-2 flex-row">
          <StatCard
            label="Tổng doanh thu"
            value={formatCompact(resolvedPreview.revenue)}
            trend={dashboardStats.totalSalesTrend}
            icon="trending-up"
            iconColor={COLORS.success}
          />
          <StatCard
            label="Đơn hàng"
            value={String(resolvedPreview.orders)}
            trend={dashboardStats.inventoryTrend}
            icon="receipt-outline"
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
