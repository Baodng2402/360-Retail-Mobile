import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

// =============================================
// MenuItem — profile/settings row
// =============================================

interface MenuItemProps {
    icon: string;
    label: string;
    subtitle?: string;
    iconColor: string;
    showBorder?: boolean;
    onPress?: () => void;
}

export function MenuItem({ icon, label, subtitle, iconColor, showBorder = true, onPress }: MenuItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row items-center py-3.5 px-4 ${showBorder ? 'border-b border-gray-100' : ''}`}
        >
            <View
                className="w-[42px] h-[42px] rounded-xl items-center justify-center"
                style={{ backgroundColor: iconColor + '15' }}
            >
                <Ionicons name={icon as any} size={20} color={iconColor} />
            </View>
            <View className="flex-1 ml-3">
                <Text className="text-[15px] font-medium text-slate-800">{label}</Text>
                {subtitle && (
                    <Text className="text-xs text-gray-400 mt-0.5">{subtitle}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
        </TouchableOpacity>
    );
}
