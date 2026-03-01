import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';

// =============================================
// ActivityCard — recent activity feed item
// =============================================

interface ActivityCardProps {
    icon: string;
    iconColor: string;
    title: string;
    subtitle: string;
    time: string;
}

function ActivityCardComponent({ icon, iconColor, title, subtitle, time }: ActivityCardProps) {
    return (
        <View className="mb-2 flex-row items-center rounded-[14px] bg-surface p-3.5 shadow-sm">
            <View
                className="w-[42px] h-[42px] rounded-xl items-center justify-center"
                style={{ backgroundColor: iconColor + '15' }}
            >
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-foreground">{title}</Text>
                <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>
            </View>
            <Text className="text-[11px] text-muted">{time}</Text>
        </View>
    );
}

export const ActivityCard = memo(ActivityCardComponent);
