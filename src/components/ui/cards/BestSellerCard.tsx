import { memo } from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { formatCurrency } from '@/src/utils/format';

// =============================================
// BestSellerCard — sales report ranking item
// =============================================

interface BestSellerCardProps {
    rank: number;
    name: string;
    category: string;
    revenue: number;
    trend: number;
}

function BestSellerCardComponent({ rank, name, category, revenue, trend }: BestSellerCardProps) {
    const isTop3 = rank <= 3;

    return (
        <View className="mb-2 flex-row items-center rounded-[14px] bg-surface p-3.5 shadow-sm">
            <View
                className={`w-8 h-8 rounded-[10px] items-center justify-center ${isTop3 ? 'bg-cyan-100' : 'bg-slate-100'
                    }`}
            >
                <Text
                    className={`text-sm font-extrabold ${isTop3 ? 'text-cyan-600' : 'text-gray-400'}`}
                >
                    #{rank}
                </Text>
            </View>
            <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-foreground">{name}</Text>
                <Text className="mt-0.5 text-xs text-muted">{category}</Text>
            </View>
            <View className="items-end">
                <Text className="text-[13px] font-bold text-foreground">{formatCurrency(revenue)}</Text>
                <Text className="text-[11px] font-semibold text-green-500 mt-0.5">+{trend}%</Text>
            </View>
        </View>
    );
}

export const BestSellerCard = memo(BestSellerCardComponent);
