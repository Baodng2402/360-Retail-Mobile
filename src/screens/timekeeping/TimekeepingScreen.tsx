import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { timekeepingApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import type { TimekeepingHistoryRecord, TodayTimekeepingResponse } from '@/src/types';
import { useSubscriptionStore } from '@/src/stores';
import { formatRelativeTime } from '@/src/utils/format';

type Props = StackScreenProps<MoreStackParamList, 'Timekeeping'>;

export function TimekeepingScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const canUseGpsAttendance = useSubscriptionStore((s) => s.canUse('gpsAttendance'));

    const [today, setToday] = useState<TodayTimekeepingResponse | null>(null);
    const [history, setHistory] = useState<TimekeepingHistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selfieUri, setSelfieUri] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [todayData, historyData] = await Promise.all([
                timekeepingApi.getTodayStatus(),
                timekeepingApi.getTimekeepingHistory({ paging: 1 }),
            ]);

            setToday(todayData);
            setHistory(historyData);
        } catch (error) {
            console.error('[TimekeepingScreen.fetchData] Failed:', error);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không tải được dữ liệu chấm công' });
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

    const getCurrentLocation = async () => {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
            throw new Error('Location permission denied');
        }

        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
    };

    const pickSelfie = async () => {
        try {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraPermission.status !== 'granted') {
                Toast.show({ type: 'info', text1: 'Cần quyền camera để chụp selfie' });
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.7,
            });

            if (!result.canceled && result.assets?.length) {
                setSelfieUri(result.assets[0].uri);
                Toast.show({ type: 'success', text1: 'Đã chọn selfie' });
            }
        } catch (error) {
            console.error('[TimekeepingScreen.pickSelfie] Failed:', error);
            Toast.show({ type: 'error', text1: 'Không thể mở camera' });
        }
    };

    const doCheckInOut = async () => {
        if (!canUseGpsAttendance) {
            Toast.show({
                type: 'info',
                text1: 'Cần gói Pro',
                text2: 'Tính năng chấm công GPS chỉ có trên gói Pro trở lên',
            });
            return;
        }

        setSubmitting(true);
        try {
            const location = await getCurrentLocation();

            if (!today?.hasCheckedIn) {
                let uploadedSelfieUrl: string | undefined;

                if (selfieUri) {
                    const file = {
                        uri: selfieUri,
                        name: `selfie-${Date.now()}.jpg`,
                        type: 'image/jpeg',
                    } as any;
                    const uploaded = await timekeepingApi.uploadSelfie(file);
                    uploadedSelfieUrl = uploaded.url;
                }

                await timekeepingApi.checkIn(location.latitude, location.longitude, uploadedSelfieUrl);
                Toast.show({ type: 'success', text1: 'Check-in thành công' });
            } else if (!today.hasCheckedOut) {
                const result = await timekeepingApi.checkOut(location.latitude, location.longitude);
                Toast.show({
                    type: 'success',
                    text1: 'Check-out thành công',
                    text2: result.workHours !== undefined ? `Work hours: ${result.workHours.toFixed(2)}` : undefined,
                });
            } else {
                Toast.show({ type: 'info', text1: 'Bạn đã hoàn tất chấm công hôm nay' });
            }

            await fetchData();
        } catch (error) {
            console.error('[TimekeepingScreen.doCheckInOut] Failed:', error);
            const err = error as { message?: string };
            Toast.show({ type: 'error', text1: 'Lỗi', text2: err.message || 'Chấm công thất bại' });
        } finally {
            setSubmitting(false);
        }
    };

    const actionLabel = useMemo(() => {
        if (!today?.hasCheckedIn) return 'Check In';
        if (!today.hasCheckedOut) return 'Check Out';
        return 'Completed';
    }, [today]);

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
                    <Text className="text-xl font-bold text-foreground">Chấm công</Text>
                </View>
            </View>

            <View className="mx-4 mt-4 rounded-2xl bg-surface p-5">
                <View className="mb-4 items-center">
                    <View
                        className="mb-3 h-20 w-20 items-center justify-center rounded-full"
                        style={{ backgroundColor: COLORS.primaryLight }}>
                        <Ionicons name="finger-print" size={40} color={COLORS.primary} />
                    </View>
                    <Text className="text-lg font-bold text-foreground">Hôm nay</Text>
                    <Text className="mt-1 text-sm text-muted">
                        {new Date().toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>

                <TouchableOpacity
                    className="items-center rounded-xl py-4"
                    style={{
                        backgroundColor:
                            actionLabel === 'Check In'
                                ? COLORS.successLight
                                : actionLabel === 'Check Out'
                                    ? COLORS.warningLight
                                    : COLORS.bg,
                    }}
                    disabled={submitting || actionLabel === 'Completed'}
                    activeOpacity={0.7}
                    onPress={doCheckInOut}>
                    <Ionicons
                        name={actionLabel === 'Check Out' ? 'log-out-outline' : 'log-in-outline'}
                        size={24}
                        color={actionLabel === 'Check Out' ? COLORS.warning : COLORS.success}
                    />
                    <Text className="mt-1 text-base font-semibold text-foreground">
                        {submitting ? 'Đang xử lý...' : actionLabel}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-3 items-center rounded-xl border border-border py-3"
                    onPress={pickSelfie}
                    activeOpacity={0.7}>
                    <Text className="font-semibold text-foreground">Chụp selfie (tuỳ chọn)</Text>
                </TouchableOpacity>

                {selfieUri && (
                    <View className="mt-3 items-center">
                        <Image
                            source={{ uri: selfieUri }}
                            className="h-24 w-24 rounded-xl"
                            resizeMode="cover"
                        />
                    </View>
                )}
            </View>

            <View className="mx-4 mt-3 flex-row gap-3">
                <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                    <Text className="text-2xl font-bold text-foreground">
                        {today?.record?.workHours ? `${today.record.workHours.toFixed(1)}h` : '0h'}
                    </Text>
                    <Text className="mt-1 text-xs text-muted">Giờ làm hôm nay</Text>
                </View>
                <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                    <Text className="text-2xl font-bold text-foreground">{history.length}</Text>
                    <Text className="mt-1 text-xs text-muted">Ngày công tháng này</Text>
                </View>
            </View>

            <View className="mx-4 mt-4">
                <Text className="mb-3 text-base font-semibold text-foreground">Lịch sử chấm công</Text>
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
                    renderItem={({ item }) => (
                        <View className="mb-2 rounded-xl bg-surface p-3">
                            <Text className="text-sm font-semibold text-foreground">
                                {new Date(item.checkInTime).toLocaleString('vi-VN')}
                            </Text>
                            <Text className="mt-1 text-xs text-muted">
                                {item.checkOutTime
                                    ? `Out: ${new Date(item.checkOutTime).toLocaleString('vi-VN')}`
                                    : 'Chưa check-out'}
                            </Text>
                            <Text className="mt-1 text-xs text-muted">
                                {formatRelativeTime(item.checkInTime)}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center rounded-2xl bg-surface py-10">
                            <Ionicons name="time-outline" size={40} color={COLORS.textMuted} />
                            <Text className="mt-2 text-sm text-muted">Chưa có lịch sử chấm công</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 260 }}
                />
            </View>
        </View>
    );
}
