import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';
import { formatCurrency } from '@/src/utils/format';

// =============================================
// ProductCard — POS product grid item
// =============================================

interface ProductCardProps {
    name: string;
    price: number;
    stock: number;
    onPress?: () => void;
    onAddToCart?: () => void;
}

export function ProductCard({ name, price, stock, onPress, onAddToCart }: ProductCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-1 bg-white rounded-2xl overflow-hidden m-1 shadow-sm"
        >
            <View className="w-full aspect-square bg-slate-100 items-center justify-center">
                <Ionicons name="phone-portrait-outline" size={40} color={COLORS.textMuted} />
            </View>
            <View className="p-3">
                <Text className="text-[13px] font-semibold text-slate-800 h-9" numberOfLines={2}>
                    {name}
                </Text>
                <Text className="text-[11px] text-gray-400 mt-0.5">Còn {stock}</Text>
                <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-sm font-extrabold text-cyan-600">
                        {formatCurrency(price)}
                    </Text>
                    <TouchableOpacity
                        onPress={onAddToCart}
                        className="w-[30px] h-[30px] rounded-lg bg-cyan-500 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}
