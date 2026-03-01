import { TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';

// =============================================
// Chip — category/tab filter chip (merged)
// Usage: <Chip label="All" isActive onPress={fn} />
//        <Chip label="Pending" isActive={false} variant="tab" onPress={fn} />
// =============================================

interface ChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
    variant?: 'category' | 'tab';
}

export function CategoryChip({ label, isActive, onPress }: ChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`px-4 py-2 rounded-full mr-2 min-h-[36px] justify-center items-center ${isActive ? 'bg-cyan-500' : 'bg-white border border-gray-200'
                }`}
        >
            <Text className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

export function TabChip({ label, isActive, onPress }: ChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`px-4 py-2 rounded-full mr-2 ${isActive ? 'bg-cyan-500' : 'border border-gray-200'
                }`}
        >
            <Text className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}
