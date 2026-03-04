import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { crmApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { FeedbackSummary } from '@/src/types';
import type { MoreStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<MoreStackParamList, 'Reports'>;

export function ReportsScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [summary, setSummary] = useState<FeedbackSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await crmApi.getFeedbackSummary();
            setSummary(res.data?.data || null);
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải báo cáo' });
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchSummary().finally(() => setLoading(false));
    }, [fetchSummary]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSummary();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-bg">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const dist = summary?.distribution || {};
    const maxCount = Math.max(...Object.values(dist), 1);

    return (
        <View className="flex-1 bg-bg">
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-foreground">Báo cáo</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
                <View className="flex-row gap-3">
                    <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                        <Ionicons name="star" size={28} color={COLORS.warning} />
                        <Text className="mt-2 text-2xl font-bold text-foreground">
                            {summary?.avgRating?.toFixed(1) || '0.0'}
                        </Text>
                        <Text className="text-xs text-muted">Đánh giá TB</Text>
                    </View>
                    <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                        <Ionicons name="chatbubbles-outline" size={28} color={COLORS.primary} />
                        <Text className="mt-2 text-2xl font-bold text-foreground">{summary?.totalCount || 0}</Text>
                        <Text className="text-xs text-muted">Tổng phản hồi</Text>
                    </View>
                </View>

                <View className="mt-4 rounded-2xl bg-surface p-5">
                    <Text className="mb-4 text-base font-semibold text-foreground">Phân bố đánh giá</Text>
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = dist[String(star)] || 0;
                        const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                            <View key={star} className="mb-2 flex-row items-center">
                                <Text className="w-8 text-sm font-semibold text-foreground">{star}⭐</Text>
                                <View className="mx-2 h-4 flex-1 rounded-full bg-bg">
                                    <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS.primary }} />
                                </View>
                                <Text className="w-8 text-right text-sm text-muted">{count}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
