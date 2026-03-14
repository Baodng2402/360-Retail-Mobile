import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { COLORS } from '@/src/constants/colors';
import { subscriptionApi } from '@/src/api/subscription.api';
import { useRefreshStore } from '@/src/stores/useRefreshStore';
import Toast from 'react-native-toast-message';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuthStore } from '@/src/stores';
interface Props {
  visible: boolean;
  onSuccess: () => void;
}

// Modal popup để nhập tên cửa hàng (store name) và bắt đầu dùng thử (start trial)
export function TrialStartModal({ visible, onSuccess }: Props) {
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthStore();
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);

  const handleStartTrial = async () => {
    if (!storeName.trim()) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập tên cửa hàng' });
      return;
    }

    setLoading(true);
    try {
      const res = await subscriptionApi.startTrial(storeName.trim());
      Toast.show({
        type: 'success',
        text1: 'Kích hoạt thành công! 🎉',
        text2: res.data?.message || 'Bạn có 7 ngày dùng thử miễn phí.',
      });

      // ✅ Trigger orchestrated refresh — all screens watching will refetch
      triggerRefresh('subscription');
      
      // Clear input
      setStoreName('');
      
      // Callback to parent
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Không thể kích hoạt trial. Vui lòng thử lại.';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Toast.show({ type: 'success', text1: 'Đã đăng xuất' });
    } catch (error) {
      const err = error as { message?: string };
      Toast.show({ type: 'error', text1: 'Lỗi', text2: err?.message || 'Không thể đăng xuất' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
        <Card className="w-full max-w-[400px]" style={{ backgroundColor: COLORS.surface }}>
          <CardHeader className="relative pb-2">
            {/* Close Button */}
            <TouchableOpacity
              className="absolute right-4 top-4 rounded-full p-1 active:bg-gray-200"
              activeOpacity={0.7}
              onPress={handleLogout}>
              <AntDesign name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>

            {/* Title with Icon */}
            <View className="pr-10">
              <CardTitle className="mb-2 text-2xl font-bold">🚀 Bắt đầu dùng thử</CardTitle>
              <CardDescription className="text-base leading-5">
                Nhập tên cửa hàng để kích hoạt{' '}
                <Text className="font-bold text-blue-600">7 ngày miễn phí</Text> với đầy đủ tính
                năng
              </CardDescription>
            </View>
          </CardHeader>

          <CardContent>
            <Text className="mb-2 text-sm font-semibold">Tên cửa hàng</Text>
            <TextInput
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Ví dụ: Tiệm 360Retail..."
              placeholderTextColor={COLORS.textMuted}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: COLORS.divider,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: COLORS.text,
                backgroundColor: COLORS.bg,
              }}
            />
          </CardContent>

          <CardFooter>
            <TouchableOpacity
              onPress={handleStartTrial}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: loading ? COLORS.textMuted : COLORS.primary,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}>
              {loading && <ActivityIndicator color="#fff" size="small" />}
              <Text className="text-[15px] font-bold text-white">
                {loading ? 'Đang kích hoạt...' : 'Bắt đầu dùng thử 7 ngày'}
              </Text>
            </TouchableOpacity>
          </CardFooter>
        </Card>
      </View>
    </Modal>
  );
}
