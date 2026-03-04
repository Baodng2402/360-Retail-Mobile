import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';

// =============================================
// TimekeepingScreen — Chấm công (UI Skeleton)
//
// Theo yêu cầu: chỉ tạo sườn UI, logic handle sau.
// =============================================

type Props = StackScreenProps<MoreStackParamList, 'Timekeeping'>;

export function TimekeepingScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-foreground">Chấm công</Text>
                </View>
            </View>

            {/* Today status card */}
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

                {/* Check-in / Check-out buttons */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        className="flex-1 items-center rounded-xl py-4"
                        style={{ backgroundColor: COLORS.successLight }}
                        activeOpacity={0.7}>
                        <Ionicons name="log-in-outline" size={24} color={COLORS.success} />
                        <Text className="mt-1 text-sm font-semibold" style={{ color: COLORS.success }}>
                            Check-in
                        </Text>
                        <Text className="mt-0.5 text-xs text-muted">--:--</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 items-center rounded-xl py-4"
                        style={{ backgroundColor: COLORS.errorLight }}
                        activeOpacity={0.7}>
                        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                        <Text className="mt-1 text-sm font-semibold" style={{ color: COLORS.error }}>
                            Check-out
                        </Text>
                        <Text className="mt-0.5 text-xs text-muted">--:--</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Work hours summary */}
            <View className="mx-4 mt-3 flex-row gap-3">
                <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                    <Text className="text-2xl font-bold text-foreground">0h</Text>
                    <Text className="mt-1 text-xs text-muted">Giờ làm hôm nay</Text>
                </View>
                <View className="flex-1 items-center rounded-2xl bg-surface p-4">
                    <Text className="text-2xl font-bold text-foreground">0</Text>
                    <Text className="mt-1 text-xs text-muted">Ngày công tháng này</Text>
                </View>
            </View>

            {/* History placeholder */}
            <View className="mx-4 mt-4">
                <Text className="mb-3 text-base font-semibold text-foreground">Lịch sử chấm công</Text>
                <View className="items-center rounded-2xl bg-surface py-10">
                    <Ionicons name="time-outline" size={40} color={COLORS.textMuted} />
                    <Text className="mt-2 text-sm text-muted">Tính năng đang phát triển</Text>
                    <Text className="mt-1 text-xs text-muted">GPS + Selfie check-in sẽ sớm có mặt</Text>
                </View>
            </View>
        </View>
    );
}
