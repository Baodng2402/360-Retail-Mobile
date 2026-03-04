import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { COLORS } from '@/src/constants/colors';
import { formatCurrency } from '@/src/utils/format';
import { PrimaryButton, ScreenHeader } from '@/src/components';
import { ordersApi } from '@/src/api';
import type { RentalsStackParamList } from '@/src/navigation/types';

type CheckoutScreenRouteProp = RouteProp<RentalsStackParamList, 'Checkout'>;

// Use 'card', 'cash', 'qr' internally, map to API types on submit
type PaymentMethod = 'card' | 'cash' | 'qr';

export function CheckoutScreen() {
    const navigation = useNavigation();
    const route = useRoute<CheckoutScreenRouteProp>();
    const insets = useSafeAreaInsets();

    // Get cart from navigation params or default to empty
    const [cart, setCart] = useState<any[]>(route.params?.cart || []);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [loading, setLoading] = useState(false);

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [cart]
    );
    const tax = useMemo(() => subtotal * 0.08, [subtotal]);
    const discount = 0;
    const total = useMemo(() => subtotal + tax - discount, [subtotal, tax]);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setCart((prev) => prev
            .map((item) => item.product.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
            .filter((item) => item.quantity > 0));
    }, []);

    const handleComplete = useCallback(async () => {
        if (cart.length === 0) {
            Toast.show({ type: 'error', text1: 'Giỏ hàng trống', text2: 'Vui lòng chọn sản phẩm' });
            return;
        }

        setLoading(true);
        try {
            // Map payment method to API friendly string
            const mappedPaymentMethod = paymentMethod === 'qr' ? 'Bank Transfer' : paymentMethod === 'card' ? 'Credit Card' : 'Cash';

            const payload = {
                paymentMethod: mappedPaymentMethod,
                discountAmount: discount,
                items: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                }))
            };

            await ordersApi.createOrder(payload);

            Toast.show({ type: 'success', text1: 'Đặt hàng thành công!', text2: `Tổng: ${formatCurrency(total)}` });

            // Go back to POS or Orders, we go to POS then maybe reset standard cart?
            if (route.params?.onComplete) {
                route.params.onComplete();
            }
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tạo đơn hàng' });
        } finally {
            setLoading(false);
        }
    }, [cart, paymentMethod, discount, total, navigation, route.params]);

    const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
        { key: 'card', label: 'Thẻ', icon: 'card-outline' },
        { key: 'cash', label: 'Tiền mặt', icon: 'cash-outline' },
        { key: 'qr', label: 'QR Pay', icon: 'qr-code-outline' },
    ];

    return (
        <View className="flex-1 bg-bg">
            <ScreenHeader
                title="Thanh toán"
                topInset={insets.top}
                rightSlot={<View className="h-10 w-10" />}
            >
                <View className="absolute left-4 top-0" style={{ marginTop: insets.top + 12 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-xl bg-bg items-center justify-center" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </ScreenHeader>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

                {/* Customer */}
                <View className="bg-surface rounded-2xl p-3.5 mb-3 flex-row items-center">
                    <View className="w-[42px] h-[42px] rounded-full bg-primary-light items-center justify-center">
                        <Ionicons name="person" size={20} color={COLORS.primary} />
                    </View>
                    <View className="flex-1 ml-3">
                        <Text className="text-sm font-semibold text-foreground">Khách vãng lai</Text>
                        <Text className="text-xs text-muted">Mua tại quầy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </View>

                {/* Items */}
                <View className="bg-surface rounded-2xl p-3.5 mb-3">
                    <Text className="text-base font-bold text-foreground mb-3">Sản phẩm</Text>
                    {cart.map((item) => (
                        <View key={item.product.id} className="flex-row items-center py-2.5 border-b border-divider">
                            <View className="w-11 h-11 rounded-xl bg-bg items-center justify-center">
                                <Ionicons name="cube-outline" size={20} color={COLORS.textMuted} />
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="text-sm font-semibold text-foreground">{item.product.productName}</Text>
                                <Text className="text-xs text-muted">{formatCurrency(item.product.price)}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <TouchableOpacity onPress={() => updateQuantity(item.product.id, -1)}
                                    className="w-7 h-7 rounded-lg bg-bg items-center justify-center" activeOpacity={0.7}>
                                    <Ionicons name="remove" size={16} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                                <Text className="text-sm font-bold text-foreground mx-2.5">{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.product.id, 1)}
                                    className="w-7 h-7 rounded-lg bg-primary-light items-center justify-center" activeOpacity={0.7}>
                                    <Ionicons name="add" size={16} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    {cart.length === 0 && (
                        <Text className="text-sm text-muted text-center py-4">Giỏ hàng trống</Text>
                    )}
                </View>

                {/* Discount */}
                <View className="bg-surface rounded-2xl p-3.5 mb-3 flex-row items-center">
                    <View className="flex-1 flex-row items-center bg-bg rounded-xl px-3 h-[42px] mr-2">
                        <Ionicons name="pricetag-outline" size={18} color={COLORS.textMuted} />
                        <Text className="flex-1 text-sm text-muted ml-2">Mã giảm giá</Text>
                    </View>
                    <TouchableOpacity className="bg-primary px-4 py-2.5 rounded-xl" activeOpacity={0.7}>
                        <Text className="text-white font-bold text-sm">Áp dụng</Text>
                    </TouchableOpacity>
                </View>

                {/* Summary */}
                <View className="bg-surface rounded-2xl p-3.5 mb-3">
                    {[
                        { label: 'Tạm tính', value: formatCurrency(subtotal) },
                        { label: 'Thuế (8%)', value: formatCurrency(tax) },
                        { label: 'Giảm giá', value: `-${formatCurrency(discount)}` },
                    ].map((row) => (
                        <View key={row.label} className="flex-row justify-between py-1.5">
                            <Text className="text-sm text-muted">{row.label}</Text>
                            <Text className="text-sm font-semibold text-foreground">{row.value}</Text>
                        </View>
                    ))}
                    <View className="flex-row justify-between pt-2.5 mt-1.5 border-t border-divider">
                        <Text className="text-base font-bold text-foreground">Tổng cộng</Text>
                        <Text className="text-xl font-extrabold" style={{ color: COLORS.accent }}>{formatCurrency(total)}</Text>
                    </View>
                </View>

                {/* Payment Methods */}
                <View className="bg-surface rounded-2xl p-3.5 mb-3">
                    <Text className="text-base font-bold text-foreground mb-3">Phương thức thanh toán</Text>
                    <View className="flex-row gap-2">
                        {paymentMethods.map((pm) => (
                            <TouchableOpacity key={pm.key} onPress={() => setPaymentMethod(pm.key)}
                                className="flex-1 items-center py-3 rounded-xl"
                                style={{
                                    backgroundColor: paymentMethod === pm.key ? COLORS.primaryLight : COLORS.bg,
                                    borderWidth: 1.5,
                                    borderColor: paymentMethod === pm.key ? COLORS.primary : 'transparent',
                                }}
                                activeOpacity={0.7}>
                                <Ionicons name={pm.icon as any} size={22}
                                    color={paymentMethod === pm.key ? COLORS.primary : COLORS.textMuted} />
                                <Text className="text-xs font-semibold mt-1"
                                    style={{ color: paymentMethod === pm.key ? COLORS.primary : COLORS.textMuted }}>
                                    {pm.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* CTA */}
            <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-divider p-4"
                style={{ paddingBottom: insets.bottom + 16 }}>
                <PrimaryButton
                    onPress={handleComplete}
                    loading={loading}
                    label={`Hoàn tất đơn hàng • ${formatCurrency(total)}`}
                    loadingLabel="Đang xử lý..."
                    className="h-[52px] items-center justify-center rounded-2xl"
                />
            </View>
        </View>
    );
}
