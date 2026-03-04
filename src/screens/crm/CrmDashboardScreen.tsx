import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { crmApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { Feedback, FeedbackSummary } from '@/src/types';
import type { MoreStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<MoreStackParamList, 'CrmDashboard'>;

export function CrmDashboardScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [summary, setSummary] = useState<FeedbackSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [fbRes, sumRes] = await Promise.all([
                crmApi.getFeedbacks({ pageSize: 20 }),
                crmApi.getFeedbackSummary(),
            ]);
            const fbData = fbRes.data?.data;
            setFeedbacks(fbData?.items || (Array.isArray(fbData) ? fbData : []));
            setSummary(sumRes.data?.data || null);
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải dữ liệu CRM' });
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

    const renderStars = (rating: number) => '⭐'.repeat(rating);

    const renderFeedback = ({ item }: { item: Feedback }) => (
        <View className="mb-3 rounded-2xl bg-surface p-4">
            <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-foreground">{item.customerName}</Text>
                <Text className="text-sm">{renderStars(item.rating)}</Text>
            </View>
            {item.content && (
                <Text className="mt-1 text-sm text-muted" numberOfLines={3}>{item.content}</Text>
            )}
            <View className="mt-2 flex-row items-center justify-between">
                <View className="rounded-md px-2 py-0.5" style={{ backgroundColor: COLORS.infoLight }}>
                    <Text className="text-[10px] font-semibold" style={{ color: COLORS.info }}>
                        {item.source}
                    </Text>
                </View>
                <Text className="text-xs text-muted">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-bg">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-bg">
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-foreground">CRM & Loyalty</Text>
                </View>
            </View>

            <FlatList
                data={feedbacks}
                renderItem={renderFeedback}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                ListHeaderComponent={
                    <View className="mb-4 flex-row gap-3">
                        <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                            <Ionicons name="star" size={24} color={COLORS.warning} />
                            <Text className="mt-1 text-xl font-bold text-foreground">
                                {summary?.avgRating?.toFixed(1) || '0.0'}
                            </Text>
                            <Text className="text-xs text-muted">Đánh giá TB</Text>
                        </View>
                        <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                            <Ionicons name="chatbubbles-outline" size={24} color={COLORS.primary} />
                            <Text className="mt-1 text-xl font-bold text-foreground">{summary?.totalCount || 0}</Text>
                            <Text className="text-xs text-muted">Phản hồi</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View className="items-center py-20">
                        <Ionicons name="heart-outline" size={48} color={COLORS.textMuted} />
                        <Text className="mt-3 text-base text-muted">Chưa có phản hồi nào</Text>
                    </View>
                }
            />
        </View>
    );
}
