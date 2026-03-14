import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { WebView } from 'react-native-webview';
import type { StackScreenProps } from '@react-navigation/stack';
import { paymentApi } from '@/src/api';
import { ScreenHeader } from '@/src/components';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import { useSubscriptionStore } from '@/src/stores';

type Props = StackScreenProps<MoreStackParamList, 'Payment'>;
type Plan = { id: string; name: string; price: string; features: string[] };

type PaymentState = {
  paymentId: string;
  paymentUrl?: string;
  status: 'pending' | 'success' | 'failed';
};

const PLANS: Plan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    price: '199.000đ/tháng',
    features: ['Dashboard', 'Tasks', 'Variants'],
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    price: '499.000đ/tháng',
    features: ['Everything in Basic', 'GPS check-in', 'Loyalty', 'Export Excel'],
  },
];

export function PaymentScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const fetchStatus = useSubscriptionStore((s) => s.fetchStatus);

  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [webLoading, setWebLoading] = useState(true);

  useEffect(() => {
    if (!paymentState || paymentState.status !== 'pending') return;

    const timer = setInterval(async () => {
      try {
        const result = await paymentApi.checkPaymentStatus(paymentState.paymentId);
        setPaymentState((prev) => (prev ? { ...prev, status: result.status } : prev));

        if (result.status === 'success') {
          clearInterval(timer);
          await fetchStatus();
          Toast.show({ type: 'success', text1: 'Thanh toán thành công' });
          setShowPaymentModal(false);
        }

        if (result.status === 'failed') {
          clearInterval(timer);
          Toast.show({ type: 'error', text1: 'Thanh toán thất bại' });
        }
      } catch (error) {
        console.error('[PaymentScreen.polling] Failed:', error);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [paymentState, fetchStatus]);

  const onUpgrade = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      const purchase = await paymentApi.purchasePlan(planId);
      const init = await paymentApi.initiatePayment(purchase.paymentId, 'vnpay');

      setPaymentState({
        paymentId: purchase.paymentId,
        paymentUrl: init.paymentUrl,
        status: 'pending',
      });
      setShowPaymentModal(true);
    } catch (error) {
      console.error('[PaymentScreen.onUpgrade] Failed:', error);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không khởi tạo được thanh toán' });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const modalText = useMemo(() => {
    if (!paymentState) return 'Đang xử lý';
    if (paymentState.status === 'pending') return 'Đang chờ xác nhận thanh toán...';
    if (paymentState.status === 'success') return 'Thanh toán thành công';
    return 'Thanh toán thất bại';
  }, [paymentState]);

  const handleWebNavigation = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes('success') || lower.includes('paid')) {
      setPaymentState((prev) => (prev ? { ...prev, status: 'success' } : prev));
    }
    if (lower.includes('failed') || lower.includes('cancel')) {
      setPaymentState((prev) => (prev ? { ...prev, status: 'failed' } : prev));
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Nâng cấp gói" topInset={insets.top} showBackButton />

      <View className="px-4 pt-2">
        {PLANS.map((plan) => (
          <View key={plan.id} className="mb-3 rounded-2xl bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">{plan.name}</Text>
              <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>{plan.price}</Text>
            </View>

            <View className="mt-2">
              {plan.features.map((feature) => (
                <View key={feature} className="mt-1 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                  <Text className="ml-2 text-xs text-muted">{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              className="mt-4 items-center rounded-xl py-3"
              style={{ backgroundColor: COLORS.primary }}
              disabled={loadingPlanId === plan.id}
              onPress={() => onUpgrade(plan.id)}>
              <Text className="font-semibold text-white">
                {loadingPlanId === plan.id ? 'Đang xử lý...' : 'Upgrade'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-2xl bg-surface p-5" style={{ height: '80%' }}>
            <Text className="text-lg font-bold text-foreground">VNPay</Text>
            <Text className="mt-2 text-sm text-muted">{modalText}</Text>

            {paymentState?.paymentUrl ? (
              <Text className="mt-2 text-xs text-muted" numberOfLines={2}>
                URL: {paymentState.paymentUrl}
              </Text>
            ) : null}

            {paymentState?.status === 'pending' && (
              <View className="mt-3 flex-1 overflow-hidden rounded-xl border border-border">
                {paymentState?.paymentUrl ? (
                  <>
                    {webLoading && (
                      <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-center bg-surface/90 py-2">
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text className="ml-2 text-sm text-muted">Đang tải cổng VNPay...</Text>
                      </View>
                    )}
                    <WebView
                      source={{ uri: paymentState.paymentUrl }}
                      onLoadStart={() => setWebLoading(true)}
                      onLoadEnd={() => setWebLoading(false)}
                      onNavigationStateChange={(event) => handleWebNavigation(event.url)}
                    />
                  </>
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-sm text-muted">Không có payment URL</Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              className="mt-5 items-center rounded-xl border border-border py-2.5"
              onPress={() => setShowPaymentModal(false)}>
              <Text className="font-semibold text-foreground">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
