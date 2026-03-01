import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { orders } from '@/src/data/mockData';
import { formatDate, formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import { HorizontalChips, ScreenHeader, SearchField } from '@/src/components';

const TABS = ['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đang giao', 'Hoàn thành'];
const STATUS_MAP: Record<string, string> = {
  'Chờ xử lý': 'pending',
  'Đang xử lý': 'processing',
  'Đang giao': 'shipping',
  'Hoàn thành': 'completed',
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#D97706', label: 'Chờ xử lý' },
  processing: { bg: 'rgba(59,130,246,0.1)', text: '#2563EB', label: 'Đang xử lý' },
  shipping: { bg: 'rgba(34,197,94,0.1)', text: '#16A34A', label: 'Đang giao' },
  completed: { bg: 'rgba(148,163,184,0.15)', text: '#64748B', label: 'Hoàn thành' },
  cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626', label: 'Đã hủy' },
};

const TAB_ITEMS = TABS.map((item) => ({ key: item, label: item }));

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<FlatList<(typeof orders)[number]>>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchTab = activeTab === 'Tất cả' || item.status === STATUS_MAP[activeTab];
      const matchSearch =
        !normalizedQuery ||
        item.customerName?.toLowerCase().includes(normalizedQuery) ||
        item.code.toLowerCase().includes(normalizedQuery);

      return matchTab && matchSearch;
    });
  }, [activeTab, normalizedQuery]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, [activeTab, normalizedQuery]);

  const renderOrderItem = useCallback(({ item }: { item: (typeof orders)[number] }) => {
    const status = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          Toast.show({
            type: 'info',
            text1: `Đơn hàng ${item.code}`,
            text2: `${item.customerName} - ${formatCurrency(item.totalAmount)}`,
          })
        }
        className="mb-3 rounded-xl border border-border bg-surface p-4">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text className="text-base font-bold text-foreground">Đơn hàng {item.code}</Text>
              <Text className="text-sm text-muted">{item.customerName || 'Khách hàng chưa xác định'}</Text>
            </View>
          </View>

          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: status.bg }}>
            <Text className="text-xs font-semibold" style={{ color: status.text }}>
              {status.label}
            </Text>
          </View>
        </View>

        <View className="border-t border-divider pt-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">
              {formatDate(item.createdAt)} • {item.itemCount || 0} sản phẩm
            </Text>
            <Text className="text-sm font-bold text-foreground">{formatCurrency(item.totalAmount)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Lịch sử đơn hàng"
        topInset={insets.top}
        rightSlot={
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            activeOpacity={0.7}
            onPress={() =>
              Toast.show({ type: 'info', text1: 'Bộ lọc', text2: 'Sắp có bộ lọc nâng cao' })
            }>
            <Ionicons name="options-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        }>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm đơn hàng..."
        />
      </ScreenHeader>

      <HorizontalChips items={TAB_ITEMS} activeKey={activeTab} onPress={setActiveTab} />

      <FlatList
        key={`${activeTab}|${normalizedQuery}`}
        ref={listRef}
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews
        ListEmptyComponent={
          <View className="items-center pt-16">
            <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
            <Text className="mt-3 text-base text-muted">Không tìm thấy đơn hàng</Text>
          </View>
        }
        renderItem={renderOrderItem}
      />
    </View>
  );
}
