import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { apiClient } from '@/src/api/client';
import { useAuthStore, useStoreStore } from '@/src/stores';
import { isStoreOwner } from '@/src/utils/role';
import { COLORS } from '@/src/constants/colors';
import type { Store, CreateStoreDto, Plan } from '@/src/types';
import type { MoreStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<MoreStackParamList, 'StoreManagement'>;

// =============================================
// Quản Lý Cửa Hàng — Dùng chung data từ useStoreStore
// Web endpoint:  GET /saas/stores (all) hoặc /saas/stores/my-owned-stores (owned)
// Mobile:        Tận dụng useStoreStore.stores (đã fetch khi app mở)
// =============================================

export function StoreManagementScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    
    // Authorization
    const rawRole = useAuthStore((s) => s.user?.role ?? '');
    const isOwnerRole = isStoreOwner(rawRole);

    // Lấy stores từ global store (đã fetch sẵn khi app chạy)
    const globalStores = useStoreStore((s) => s.stores);
    const fetchStores = useStoreStore((s) => s.fetchStores);
    const isGlobalLoading = useStoreStore((s) => s.isLoading);
    const switchStore = useStoreStore((s) => s.switchStore);
    const activeStore = useStoreStore((s) => s.activeStore);

    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formName, setFormName] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formPlanId, setFormPlanId] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);

    // Fetch plans once
    useEffect(() => {
        apiClient.get('/saas/subscriptions/plans')
            .then(res => setPlans(res.data?.data || []))
            .catch(() => console.log('Failed to fetch plans'));
    }, []);

    // Đồng bộ stores từ global store
    useEffect(() => {
        setStores(globalStores);
        setLoading(isGlobalLoading);
    }, [globalStores, isGlobalLoading]);

    // Fetch lại khi mở screen (để luôn có data mới nhất)
    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStores();
        setRefreshing(false);
    };

    const handleCreate = async () => {
        if (!formName.trim()) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập tên cửa hàng' });
            return;
        }
        setSaving(true);
        try {
            const dto: CreateStoreDto = {
                storeName: formName.trim(),
                address: formAddress.trim() || undefined,
                phone: formPhone.trim() || undefined,
                planId: formPlanId || undefined,
            };
            // Web dùng: POST /saas/stores — giống mobile
            await apiClient.post('/saas/stores', dto);

            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã tạo cửa hàng mới' });
            setShowModal(false);
            setFormName(''); setFormAddress(''); setFormPhone(''); setFormPlanId('');
            // Refresh global store để tất cả screens cập nhật
            fetchStores();
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message || 'Tạo thất bại' });
        } finally {
            setSaving(false);
        }
    };

    const handleSwitchStore = async (storeId: string) => {
        const success = await switchStore(storeId);
        if (success) {
            Toast.show({ type: 'success', text1: 'Chuyển cửa hàng', text2: 'Đã tải dữ liệu phân vùng mới!' });
            fetchStores(); // fetch to re-evaluate active vs owned list if needed
        } else {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Chuyển cửa hàng thất bại' });
        }
    };

    const renderStore = ({ item }: { item: Store }) => {
        const isCurrentActive = activeStore?.id === item.id;

        return (
            <View className={`mb-3 rounded-2xl p-4 border ${isCurrentActive ? 'bg-primaryLight border-primary' : 'bg-surface border-transparent'}`}>
                <View className="flex-row items-center">
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: Object.assign({}, COLORS).primaryLight || '#e6f0ff' }}>
                        <Ionicons name="storefront" size={22} color={COLORS.primary} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">{item.storeName}</Text>
                        {item.address && <Text className="text-xs text-muted">{item.address}</Text>}
                        {item.phone && <Text className="text-xs text-muted">{item.phone}</Text>}
                    </View>

                    <View className="items-end">
                        <View className="mb-2 rounded-md px-2 py-0.5" style={{ backgroundColor: item.isActive ? COLORS.successLight : COLORS.errorLight }}>
                            <Text className="text-[10px] font-semibold" style={{ color: item.isActive ? COLORS.success : COLORS.error }}>
                                {item.isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </View>

                        {isCurrentActive ? (
                            <View className="rounded-lg bg-primary/10 px-3 py-1">
                                <Text className="text-xs font-bold text-primary">Đang chọn</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                className="rounded-lg border border-primary px-4 py-1"
                                onPress={() => handleSwitchStore(item.id)}
                            >
                                <Text className="text-xs font-semibold text-primary">Chuyển</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-bg">
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-foreground">Cửa hàng</Text>
                    </View>
                    {isOwnerRole && (
                        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: COLORS.primaryLight }}
                            activeOpacity={0.7} onPress={() => setShowModal(true)}>
                            <Ionicons name="add" size={22} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <FlatList data={stores} renderItem={renderStore} keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <Ionicons name="storefront-outline" size={48} color={COLORS.textMuted} />
                            <Text className="mt-3 text-base text-muted">Chưa có cửa hàng nào</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={showModal} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="rounded-t-3xl bg-surface p-6">
                        <Text className="mb-4 text-lg font-bold text-foreground">Tạo cửa hàng mới</Text>
                        <TextInput className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                            placeholder="Tên cửa hàng *" placeholderTextColor={COLORS.textMuted} value={formName} onChangeText={setFormName} />
                        <TextInput className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                            placeholder="Địa chỉ" placeholderTextColor={COLORS.textMuted} value={formAddress} onChangeText={setFormAddress} />
                        <TextInput className="mb-4 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                            placeholder="SĐT" placeholderTextColor={COLORS.textMuted} keyboardType="phone-pad" value={formPhone} onChangeText={setFormPhone} />

                        <Text className="mb-2 text-sm font-semibold text-foreground">Chọn gói dịch vụ (Tùy chọn)</Text>
                        <View className="flex-row flex-wrap mb-4">
                            {plans.map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${formPlanId === p.id ? 'border-primary bg-primaryLight' : 'border-border'}`}
                                    onPress={() => setFormPlanId(p.id)}
                                >
                                    <Text style={{ color: formPlanId === p.id ? COLORS.primaryDark : COLORS.text }} className="text-xs font-semibold">{p.planName}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity className="flex-1 items-center rounded-xl border border-border py-3" onPress={() => setShowModal(false)} activeOpacity={0.7}>
                                <Text className="font-semibold text-muted">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 items-center rounded-xl py-3" style={{ backgroundColor: COLORS.primary }}
                                onPress={handleCreate} disabled={saving} activeOpacity={0.7}>
                                <Text className="font-semibold text-white">{saving ? 'Đang tạo...' : 'Tạo mới'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
