import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { hrApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { Employee } from '@/src/types';
import { useStoreStore } from '@/src/stores/useStoreStore';
import type { MoreStackParamList } from '@/src/navigation/types';

// =============================================
// StaffManagementScreen — Quản lý Nhân sự
// Roles: StoreOwner, Manager
//
// Chức năng: Danh sách NV, tìm kiếm, mời NV mới
// =============================================

type Props = StackScreenProps<MoreStackParamList, 'StaffManagement'>;

export function StaffManagementScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const activeStore = useStoreStore((s) => s.activeStore);

    // ──────────── Fetch data ────────────
    const fetchEmployees = useCallback(async () => {
        try {
            const data = await hrApi.getEmployees(activeStore?.id);
            setEmployees(Array.isArray(data) ? data : []);
        } catch {
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

    // ──────────── Mời nhân viên ────────────
    const handleInvite = async () => {
        if (!inviteEmail.trim() || !activeStore?.id) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Chưa chọn cửa hàng hoặc thiếu email' });
            return;
        }

        setInviting(true);
        try {
            await hrApi.inviteStaff({
                email: inviteEmail.trim(),
                storeId: activeStore.id,
                role: 'Staff'
            });

            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã gửi lời mời qua email' });
            setInviteEmail('');
            setShowInvite(false);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gửi lời mời thất bại';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
        } finally {
            setInviting(false);
        }
    };

    // ──────────── Lọc theo tìm kiếm ────────────
    const filteredEmployees = employees.filter(
        (e) =>
            e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ──────────── Render 1 employee card ────────────
    const renderEmployee = ({ item }: { item: Employee }) => (
        <TouchableOpacity
            className="mb-3 flex-row items-center rounded-2xl bg-surface p-4"
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EmployeeDetail', { employeeId: item.id })}>
            {/* Avatar */}
            <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: item.isActive ? COLORS.primaryLight : COLORS.errorLight }}>
                <Ionicons
                    name="person"
                    size={22}
                    color={item.isActive ? COLORS.primary : COLORS.error}
                />
            </View>

            {/* Info */}
            <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">{item.fullName}</Text>
                <Text className="text-xs text-muted">{item.position || 'Nhân viên'}</Text>
                <Text className="text-xs text-muted">{item.email}</Text>
            </View>

            {/* Status + Arrow */}
            <View className="items-end">
                <View
                    className="mb-1 rounded-md px-2 py-0.5"
                    style={{ backgroundColor: item.isActive ? COLORS.successLight : COLORS.errorLight }}>
                    <Text
                        className="text-[10px] font-semibold"
                        style={{ color: item.isActive ? COLORS.success : COLORS.error }}>
                        {item.isActive ? 'Hoạt động' : 'Ngưng'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View
                className="border-b border-divider bg-surface px-5 pb-4"
                style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-xl font-bold text-foreground">Nhân sự</Text>
                            <Text className="text-sm text-muted">{employees.length} nhân viên</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: COLORS.primaryLight }}
                        activeOpacity={0.7}
                        onPress={() => setShowInvite(!showInvite)}>
                        <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Invite section */}
            {showInvite && (
                <View className="mx-4 mt-3 rounded-2xl bg-surface p-4">
                    <Text className="mb-2 text-sm font-semibold text-foreground">Mời nhân viên mới</Text>
                    <View className="flex-row gap-2">
                        <TextInput
                            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                            placeholder="Email nhân viên"
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                        />
                        <TouchableOpacity
                            className="items-center justify-center rounded-xl px-4"
                            style={{ backgroundColor: COLORS.primary }}
                            activeOpacity={0.7}
                            onPress={handleInvite}
                            disabled={inviting}>
                            <Text className="text-sm font-semibold text-white">
                                {inviting ? '...' : 'Mời'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Search */}
            <View className="mx-4 mt-3 flex-row items-center rounded-xl bg-surface px-4 py-3">
                <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
                <TextInput
                    className="ml-2 flex-1 text-sm text-foreground"
                    placeholder="Tìm nhân viên..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Employee list */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredEmployees}
                    renderItem={renderEmployee}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                            <Text className="mt-3 text-base text-muted">Chưa có nhân viên nào</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
