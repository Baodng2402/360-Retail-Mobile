import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { apiClient } from '@/src/api/client';
import { COLORS } from '@/src/constants/colors';
import type { MySubscription, Plan } from '@/src/types';
import type { MoreStackParamList } from '@/src/navigation/types';

// Theo yêu cầu: chỉ hiển thị thông tin, mua gói → lên web

type Props = StackScreenProps<MoreStackParamList, 'Subscription'>;

export function SubscriptionScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [subscription, setSubscription] = useState<MySubscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [subRes, planRes] = await Promise.all([
                apiClient.get('/saas/subscriptions/my'),
                apiClient.get('/saas/subscriptions/plans'),
            ]);
            setSubscription(subRes.data?.data || null);
            const pData = planRes.data?.data;
            setPlans(Array.isArray(pData) ? pData : []);
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải thông tin gói' });
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchData().finally(() => setLoading(false));
    }, [fetchData]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const formatDate = (d: string | null) =>
        d ? new Date(d).toLocaleDateString('vi-VN') : 'N/A';

    if (loading) {
        return <View className="flex-1 items-center justify-center bg-bg"><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <View className="flex-1 bg-bg">
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <Text className="text-xl font-bold text-foreground">Gói dịch vụ</Text>
                <Text className="mt-1 text-sm text-muted">Quản lý & nâng cấp gói</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>

                {/* Current subscription */}
                {subscription && (
                    <View className="mb-4 rounded-2xl bg-surface p-5">
                        <Text className="mb-3 text-base font-semibold text-foreground">Gói hiện tại</Text>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>
                                {subscription.planName || 'Chưa đăng ký'}
                            </Text>
                            <View className="rounded-lg px-3 py-1" style={{
                                backgroundColor: subscription.status === 'Active' ? COLORS.successLight : COLORS.warningLight
                            }}>
                                <Text className="text-xs font-semibold" style={{
                                    color: subscription.status === 'Active' ? COLORS.success : COLORS.warning
                                }}>
                                    {subscription.status || 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <View className="mt-3 rounded-xl bg-bg p-3">
                            <InfoRow label="Bắt đầu" value={formatDate(subscription.startDate)} />
                            <InfoRow label="Hết hạn" value={formatDate(subscription.endDate)} />
                            <InfoRow label="Còn lại" value={subscription.daysRemaining !== null ? `${subscription.daysRemaining} ngày` : 'N/A'} />
                        </View>
                    </View>
                )}

                {/* Plans list */}
                <Text className="mb-3 text-base font-semibold text-foreground">Các gói dịch vụ</Text>
                {plans.map((plan) => (
                    <View key={plan.id} className="mb-3 rounded-2xl bg-surface p-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-base font-bold text-foreground">{plan.planName}</Text>
                            {plan.isPopular && (
                                <View className="rounded-md px-2 py-0.5" style={{ backgroundColor: COLORS.accentLight }}>
                                    <Text className="text-[10px] font-bold" style={{ color: COLORS.accent }}>HOT</Text>
                                </View>
                            )}
                        </View>
                        <Text className="mt-1 text-lg font-bold" style={{ color: COLORS.primary }}>
                            {formatPrice(plan.price)}
                        </Text>
                        <Text className="text-xs text-muted">{plan.durationDays} ngày</Text>
                        {plan.description && <Text className="mt-2 text-sm text-muted">{plan.description}</Text>}
                        {Array.isArray(plan.features) && plan.features.length > 0 && (
                            <View className="mt-2">
                                {plan.features.map((f, i) => (
                                    <View key={i} className="flex-row items-center mt-1">
                                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                                        <Text className="ml-1.5 text-xs text-foreground">{f}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                {/* CTA: Lên web mua */}
                <View className="mt-2 items-center rounded-2xl bg-surface p-5">
                    <Ionicons name="globe-outline" size={32} color={COLORS.primary} />
                    <Text className="mt-2 text-center text-sm text-muted">
                        Để mua hoặc nâng cấp gói, vui lòng truy cập trang web
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View className="mb-1 flex-row justify-between">
            <Text className="text-sm text-muted">{label}</Text>
            <Text className="text-sm font-medium text-foreground">{value}</Text>
        </View>
    );
}
