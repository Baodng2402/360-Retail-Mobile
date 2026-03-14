import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { customersApi } from '@/src/api';
import { ScreenHeader } from '@/src/components';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import { useAuthStore } from '@/src/stores';
import type { Customer } from '@/src/types';
import { isManagerOrOwner } from '@/src/utils/role';

type Props = StackScreenProps<MoreStackParamList, 'CustomerManagement'>;

export function CustomerManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const rawRole = useAuthStore((s) => s.user?.role ?? '');
  const canDelete = isManagerOrOwner(rawRole);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formZaloId, setFormZaloId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await customersApi.getCustomers({ pageSize: 100 });
      setCustomers(data);
    } catch (error) {
      console.error('[CustomerManagementScreen.fetchCustomers] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách khách hàng' });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCustomers().finally(() => setLoading(false));
  }, [fetchCustomers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  const keyExtractor = useCallback((item: Customer) => item.id, []);

  const renderCustomerItem = useCallback(
    ({ item }: { item: Customer }) => (
      <View className="mb-3 rounded-2xl bg-surface p-4">
        <View className="flex-row items-center">
          <View
            className="mr-3 h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.infoLight }}>
            <Ionicons name="person" size={20} color={COLORS.info} />
          </View>
        <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{item.fullName}</Text>
            <Text className="text-xs text-muted">{item.phoneNumber}</Text>
            {item.zaloId && <Text className="text-xs text-muted">Zalo: {item.zaloId}</Text>}
            {item.rank && (
              <Text className="text-xs text-muted">Hạng: {item.rank} · {item.totalPoints} điểm</Text>
            )}
          </View>
          <View className="items-end">
            <TouchableOpacity className="mt-1" activeOpacity={0.7} onPress={() => openEditModal(item)}>
              <Ionicons name="create-outline" size={16} color={COLORS.info} />
            </TouchableOpacity>
            {canDelete && (
              <TouchableOpacity
                className="mt-2"
                activeOpacity={0.7}
                onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    ),
    [canDelete],
  );

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormZaloId('');
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormName(customer.fullName || '');
    setFormPhone(customer.phoneNumber || '');
    setFormZaloId(customer.zaloId || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formPhone.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ họ tên và số điện thoại' });
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        await customersApi.updateCustomer(editingCustomer.id, {
          fullName: formName.trim(),
          phoneNumber: formPhone.trim(),
          zaloId: formZaloId.trim() || undefined,
        });
        Toast.show({ type: 'success', text1: 'Đã cập nhật khách hàng' });
      } else {
        await customersApi.createCustomer(formName.trim(), formPhone.trim(), formZaloId.trim() || undefined);
        Toast.show({ type: 'success', text1: 'Đã tạo khách hàng mới' });
      }

      setShowModal(false);
      setEditingCustomer(null);
      setFormName('');
      setFormPhone('');
      setFormZaloId('');
      await fetchCustomers();
    } catch (error) {
      console.error('[CustomerManagementScreen.handleSave] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không lưu được thông tin khách hàng' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customersApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((x) => x.id !== id));
      Toast.show({ type: 'success', text1: 'Đã xóa khách hàng' });
    } catch (error) {
      console.error('[CustomerManagementScreen.handleDelete] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Xóa khách hàng thất bại' });
    }
  };

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phoneNumber.includes(searchQuery),
      ),
    [customers, searchQuery],
  );

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Quản lý khách hàng"
        subtitle={`${customers.length} khách hàng`}
        topInset={insets.top}
        showBackButton
        rightSlot={
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.primaryLight }}
            activeOpacity={0.7}
            onPress={openCreateModal}>
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <View className="mx-4 mt-3 flex-row items-center rounded-xl bg-surface px-4 py-3">
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          className="ml-2 flex-1 text-sm text-foreground"
          placeholder="Tìm theo tên hoặc SĐT..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={renderCustomerItem}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text className="mt-3 text-base text-muted">Chưa có khách hàng nào</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-surface p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <Text className="mb-4 text-lg font-bold text-foreground">
              {editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
            </Text>
            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Họ tên *"
              placeholderTextColor={COLORS.textMuted}
              value={formName}
              onChangeText={setFormName}
            />
            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Số điện thoại *"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={formPhone}
              onChangeText={setFormPhone}
            />
            <TextInput
              className="mb-4 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Zalo ID (tùy chọn)"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              value={formZaloId}
              onChangeText={setFormZaloId}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl border border-border py-3"
                activeOpacity={0.7}
                onPress={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
                }}>
                <Text className="font-semibold text-muted">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-xl py-3"
                style={{ backgroundColor: COLORS.primary }}
                activeOpacity={0.7}
                onPress={handleSave}
                disabled={saving}>
                <Text className="font-semibold text-white">
                  {saving ? 'Đang lưu...' : editingCustomer ? 'Lưu thay đổi' : 'Tạo mới'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
