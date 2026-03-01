import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

// =============================================
// StatCard — dashboard metric card
// Usage: <StatCard label="Doanh thu" value="12.4M" trend={15} />
// =============================================

interface StatCardProps {
    label: string;
    value: string;
    trend?: number;
    icon?: string;
    iconColor?: string;
}

function StatCardComponent({ label, value, trend, icon, iconColor }: StatCardProps) {
    const color = iconColor || COLORS.primary;
    return (
        <View className="mx-1 flex-1 rounded-2xl bg-surface p-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-semibold uppercase text-muted">{label}</Text>
                {icon && (
                    <View
                        className="w-8 h-8 rounded-[10px] items-center justify-center"
                        style={{ backgroundColor: color + '15' }}
                    >
                        <Ionicons name={icon as any} size={16} color={color} />
                    </View>
                )}
            </View>
            <Text className="text-[22px] font-extrabold text-foreground">{value}</Text>
            {trend !== undefined && (
                <View className="flex-row items-center mt-1">
                    <Ionicons
                        name={trend >= 0 ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={trend >= 0 ? COLORS.success : COLORS.error}
                    />
                    <Text
                        className="text-xs font-bold ml-1"
                        style={{ color: trend >= 0 ? COLORS.success : COLORS.error }}
                    >
                        {trend >= 0 ? '+' : ''}{trend}%
                    </Text>
                </View>
            )}
        </View>
    );
}

export const StatCard = memo(StatCardComponent);
