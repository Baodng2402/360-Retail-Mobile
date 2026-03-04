import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { formatDate, formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';
import { HorizontalChips, ScreenHeader, SearchField } from '@/src/components';
import { ordersApi } from '@/src/api';
import { useStoreStore } from '@/src/stores/useStoreStore';

const TABS = ['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'];
const STATUS_MAP: Record<string, string> = {
  'Chờ xử lý': 'Pending',
  'Đang xử lý': 'Processing',
  'Đang giao': 'Shipping',
  'Hoàn thành': 'Completed',
  'Đã hủy': 'Cancelled',
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  Pending: { bg: 'rgba(245,158,11,0.1)', text: '#D97706', label: 'Chờ xử lý' },
  Processing: { bg: 'rgba(59,130,246,0.1)', text: '#2563EB', label: 'Đang xử lý' },
  Shipping: { bg: 'rgba(34,197,94,0.1)', text: '#16A34A', label: 'Đang giao' },
  Completed: { bg: 'rgba(148,163,184,0.15)', text: '#64748B', label: 'Hoàn thành' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626', label: 'Đã hủy' },
  Refunded: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626', label: 'Hoàn tiền' },
};

const TAB_ITEMS = TABS.map((item) => ({ key: item, label: item }));

export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const activeStore = useStoreStore((s) => s.activeStore);

  const [activeTab, setActiveTab] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For Order Detail Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const listRef = useRef<FlatList<any>>(null);

  const fetchOrders = useCallback(async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      const fetchedOrders = await ordersApi.getOrders({
        page: 1,
        pageSize: 100,
      });
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused, fetchOrders]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders.filter((item) => {
      const matchTab = activeTab === 'Tất cả' || item.status === STATUS_MAP[activeTab];
      const matchSearch =
        !normalizedQuery ||
        (item.customer?.name || '').toLowerCase().includes(normalizedQuery) ||
        (item.code || '').toLowerCase().includes(normalizedQuery);

      return matchTab && matchSearch;
    });
  }, [orders, activeTab, normalizedQuery]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, [activeTab, normalizedQuery]);

  const openOrderDetail = useCallback(async (id: string) => {
    setSelectedOrderId(id);
    setDetailLoading(true);
    try {
      const detail = await ordersApi.getOrderById(id);
      setOrderDetail(detail);
    } catch {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải chi tiết đơn hàng' });
      setSelectedOrderId(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrderId) return;
    setStatusUpdating(true);
    try {
      await ordersApi.updateOrderStatus(selectedOrderId, newStatus);
      Toast.show({ type: 'success', text1: 'Thành công', text2: `Đã cập nhật trạng thái thành ${newStatus}` });
      setOrderDetail((prev: any) => prev ? { ...prev, status: newStatus } : null);
      fetchOrders();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi cập nhật', text2: error.message || 'Không thể cập nhật trạng thái' });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    setStatusUpdating(true);
    try {
      await ordersApi.cancelOrder(selectedOrderId);
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã hủy đơn hàng' });
      setOrderDetail((prev: any) => prev ? { ...prev, status: 'Cancelled' } : null);
      fetchOrders();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message || 'Không thể hủy đơn hàng' });
    } finally {
      setStatusUpdating(false);
    }
  };

  const renderOrderItem = useCallback(({ item }: { item: any }) => {
    const status = STATUS_STYLE[item.status] ?? STATUS_STYLE.Pending;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => openOrderDetail(item.id)}
        className="mb-3 rounded-xl border border-border bg-surface p-4">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text className="text-base font-bold text-foreground">Đơn {item.code}</Text>
              <Text className="text-sm text-muted">{item.customer?.name || 'Khách vãng lai'}</Text>
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
              {formatDate(item.createdAt)} • {item.orderItems?.length || 0} sản phẩm
            </Text>
            <Text className="text-sm font-bold text-foreground">{formatCurrency(item.totalAmount)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [openOrderDetail]);

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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
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
      )}

      {/* Order Detail Modal */}
      <Modal
        visible={!!selectedOrderId}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrderId(null)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="h-[85%] rounded-t-3xl bg-surface p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">
                Chi tiết đơn {orderDetail?.code || '...'}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedOrderId(null)}
                className="h-8 w-8 items-center justify-center rounded-full bg-bg">
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : orderDetail ? (
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header Info */}
                <View className="mb-4 rounded-2xl bg-bg p-4 flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm text-muted mb-1">Thời gian: {formatDate(orderDetail.createdAt)}</Text>
                    <Text className="text-sm text-muted">Khách hàng: {orderDetail.customer?.name || 'Khách vãng lai'}</Text>
                  </View>
                  <View className="rounded-full px-3 py-1.5" style={{ backgroundColor: STATUS_STYLE[orderDetail.status]?.bg || STATUS_STYLE.Pending.bg }}>
                    <Text className="text-sm font-semibold" style={{ color: STATUS_STYLE[orderDetail.status]?.text || STATUS_STYLE.Pending.text }}>
                      {STATUS_STYLE[orderDetail.status]?.label || 'Chờ xử lý'}
                    </Text>
                  </View>
                </View>

                {/* Items */}
                <Text className="mb-3 text-base font-bold text-foreground">Sản phẩm ({orderDetail.orderItems?.length || 0})</Text>
                {orderDetail.orderItems?.map((i: any, index: number) => (
                  <View key={index} className="mb-3 flex-row items-center rounded-xl border border-divider p-3">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-bg">
                      <Ionicons name="cube-outline" size={20} color={COLORS.textMuted} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{i.productName || 'Sản phẩm'}</Text>
                      <Text className="text-xs text-muted">{formatCurrency(i.unitPrice)} x {i.quantity}</Text>
                    </View>
                    <Text className="text-sm font-bold text-foreground">{formatCurrency(i.total)}</Text>
                  </View>
                ))}

                {/* Total */}
                <View className="mt-2 mb-6 rounded-2xl bg-bg p-4 flex-row justify-between items-center border border-primary/20">
                  <Text className="text-base font-bold text-foreground">Tổng cộng</Text>
                  <Text className="text-xl font-extrabold text-primary">{formatCurrency(orderDetail.totalAmount)}</Text>
                </View>

                {/* Action Buttons based on status */}
                {orderDetail.status !== 'Cancelled' && orderDetail.status !== 'Completed' && (
                  <View className="mb-8">
                    <Text className="mb-3 text-sm font-bold text-muted uppercase">Cập nhật trạng thái</Text>

                    {orderDetail.status === 'Pending' && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={statusUpdating}
                        onPress={() => handleUpdateStatus('Processing')}
                        className="mb-3 h-12 flex-row items-center justify-center rounded-xl bg-blue-500">
                        {statusUpdating ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Chuyển sang Đang xử lý</Text>}
                      </TouchableOpacity>
                    )}

                    {orderDetail.status === 'Processing' && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={statusUpdating}
                        onPress={() => handleUpdateStatus('Shipping')}
                        className="mb-3 h-12 flex-row items-center justify-center rounded-xl bg-green-500">
                        {statusUpdating ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Giao hàng (Đang giao)</Text>}
                      </TouchableOpacity>
                    )}

                    {orderDetail.status === 'Shipping' && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        disabled={statusUpdating}
                        onPress={() => handleUpdateStatus('Completed')}
                        className="mb-3 h-12 flex-row items-center justify-center rounded-xl bg-slate-700">
                        {statusUpdating ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Hoàn thành đơn hàng</Text>}
                      </TouchableOpacity>
                    )}

                    {/* Cancel Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={statusUpdating}
                      onPress={() => {
                        Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy đơn hàng này không?', [
                          { text: 'Không', style: 'cancel' },
                          { text: 'Đồng ý Hủy', style: 'destructive', onPress: handleCancelOrder }
                        ]);
                      }}
                      className="h-12 flex-row items-center justify-center rounded-xl border border-red-500 bg-red-50">
                      <Text className="text-base font-bold text-red-600">Hủy đơn hàng</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
