import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { OrderHistoryCard, TabChip } from '@/src/components/ui';
import { orders } from '@/src/data/mockData';
import { formatDate, formatCurrency } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';

export function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs = ['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đang giao', 'Hoàn thành'];
    const statusMap: Record<string, string> = {
        'Chờ xử lý': 'pending', 'Đang xử lý': 'processing',
        'Đang giao': 'shipping', 'Hoàn thành': 'completed',
    };

    const filteredOrders = orders.filter((o) => {
        const matchTab = activeTab === 'Tất cả' || o.status === statusMap[activeTab];
        const matchSearch = !searchQuery ||
            o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchTab && matchSearch;
    });

    return (
        <View className="flex-1 bg-bg">
            <View className="bg-surface border-b border-divider px-5 pb-3" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-extrabold text-foreground">Đơn Hàng</Text>
                    <TouchableOpacity className="w-10 h-10 rounded-xl bg-bg items-center justify-center"
                        activeOpacity={0.7} onPress={() => Toast.show({ type: 'info', text1: 'Bộ lọc', text2: 'Sắp có' })}>
                        <Ionicons name="options-outline" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
                <View className="flex-row items-center bg-bg rounded-xl px-3.5 h-11 mt-3">
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <TextInput className="flex-1 text-sm text-foreground ml-2.5"
                        placeholder="Tìm đơn hàng..." placeholderTextColor={COLORS.textMuted}
                        value={searchQuery} onChangeText={setSearchQuery} />
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                className="bg-surface border-b border-divider grow-0"
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                {tabs.map((tab) => (
                    <TabChip key={tab} label={tab} isActive={activeTab === tab} onPress={() => setActiveTab(tab)} />
                ))}
            </ScrollView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                {filteredOrders.map((order) => (
                    <OrderHistoryCard key={order.id} code={order.code}
                        customerName={order.customerName || 'Không rõ'} date={formatDate(order.createdAt)}
                        itemCount={order.itemCount || 0} amount={formatCurrency(order.totalAmount)}
                        status={order.status}
                        onPress={() => Toast.show({ type: 'info', text1: `Đơn ${order.code}`, text2: `${order.customerName} - ${formatCurrency(order.totalAmount)}` })} />
                ))}
                {filteredOrders.length === 0 && (
                    <View className="items-center pt-16">
                        <Ionicons name="receipt-outline" size={48} color={COLORS.textLight} />
                        <Text className="text-base text-muted mt-3">Không tìm thấy đơn hàng</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
