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
        <View className="mx-1 mb-2 flex-1 rounded-3xl bg-surface p-5 border border-border shadow-sm">
            <View className="flex-row justify-between items-start mb-3">
                <View
                    className="w-10 h-10 rounded-2xl items-center justify-center opacity-90"
                    style={{ backgroundColor: color + '20' }}
                >
                    <Ionicons name={icon as any} size={20} color={color} />
                </View>
                {trend !== undefined && (
                    <View className="flex-row items-center bg-bg px-2 py-1 rounded-full">
                        <Ionicons
                            name={trend >= 0 ? 'arrow-up' : 'arrow-down'}
                            size={12}
                            color={trend >= 0 ? COLORS.success : COLORS.error}
                        />
                        <Text
                            className="text-[10px] font-black ml-1"
                            style={{ color: trend >= 0 ? COLORS.success : COLORS.error }}
                        >
                            {Math.abs(trend)}%
                        </Text>
                    </View>
                )}
            </View>
            <Text className="text-3xl font-black text-foreground tracking-tight">{value}</Text>
            <Text className="text-xs font-semibold text-muted mt-1">{label}</Text>
        </View>
    );
}

export const StatCard = memo(StatCardComponent);
