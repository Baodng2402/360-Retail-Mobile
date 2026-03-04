import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

// =============================================
// PlaceholderScreen — Màn hình chờ phát triển
// Dùng tạm cho các screens chưa implement
// =============================================

interface PlaceholderScreenProps {
    title: string;
    icon?: string;
    description?: string;
}

export function PlaceholderScreen({
    title,
    icon = 'construct-outline',
    description = 'Tính năng này đang được phát triển',
}: PlaceholderScreenProps) {
    return (
        <View className="flex-1 items-center justify-center bg-bg px-6">
            <View
                className="mb-6 h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.primaryLight }}>
                <Ionicons name={icon as any} size={36} color={COLORS.primary} />
            </View>
            <Text className="text-center text-xl font-bold text-foreground">{title}</Text>
            <Text className="mt-2 text-center text-sm text-muted">{description}</Text>
        </View>
    );
}
