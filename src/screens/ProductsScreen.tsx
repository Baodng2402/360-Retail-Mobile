import { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { products } from '@/src/data/mockData';
import { formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import { ScreenHeader, SearchField } from '@/src/components';

const FILTERS = ['Danh mục', 'Trạng thái', 'Khoảng giá', 'Tồn kho'];

const STOCK_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  in_stock: { label: 'CÒN HÀNG', bg: 'rgba(34,197,94,0.12)', text: '#16A34A' },
  low_stock: { label: 'SẮP HẾT', bg: 'rgba(245,158,11,0.12)', text: '#D97706' },
  out_of_stock: { label: 'HẾT HÀNG', bg: 'rgba(239,68,68,0.12)', text: '#DC2626' },
};

export function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (!normalizedQuery) return true;
      return (
        item.productName.toLowerCase().includes(normalizedQuery) ||
        item.sku?.toLowerCase().includes(normalizedQuery) ||
        item.categoryName?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const renderFilterItem = useCallback(({ item }: { item: string }) => {
    const active = item === 'Khoảng giá';

    return (
      <TouchableOpacity
        className="mr-2 flex-row items-center rounded-full border px-4 py-2"
        style={{
          backgroundColor: active ? 'rgba(38,198,218,0.12)' : COLORS.surface,
          borderColor: active ? 'rgba(38,198,218,0.25)' : COLORS.border,
        }}
        activeOpacity={0.8}
        onPress={() =>
          Toast.show({
            type: 'info',
            text1: `Bộ lọc: ${item}`,
            text2: 'Sắp có logic lọc dữ liệu',
          })
        }>
        <Text className="text-xs font-semibold" style={{ color: active ? COLORS.primary : COLORS.textSecondary }}>
          {item}
        </Text>
        <Ionicons
          name={active ? 'close' : 'chevron-down'}
          size={14}
          color={active ? COLORS.primary : COLORS.textMuted}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>
    );
  }, []);

  const renderProductItem = useCallback(({ item }: { item: (typeof products)[number] }) => {
    const stock = STOCK_STYLE[item.status || 'in_stock'] || STOCK_STYLE.in_stock;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          Toast.show({
            type: 'info',
            text1: item.productName,
            text2: `${formatCurrency(item.price)} • Tồn kho ${item.stockQuantity}`,
          })
        }
        className="mb-3 flex-row rounded-xl border border-border bg-surface p-3">
        <View className="relative mr-3 h-20 w-20 items-center justify-center rounded-lg bg-bg">
          <Ionicons name="cube-outline" size={24} color={COLORS.textMuted} />
          <View className="absolute left-1 top-1 rounded px-1.5 py-0.5" style={{ backgroundColor: stock.bg }}>
            <Text className="text-[9px] font-bold" style={{ color: stock.text }}>
              {stock.label}
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-between py-0.5">
          <View className="flex-row items-start justify-between">
            <Text className="mr-3 flex-1 text-sm font-semibold text-foreground">{item.productName}</Text>
            <TouchableOpacity className="rounded-full p-1" activeOpacity={0.7}>
              <Ionicons name="ellipsis-vertical" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-muted">SKU: {item.sku || 'N/A'}</Text>

          <View className="mt-2 flex-row items-end justify-between">
            <View>
              <Text className="text-[11px] text-muted">Đơn giá</Text>
              <Text className="text-sm font-bold text-primary">{formatCurrency(item.price)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[11px] text-muted">Tồn kho</Text>
              <Text className="text-sm font-bold text-foreground">{item.stockQuantity}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Sản phẩm"
        topInset={insets.top}
        rightSlot={
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-primary"
            activeOpacity={0.8}
            onPress={() =>
              Toast.show({ type: 'info', text1: 'Thêm sản phẩm', text2: 'Sắp có màn tạo sản phẩm' })
            }>
            <Ionicons name="add" size={20} color="#0F172A" />
          </TouchableOpacity>
        }>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm theo tên, SKU hoặc thẻ..."
          rightIcon="qr-code-outline"
        />
      </ScreenHeader>

      <View className="border-b border-divider bg-bg px-4 py-3">
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={renderFilterItem}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews
        ListEmptyComponent={
          <View className="items-center pt-16">
            <Ionicons name="cube-outline" size={48} color={COLORS.textLight} />
            <Text className="mt-3 text-base text-muted">Không tìm thấy sản phẩm</Text>
          </View>
        }
        renderItem={renderProductItem}
      />
    </View>
  );
}
