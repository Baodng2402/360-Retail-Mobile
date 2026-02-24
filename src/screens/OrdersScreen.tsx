import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { TabChip } from '@/src/components/ui';
import { orders } from '@/src/data/mockData';
import { formatCurrency, formatRelativeTime, getStatusInfo } from '@/src/utils/format';
import { COLORS } from '@/src/constants/colors';

export function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { key: 'all', label: 'Tất cả', count: orders.length },
        { key: 'pending', label: 'Chờ xử lý', count: orders.filter(o => o.status === 'pending').length },
        { key: 'processing', label: 'Đang xử lý', count: orders.filter(o => o.status === 'processing').length },
        { key: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.status === 'completed').length },
    ];

    const filteredOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

    return (
        <View className="flex-1 bg-slate-50">
            <View className="bg-white" style={{ paddingTop: insets.top + 12 }}>
                <View className="px-5 pb-4 flex-row justify-between items-center">
                    <Text className="text-2xl font-extrabold text-slate-800">Đơn hàng</Text>
                    <TouchableOpacity
                        className="w-11 h-11 rounded-full bg-slate-100 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => Toast.show({ type: 'info', text1: 'Bộ lọc', text2: 'Coming soon...' })}
                    >
                        <Ionicons name="filter" size={22} color="#475569" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
            >
                {tabs.map(tab => (
                    <TabChip
                        key={tab.key}
                        label={tab.label}
                        count={tab.count}
                        isActive={activeTab === tab.key}
                        onPress={() => setActiveTab(tab.key)}
                    />
                ))}
            </ScrollView>

            <ScrollView
                className="flex-1 px-5 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {filteredOrders.map(order => {
                    const status = getStatusInfo(order.status);
                    return (
                        <TouchableOpacity
                            key={order.id}
                            className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                            activeOpacity={0.7}
                            onPress={() => Toast.show({ type: 'info', text1: order.code, text2: `${order.customerName} - ${formatCurrency(order.totalAmount)}` })}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
                                    <Text className="text-base font-bold text-slate-800 ml-1.5">{order.code}</Text>
                                </View>
                                <View className={`w-3 h-3 rounded-full`} style={{ backgroundColor: status.color.includes('green') ? COLORS.success : status.color.includes('blue') ? COLORS.blue : status.color.includes('amber') ? COLORS.warning : COLORS.error }} />
                            </View>

                            <View className="flex-row items-center mb-3">
                                <View className="w-11 h-11 rounded-full bg-teal-50 items-center justify-center">
                                    <Text className="text-base font-bold text-teal-700">{order.customerName?.charAt(0)}</Text>
                                </View>
                                <View className="ml-3">
                                    <Text className="text-base font-semibold text-slate-800">{order.customerName}</Text>
                                    <Text className="text-sm text-slate-400 mt-0.5">{formatRelativeTime(order.createdAt)} trước</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
                                <Text className="text-sm text-slate-400">{order.itemCount} sản phẩm</Text>
                                <Text className="text-lg font-extrabold text-teal-500">{formatCurrency(order.totalAmount)}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
