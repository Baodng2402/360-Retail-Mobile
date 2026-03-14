import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { feedbackApi } from '@/src/api';
import { ScreenHeader } from '@/src/components';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import type { Feedback, FeedbackSummary } from '@/src/types';
import { formatRelativeTime } from '@/src/utils/format';

type Props = StackScreenProps<MoreStackParamList, 'Feedback'>;

function RatingBar({ star, count, max }: { star: number; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <View className="mb-2 flex-row items-center">
      <Text className="w-8 text-sm font-semibold text-foreground">{star}★</Text>
      <View className="mx-2 h-3 flex-1 rounded-full bg-bg">
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS.warning }} />
      </View>
      <Text className="w-8 text-right text-sm text-muted">{count}</Text>
    </View>
  );
}

export function FeedbackScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [list, sum] = await Promise.all([
        feedbackApi.getFeedback({
          fromDate: fromDate.trim() || undefined,
          toDate: toDate.trim() || undefined,
          paging: 1,
          pageSize: 30,
        }),
        feedbackApi.getFeedbackSummary(),
      ]);
      setFeedbacks(list);
      setSummary(sum);
    } catch (error) {
      console.error('[FeedbackScreen.fetchData] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tải được dữ liệu feedback' });
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const maxDistribution = useMemo(() => {
    const dist = summary?.distribution ?? {};
    return Math.max(1, ...Object.values(dist).map((v) => Number(v)));
  }, [summary]);

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader
        title="Đánh giá khách hàng"
        subtitle={`${summary?.totalCount ?? 0} phản hồi`}
        topInset={insets.top}
        showBackButton
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <View>
              <View className="mb-4 rounded-2xl bg-surface p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={24} color={COLORS.warning} />
                    <Text className="ml-2 text-2xl font-bold text-foreground">
                      {summary?.avgRating?.toFixed(1) ?? '0.0'}
                    </Text>
                  </View>
                  <Text className="text-sm text-muted">{summary?.totalCount ?? 0} phản hồi</Text>
                </View>

                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar
                    key={star}
                    star={star}
                    count={Number(summary?.distribution?.[String(star)] ?? 0)}
                    max={maxDistribution}
                  />
                ))}
              </View>

              <View className="mb-4 rounded-2xl bg-surface p-4">
                <Text className="mb-2 text-sm font-semibold text-foreground">Lọc theo ngày (YYYY-MM-DD)</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground"
                    placeholder="Từ ngày"
                    value={fromDate}
                    onChangeText={setFromDate}
                  />
                  <TextInput
                    className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm text-foreground"
                    placeholder="Đến ngày"
                    value={toDate}
                    onChangeText={setToDate}
                  />
                </View>
                <TouchableOpacity
                  className="mt-3 items-center rounded-lg py-2.5"
                  style={{ backgroundColor: COLORS.primary }}
                  onPress={fetchData}>
                  <Text className="font-semibold text-white">Áp dụng bộ lọc</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-2xl bg-surface p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-foreground">{item.customerName}</Text>
                <Text className="text-sm text-muted">{formatRelativeTime(item.createdAt)}</Text>
              </View>
              <Text className="mt-1 text-sm">{'★'.repeat(item.rating)}</Text>
              <Text className="mt-2 text-sm text-muted">{item.content || 'Không có nội dung'}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="chatbox-ellipses-outline" size={48} color={COLORS.textMuted} />
              <Text className="mt-3 text-base text-muted">Chưa có phản hồi nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
