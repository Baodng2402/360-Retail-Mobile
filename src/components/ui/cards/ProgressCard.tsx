import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { COLORS } from '@/src/constants/colors';

// =============================================
// ProgressCard — circular progress ring
// =============================================

interface ProgressCardProps {
    percentage: number;
    label: string;
    value: string;
    color?: string;
}

function ProgressCardComponent({ percentage, label, value, color }: ProgressCardProps) {
    const ringColor = color || COLORS.primary;
    return (
        <View className="mx-1 mb-2 flex-1 items-center rounded-3xl bg-surface p-5 border border-border shadow-sm">
            <View
                className="w-[72px] h-[72px] rounded-full items-center justify-center mb-3"
                style={{ borderWidth: 6, borderColor: ringColor + '20' }}
            >
                <View
                    className="absolute w-[72px] h-[72px] rounded-full"
                    style={{
                        borderWidth: 6,
                        borderColor: 'transparent',
                        borderTopColor: ringColor,
                        borderRightColor: percentage > 25 ? ringColor : 'transparent',
                        borderBottomColor: percentage > 50 ? ringColor : 'transparent',
                        borderLeftColor: percentage > 75 ? ringColor : 'transparent',
                    }}
                />
                <Text className="text-lg font-black tracking-tighter" style={{ color: ringColor }}>
                    {percentage}%
                </Text>
            </View>
            <Text className="text-center text-[10px] uppercase font-bold text-muted mb-1">{label}</Text>
            <Text className="text-[22px] font-black text-foreground tracking-tight">{value}</Text>
        </View>
    );
}

export const ProgressCard = memo(ProgressCardComponent);
