import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { COLORS } from '@/src/constants/colors';
import { subscriptionApi } from '@/src/api/subscription.api';
import Toast from 'react-native-toast-message';

interface Props {
    visible: boolean;
    onSuccess: () => void;
}

// Modal popup để nhập tên cửa hàng (store name) và bắt đầu dùng thử (start trial)
export function TrialStartModal({ visible, onSuccess }: Props) {
    const [storeName, setStoreName] = useState('');
    const [loading, setLoading] = useState(false);

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
            onSuccess();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Không thể kích hoạt trial. Vui lòng thử lại.';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.55)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
            }}>
                <Card className="w-full max-w-[400px]" style={{ backgroundColor: COLORS.surface }}>
                    <CardHeader>
                        <CardTitle className="text-xl">
                            🚀 Bắt đầu dùng thử miễn phí
                        </CardTitle>
                        <CardDescription>
                            Nhập tên cửa hàng để kích hoạt 7 ngày trải nghiệm đầy đủ tính năng!
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Text className="text-sm font-semibold mb-2">
                            Tên cửa hàng
                        </Text>
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
                            <Text className="text-white font-bold text-[15px]">
                                {loading ? 'Đang kích hoạt...' : 'Bắt đầu dùng thử 7 ngày'}
                            </Text>
                        </TouchableOpacity>
                    </CardFooter>
                </Card>
            </View>
        </Modal>
    );
}
