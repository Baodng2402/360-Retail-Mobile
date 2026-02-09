import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
    label: string;
    value: string;
    icon: string;
    iconColor: string;
    bgColor: string;
}

export function StatCard({ label, value, icon, iconColor, bgColor }: StatCardProps) {
    return (
        <TouchableOpacity
            className="w-[48%] bg-white rounded-2xl p-4 shadow-sm"
            activeOpacity={0.7}
        >
            <View className={`w-12 h-12 rounded-xl items-center justify-center mb-3 ${bgColor}`}>
                <Ionicons name={icon as any} size={24} color={iconColor} />
            </View>
            <Text className="text-2xl font-extrabold text-slate-800">{value}</Text>
            <Text className="text-sm text-slate-500 font-medium mt-0.5">{label}</Text>
        </TouchableOpacity>
    );
}

interface QuickActionProps {
    label: string;
    icon: string;
    iconColor: string;
    bgColor: string;
    onPress?: () => void;
}

export function QuickAction({ label, icon, iconColor, bgColor, onPress }: QuickActionProps) {
    return (
        <TouchableOpacity className="items-center flex-1" activeOpacity={0.7} onPress={onPress}>
            <View className={`w-16 h-16 rounded-2xl items-center justify-center mb-2 ${bgColor}`}>
                <Ionicons name={icon as any} size={28} color={iconColor} />
            </View>
            <Text className="text-xs text-slate-600 font-semibold">{label}</Text>
        </TouchableOpacity>
    );
}

interface OrderCardProps {
    customerName: string;
    avatar: string;
    time: string;
    amount: string;
    statusText: string;
    statusColor: string;
    statusBg: string;
    onPress?: () => void;
}

export function OrderCard({ customerName, avatar, time, amount, statusText, statusColor, statusBg, onPress }: OrderCardProps) {
    return (
        <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow-sm"
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-teal-50 items-center justify-center">
                    <Text className="text-lg font-bold text-teal-700">{avatar}</Text>
                </View>
                <View className="ml-3">
                    <Text className="text-base font-semibold text-slate-800">{customerName}</Text>
                    <Text className="text-xs text-slate-400 mt-0.5">{time}</Text>
                </View>
            </View>
            <View className="items-end">
                <Text className="text-base font-bold text-slate-800">{amount}</Text>
                <View className={`mt-1 px-2.5 py-1 rounded-full ${statusBg}`}>
                    <Text className={`text-xs font-semibold ${statusColor}`}>{statusText}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

interface ProductCardProps {
    name: string;
    price: string;
    stock: number;
    onPress?: () => void;
}

export function ProductCard({ name, price, stock, onPress }: ProductCardProps) {
    const isLowStock = stock <= 10;

    return (
        <TouchableOpacity
            className="w-[48%] bg-white rounded-2xl overflow-hidden shadow-sm"
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View className="w-full aspect-square bg-slate-100 items-center justify-center">
                <Ionicons name="cube-outline" size={48} color="#94A3B8" />
            </View>
            <View className="p-3">
                <Text className="text-sm font-semibold text-slate-800 h-10" numberOfLines={2}>{name}</Text>
                <Text className="text-lg font-extrabold text-teal-500 mt-1">{price}</Text>
                <View className={`self-start mt-2 px-2.5 py-1 rounded-full ${isLowStock ? 'bg-amber-100' : 'bg-green-100'}`}>
                    <Text className={`text-xs font-semibold ${isLowStock ? 'text-amber-600' : 'text-green-600'}`}>
                        Còn {stock}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

interface CategoryChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

export function CategoryChip({ label, isActive, onPress }: CategoryChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full mr-2 ${isActive ? 'bg-teal-500' : 'bg-slate-100'}`}
            activeOpacity={0.7}
        >
            <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}>{label}</Text>
        </TouchableOpacity>
    );
}

interface TabChipProps {
    label: string;
    count: number;
    isActive: boolean;
    onPress: () => void;
}

export function TabChip({ label, count, isActive, onPress }: TabChipProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${isActive ? 'bg-teal-500' : 'bg-slate-100'}`}
            activeOpacity={0.7}
        >
            <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}>{label}</Text>
            <View className={`ml-1.5 px-2 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-slate-200'}`}>
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>{count}</Text>
            </View>
        </TouchableOpacity>
    );
}

interface MenuItemProps {
    icon: string;
    label: string;
    iconColor: string;
    bgColor: string;
    showBorder?: boolean;
    onPress?: () => void;
}

export function MenuItem({ icon, label, iconColor, bgColor, showBorder = true, onPress }: MenuItemProps) {
    return (
        <TouchableOpacity
            className={`flex-row items-center p-4 ${showBorder ? 'border-b border-slate-100' : ''}`}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View className={`w-11 h-11 rounded-xl items-center justify-center ${bgColor}`}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <Text className="flex-1 text-base font-medium text-slate-800 ml-3">{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
    );
}
