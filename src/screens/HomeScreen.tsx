import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StatCard, QuickAction, OrderCard } from '../components/ui';
import { stores, products, orders, Store } from '../data/mockData';
import { formatCurrency, formatRelativeTime, getStatusInfo } from '../utils/format';
import { COLORS } from '../constants/colors';

interface Props {
    currentStore: Store;
}

export function HomeScreen({ currentStore }: Props) {
    const insets = useSafeAreaInsets();

    const stats = {
        revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0),
        orderCount: orders.length,
        productCount: products.length,
        pending: orders.filter(o => o.status === 'pending').length,
    };

    const handleQuickAction = (action: string) => {
        Toast.show({
            type: 'success',
            text1: action,
            text2: 'Tính năng đang phát triển',
            position: 'top',
        });
    };

    return (
        <View className="flex-1 bg-slate-50">
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 100, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View>
                        <Text className="text-white/75 text-sm font-medium">Xin chào 👋</Text>
                        <Text className="text-white text-2xl font-bold mt-0.5">360 Retail</Text>
                    </View>
                    <TouchableOpacity
                        className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() => Toast.show({ type: 'info', text1: 'Thông báo', text2: 'Không có thông báo mới' })}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                        <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-teal-500" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="flex-row items-center bg-white/20 rounded-2xl px-4 py-3"
                    activeOpacity={0.7}
                    onPress={() => Toast.show({ type: 'info', text1: 'Chọn cửa hàng', text2: 'Coming soon...' })}
                >
                    <View className="w-9 h-9 rounded-xl bg-white/20 items-center justify-center">
                        <Ionicons name="storefront" size={18} color="#fff" />
                    </View>
                    <Text className="flex-1 text-white font-semibold text-sm ml-3">{currentStore.storeName}</Text>
                    <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                className="flex-1 -mt-14 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="flex-row flex-wrap gap-3">
                    <StatCard label="Doanh thu" value={`${(stats.revenue / 1000000).toFixed(1)}M`} icon="trending-up-outline" iconColor={COLORS.primary} bgColor="bg-teal-50" />
                    <StatCard label="Đơn hàng" value={stats.orderCount.toString()} icon="receipt-outline" iconColor={COLORS.accent} bgColor="bg-orange-50" />
                    <StatCard label="Sản phẩm" value={stats.productCount.toString()} icon="cube-outline" iconColor={COLORS.blue} bgColor="bg-blue-50" />
                    <StatCard label="Chờ xử lý" value={stats.pending.toString()} icon="time-outline" iconColor={COLORS.warning} bgColor="bg-amber-50" />
                </View>

                <View className="mt-10">
                    <Text className="text-xl font-bold text-slate-800 mb-4">Thao tác nhanh</Text>
                    <View className="flex-row">
                        <QuickAction label="Tạo đơn" icon="add-circle" iconColor={COLORS.primary} bgColor="bg-teal-50" onPress={() => handleQuickAction('Tạo đơn hàng')} />
                        <QuickAction label="Quét mã" icon="qr-code" iconColor={COLORS.accent} bgColor="bg-orange-50" onPress={() => handleQuickAction('Quét mã QR')} />
                        <QuickAction label="Nhập hàng" icon="download" iconColor={COLORS.success} bgColor="bg-green-50" onPress={() => handleQuickAction('Nhập hàng')} />
                        <QuickAction label="Báo cáo" icon="stats-chart" iconColor={COLORS.blue} bgColor="bg-blue-50" onPress={() => handleQuickAction('Xem báo cáo')} />
                    </View>
                </View>

                <View className="mt-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-slate-800">Đơn hàng gần đây</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                            <Text className="text-teal-500 font-semibold text-sm">Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {orders.slice(0, 3).map((order) => {
                        const status = getStatusInfo(order.status);
                        return (
                            <OrderCard
                                key={order.id}
                                customerName={order.customerName || 'N/A'}
                                avatar={order.customerName?.charAt(0) || '?'}
                                time={`${formatRelativeTime(order.createdAt)} trước`}
                                amount={formatCurrency(order.totalAmount)}
                                statusText={status.text}
                                statusColor={status.color}
                                statusBg={status.bg}
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
