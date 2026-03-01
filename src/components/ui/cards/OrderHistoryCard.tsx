import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Badge } from '@/src/components/ui/badge';

// =============================================
// OrderHistoryCard — order list item
// =============================================

const STATUS_MAP: Record<string, { variant: 'warning' | 'info' | 'default' | 'success' | 'error'; text: string }> = {
    pending: { variant: 'warning', text: 'Chờ xử lý' },
    processing: { variant: 'info', text: 'Đang xử lý' },
    shipping: { variant: 'default', text: 'Đang giao' },
    completed: { variant: 'success', text: 'Hoàn thành' },
    cancelled: { variant: 'error', text: 'Đã hủy' },
};

interface OrderHistoryCardProps {
    code: string;
    customerName: string;
    date: string;
    itemCount: number;
    amount: string;
    status: string;
    onPress?: () => void;
}

export function OrderHistoryCard({
    code, customerName, date, itemCount, amount, status, onPress,
}: OrderHistoryCardProps) {
    const s = STATUS_MAP[status] || STATUS_MAP.pending;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white rounded-[14px] p-3.5 mb-2 shadow-sm"
        >
            <View className="flex-row items-center">
                <View className="w-11 h-11 rounded-full bg-cyan-100 items-center justify-center">
                    <Text className="text-base font-bold text-cyan-700">
                        {customerName.charAt(0)}
                    </Text>
                </View>
                <View className="flex-1 ml-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-[15px] font-bold text-slate-800">Đơn {code}</Text>
                        <Badge variant={s.variant} label={s.text} />
                    </View>
                    <Text className="text-[13px] text-gray-400 mt-0.5">{customerName}</Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-gray-100">
                <Text className="text-xs text-gray-400">{date} • {itemCount} sản phẩm</Text>
                <Text className="text-[15px] font-extrabold text-slate-800">{amount}</Text>
            </View>
        </TouchableOpacity>
    );
}
