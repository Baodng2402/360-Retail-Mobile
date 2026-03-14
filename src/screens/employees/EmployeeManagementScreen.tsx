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
import { hrApi } from '@/src/api';
import { PrimaryButton, ScreenHeader } from '@/src/components';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import { useAuthStore } from '@/src/stores';
import { useStoreStore } from '@/src/stores/useStoreStore';
import type { Employee } from '@/src/types';
import { isStoreOwner } from '@/src/utils/role';

type Props = StackScreenProps<MoreStackParamList, 'EmployeeManagement'>;
type RoleOption = 'Manager' | 'Staff';

export function EmployeeManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const activeStore = useStoreStore((s) => s.activeStore);
  const rawRole = useAuthStore((s) => s.user?.role ?? '');
  const canDelete = isStoreOwner(rawRole);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleOption>('Staff');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchEmployees = useCallback(async () => {
    if (!activeStore?.id) return;
    try {
      const data = await hrApi.getEmployees(activeStore.id, { paging: 1 });
      setEmployees(data);
    } catch (error) {
      console.error('[EmployeeManagementScreen.fetchEmployees] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách nhân viên' });
    }
  }, [activeStore?.id]);

  useEffect(() => {
    setLoading(true);
    fetchEmployees().finally(() => setLoading(false));
  }, [fetchEmployees]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  };

  const keyExtractor = useCallback((item: Employee) => item.id, []);

  const renderEmployeeItem = useCallback(
    ({ item }: { item: Employee }) => (
      <View className="mb-3 rounded-2xl bg-surface p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">{item.fullName}</Text>
            <Text className="text-xs text-muted">{item.position || 'Nhân viên'} • {item.userName}</Text>
            <Text className="text-xs text-muted">{item.joinDate ? new Date(item.joinDate).toLocaleDateString('vi-VN') : 'N/A'}</Text>
          </View>
          <View className="items-end">
            <View
              className="rounded-md px-2 py-0.5"
              style={{ backgroundColor: item.isActive ? COLORS.successLight : COLORS.errorLight }}>
              <Text
                className="text-[10px] font-semibold"
                style={{ color: item.isActive ? COLORS.success : COLORS.error }}>
                {item.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-3 flex-row gap-2">
          <TouchableOpacity
            className="flex-1 items-center rounded-lg border border-border py-2"
            onPress={() => openEditModal(item)}>
            <Text className="text-sm font-semibold text-foreground">Sửa</Text>
          </TouchableOpacity>
          {canDelete && (
            <TouchableOpacity
              className="flex-1 items-center rounded-lg py-2"
              style={{ backgroundColor: item.isActive ? COLORS.errorLight : COLORS.successLight }}
              onPress={() => handleToggleActive(item)}>
              <Text
                className="text-sm font-semibold"
                style={{ color: item.isActive ? COLORS.error : COLORS.success }}>
                {item.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    ),
    [canDelete],
  );

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFullName(employee.fullName || '');
    setPosition(employee.position || '');
    setBaseSalary(employee.baseSalary ? String(employee.baseSalary) : '');
    setShowEditModal(true);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !activeStore?.id) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập email và chọn cửa hàng' });
      return;
    }

    setSubmittingInvite(true);
    try {
      await hrApi.inviteEmployee(inviteEmail.trim(), inviteRole, activeStore.id);
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Invitation sent' });
      setInviteEmail('');
      setInviteRole('Staff');
      setShowInviteModal(false);
      await fetchEmployees();
    } catch (error) {
      console.error('[EmployeeManagementScreen.handleInvite] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không gửi được lời mời' });
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee) return;

    setSubmittingEdit(true);
    try {
      const updated = await hrApi.updateEmployee(editingEmployee.id, {
        fullName: fullName.trim() || undefined,
        position: position.trim() || undefined,
        baseSalary: baseSalary.trim() ? Number(baseSalary) : undefined,
      });

      setEmployees((prev) => prev.map((emp) => (emp.id === updated.id ? updated : emp)));
      setShowEditModal(false);
      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã cập nhật nhân viên' });
    } catch (error) {
      console.error('[EmployeeManagementScreen.handleSaveEdit] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Cập nhật nhân viên thất bại' });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleActive = async (employee: Employee) => {
    if (!canDelete) return;
    try {
      const updated = await hrApi.updateEmployee(employee.id, { isActive: !employee.isActive });
      setEmployees((prev) => prev.map((emp) => (emp.id === updated.id ? updated : emp)));
      Toast.show({
        type: 'success',
        text1: employee.isActive ? 'Đã vô hiệu hóa' : 'Đã kích hoạt',
      });
    } catch (error) {
      console.error('[EmployeeManagementScreen.handleToggleActive] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể thay đổi trạng thái' });
    }
  };

  const sorted = useMemo(
    () => [...employees].sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    [employees],
  );

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Quản lý nhân sự"
        subtitle={`${employees.length} nhân sự`}
        topInset={insets.top}
        showBackButton
        rightSlot={
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: COLORS.primaryLight }}
            onPress={() => setShowInviteModal(true)}>
            <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          renderItem={renderEmployeeItem}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text className="mt-3 text-base text-muted">Chưa có nhân viên nào</Text>
            </View>
          }
        />
      )}

      <Modal visible={showInviteModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-surface p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <Text className="mb-4 text-lg font-bold text-foreground">Mời nhân viên</Text>

            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />

            <View className="mb-4 flex-row gap-2">
              {(['Staff', 'Manager'] as RoleOption[]).map((role) => {
                const active = inviteRole === role;
                return (
                  <TouchableOpacity
                    key={role}
                    className="flex-1 items-center rounded-xl py-2.5"
                    style={{ backgroundColor: active ? COLORS.primary : COLORS.bg }}
                    onPress={() => setInviteRole(role)}>
                    <Text
                      className="font-semibold"
                      style={{ color: active ? '#fff' : COLORS.textSecondary }}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl border border-border py-3"
                onPress={() => setShowInviteModal(false)}>
                <Text className="font-semibold text-muted">Hủy</Text>
              </TouchableOpacity>
              <PrimaryButton
                label="Gửi lời mời"
                loading={submittingInvite}
                onPress={handleInvite}
                className="flex-1 items-center justify-center rounded-xl"
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-surface p-6" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <Text className="mb-4 text-lg font-bold text-foreground">Sửa nhân viên</Text>

            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Họ tên"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Vị trí"
              value={position}
              onChangeText={setPosition}
            />
            <TextInput
              className="mb-4 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
              placeholder="Lương cơ bản"
              keyboardType="numeric"
              value={baseSalary}
              onChangeText={setBaseSalary}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl border border-border py-3"
                onPress={() => setShowEditModal(false)}>
                <Text className="font-semibold text-muted">Hủy</Text>
              </TouchableOpacity>
              <PrimaryButton
                label="Lưu"
                loading={submittingEdit}
                onPress={handleSaveEdit}
                className="flex-1 items-center justify-center rounded-xl"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
