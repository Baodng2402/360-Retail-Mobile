import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { Progress } from '@/src/components/ui/progress';
import { COLORS } from '@/src/constants/colors';

// =============================================
// SoldSummaryCard — monthly sold progress
// =============================================

interface SoldSummaryCardProps {
    count: number;
    percentage: number;
}

function SoldSummaryCardComponent({ count, percentage }: SoldSummaryCardProps) {
    return (
        <View className="mt-2 rounded-2xl bg-surface p-4 shadow-sm">
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-[13px] font-medium text-muted">Đã bán tháng này</Text>
                    <View className="flex-row items-baseline mt-1">
                        <Text className="text-[28px] font-extrabold text-foreground">{count}</Text>
                        <Text className="ml-1 text-[13px] text-muted">sản phẩm</Text>
                    </View>
                </View>
                <View className="w-11 h-11 rounded-[14px] bg-cyan-100 items-center justify-center">
                    <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
                </View>
            </View>
            <View className="mt-3">
                <View className="flex-row justify-between mb-1.5">
                    <Text className="text-xs text-muted">Tiến độ mục tiêu</Text>
                    <Text className="text-xs font-bold text-cyan-600">{percentage}%</Text>
                </View>
                <Progress value={percentage} />
            </View>
        </View>
    );
}

export const SoldSummaryCard = memo(SoldSummaryCardComponent);
