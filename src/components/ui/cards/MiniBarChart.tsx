import { memo, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

// =============================================
// MiniBarChart — weekly revenue / orders chart
// =============================================

interface MiniBarChartProps {
    data: number[];
    labels: string[];
    height?: number;
    barColor?: string;
    title: string;
    subtitle?: string;
}

function MiniBarChartComponent({ data, labels, height = 120, barColor, title, subtitle }: MiniBarChartProps) {
    const maxVal = useMemo(() => Math.max(...data), [data]);
    const color = barColor || COLORS.primary;
    const bars = useMemo(
        () => data.map((value, index) => {
            const barHeight = maxVal > 0 ? (value / maxVal) * (height - 20) : 0;
            const isHighest = value === maxVal;
            return {
                key: `${labels[index] ?? index}-${index}`,
                value,
                label: labels[index],
                barHeight: Math.max(barHeight, 4),
                isHighest,
                valueLabel: value >= 1_000_000 ? `${(value / 1_000_000).toFixed(0)}tr` : `${value}`,
            };
        }),
        [data, height, labels, maxVal]
    );

    return (
        <View className="mt-2 rounded-2xl bg-surface p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-[15px] font-bold text-foreground">{title}</Text>
                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>
            {subtitle && (
                <Text className="mb-3 text-xs text-muted">{subtitle}</Text>
            )}

            <View className="flex-row items-end gap-1.5" style={{ height }}>
                {bars.map((bar) => {
                    return (
                        <View key={bar.key} className="flex-1 items-center">
                            <Text
                                className="text-[9px] font-bold mb-1"
                                style={{ color: bar.isHighest ? color : COLORS.textMuted }}
                            >
                                {bar.valueLabel}
                            </Text>
                            <View
                                className="w-[80%] rounded-md"
                                style={{
                                    height: bar.barHeight,
                                    backgroundColor: bar.isHighest ? color : color + '40',
                                }}
                            />
                            <Text className="mt-1 text-[9px] text-muted">{bar.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

export const MiniBarChart = memo(MiniBarChartComponent);
