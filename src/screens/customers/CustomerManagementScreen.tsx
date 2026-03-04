import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { crmApi } from '@/src/api';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';
import type { Customer, CreateCustomerDto } from '@/src/types';
import type { MoreStackParamList } from '@/src/navigation/types';

// =============================================
// CustomerManagementScreen — Quản lý Khách hàng
// Roles: Tất cả (xóa: chỉ Owner/Manager)
// =============================================

type Props = StackScreenProps<MoreStackParamList, 'CustomerManagement'>;

export function CustomerManagementScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const userRole = useAuthStore((s) => s.user?.role ?? '');
    const canDelete = userRole === 'StoreOwner' || userRole === 'Manager';

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [saving, setSaving] = useState(false);

    // ──────────── Fetch ────────────
    const fetchCustomers = useCallback(async () => {
        try {
            const res = await crmApi.getCustomers({ pageSize: 100 });
            const raw = res.data?.data;
            const items = raw?.items || (Array.isArray(raw) ? raw : []);
            setCustomers(items);
        } catch {
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

    // ──────────── Create ────────────
    const handleCreate = async () => {
        if (!formName.trim() || !formPhone.trim()) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập tên và SĐT' });
            return;
        }
        setSaving(true);
        try {
            const dto: CreateCustomerDto = {
                fullName: formName.trim(),
                phoneNumber: formPhone.trim(),
                email: formEmail.trim() || undefined,
            };
            await crmApi.createCustomer(dto);
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã tạo khách hàng mới' });
            setShowModal(false);
            setFormName(''); setFormPhone(''); setFormEmail('');
            fetchCustomers();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Tạo khách hàng thất bại';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
        } finally {
            setSaving(false);
        }
    };

    // ──────────── Delete ────────────
    const handleDelete = async (id: string) => {
        try {
            await crmApi.deleteCustomer(id);
            Toast.show({ type: 'success', text1: 'Đã xóa' });
            fetchCustomers();
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Xóa thất bại' });
        }
    };

    // ──────────── Filter ────────────
    const filtered = customers.filter(
        (c) =>
            c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phoneNumber.includes(searchQuery)
    );

    // ──────────── Render ────────────
    const renderCustomer = ({ item }: { item: Customer }) => (
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
                    {item.email && <Text className="text-xs text-muted">{item.email}</Text>}
                </View>
                <View className="items-end">
                    {item.totalOrders !== undefined && (
                        <Text className="text-xs text-muted">{item.totalOrders} đơn</Text>
                    )}
                    {canDelete && (
                        <TouchableOpacity
                            className="mt-1"
                            activeOpacity={0.7}
                            onPress={() => handleDelete(item.id)}>
                            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-xl font-bold text-foreground">Khách hàng</Text>
                            <Text className="text-sm text-muted">{customers.length} khách</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: COLORS.primaryLight }}
                        activeOpacity={0.7}
                        onPress={() => setShowModal(true)}>
                        <Ionicons name="add" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
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

            {/* List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    renderItem={renderCustomer}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                            <Text className="mt-3 text-base text-muted">Chưa có khách hàng nào</Text>
                        </View>
                    }
                />
            )}

            {/* Create Modal */}
            <Modal visible={showModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="rounded-t-3xl bg-surface p-6">
                        <Text className="mb-4 text-lg font-bold text-foreground">Thêm khách hàng</Text>
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
                            placeholder="Email (không bắt buộc)"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formEmail}
                            onChangeText={setFormEmail}
                        />
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 items-center rounded-xl border border-border py-3"
                                activeOpacity={0.7}
                                onPress={() => setShowModal(false)}>
                                <Text className="font-semibold text-muted">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 items-center rounded-xl py-3"
                                style={{ backgroundColor: COLORS.primary }}
                                activeOpacity={0.7}
                                onPress={handleCreate}
                                disabled={saving}>
                                <Text className="font-semibold text-white">{saving ? 'Đang lưu...' : 'Tạo mới'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
