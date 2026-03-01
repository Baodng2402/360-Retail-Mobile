import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Badge } from '@/src/components/ui/badge';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';
import { formatCurrency } from '@/src/utils/format';

// =============================================
// InventoryItem — product list row
// =============================================

const STATUS_MAP: Record<string, { variant: 'success' | 'warning' | 'error'; text: string }> = {
    in_stock: { variant: 'success', text: 'CÒN HÀNG' },
    low_stock: { variant: 'warning', text: 'SẮP HẾT' },
    out_of_stock: { variant: 'error', text: 'HẾT HÀNG' },
};

interface InventoryItemProps {
    name: string;
    sku: string;
    price: number;
    status: string;
    onPress?: () => void;
}

export function InventoryItem({ name, sku, price, status, onPress }: InventoryItemProps) {
    const s = STATUS_MAP[status] || STATUS_MAP.in_stock;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center bg-white rounded-[14px] p-3.5 mb-2 shadow-sm"
        >
            <View className="w-12 h-12 rounded-xl bg-slate-100 items-center justify-center">
                <Ionicons name="phone-portrait-outline" size={22} color={COLORS.textMuted} />
            </View>
            <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-slate-800">{name}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">SKU: {sku}</Text>
            </View>
            <View className="items-end">
                <Text className="text-[13px] font-bold text-slate-800">{formatCurrency(price)}</Text>
                <Badge variant={s.variant} label={s.text} className="mt-1" />
            </View>
        </TouchableOpacity>
    );
}
