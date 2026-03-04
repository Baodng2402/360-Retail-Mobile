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
        <View className="mb-2 mt-2 rounded-3xl bg-surface p-5 border border-border shadow-sm">
            <View className="flex-row justify-between items-start">
                <View>
                    <View className="flex-row items-baseline mb-1">
                        <Text className="text-4xl font-black text-foreground tracking-tighter">{count}</Text>
                        <Text className="ml-1 text-sm font-semibold text-muted">sản phẩm</Text>
                    </View>
                    <Text className="text-xs font-semibold text-muted">Đã bán tháng này</Text>
                </View>
                <View className="w-12 h-12 rounded-2xl bg-cyan-100 items-center justify-center opacity-90">
                    <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
                </View>
            </View>
            <View className="mt-5">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-[11px] font-semibold text-muted">Tiến độ mục tiêu</Text>
                    <Text className="text-[11px] font-bold text-cyan-600">{percentage}%</Text>
                </View>
                <Progress value={percentage} />
            </View>
        </View>
    );
}

export const SoldSummaryCard = memo(SoldSummaryCardComponent);
