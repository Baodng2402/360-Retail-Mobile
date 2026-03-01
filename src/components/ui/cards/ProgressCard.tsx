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
        <View className="mx-1 flex-1 items-center rounded-2xl bg-surface p-4 shadow-sm">
            <View
                className="w-16 h-16 rounded-full items-center justify-center mb-2.5"
                style={{ borderWidth: 5, borderColor: ringColor + '25' }}
            >
                <View
                    className="absolute w-16 h-16 rounded-full"
                    style={{
                        borderWidth: 5,
                        borderColor: 'transparent',
                        borderTopColor: ringColor,
                        borderRightColor: percentage > 25 ? ringColor : 'transparent',
                        borderBottomColor: percentage > 50 ? ringColor : 'transparent',
                        borderLeftColor: percentage > 75 ? ringColor : 'transparent',
                    }}
                />
                <Text className="text-base font-extrabold" style={{ color: ringColor }}>
                    {percentage}%
                </Text>
            </View>
            <Text className="text-center text-[11px] font-semibold text-muted">{label}</Text>
            <Text className="mt-0.5 text-sm font-bold text-foreground">{value}</Text>
        </View>
    );
}

export const ProgressCard = memo(ProgressCardComponent);
