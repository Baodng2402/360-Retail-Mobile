import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { FormInput } from '@/src/components/ui/FormInput';
import { PrimaryButton } from '@/src/components';
import { authApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { AuthStackParamList } from '@/src/navigation/types';

// =============================================
// ForgotPasswordScreen — Quên mật khẩu
// Người dùng nhập email → hệ thống gửi OTP
// → Chuyển đến ResetPassword để nhập OTP + mật khẩu mới
// =============================================

type Props = StackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => email.trim().length > 0, [email]);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập email' });
            return;
        }

        setLoading(true);
        try {
            await authApi.forgotPassword(email.trim());
            Toast.show({
                type: 'success',
                text1: 'Đã gửi mã',
                text2: 'Kiểm tra email để lấy mã xác thực',
            });
            navigation.navigate('ResetPassword', { email: email.trim() });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Gửi yêu cầu thất bại';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-bg">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Header */}
                    <View
                        className="flex-row items-center px-4 pb-2"
                        style={{ paddingTop: insets.top + 12 }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="size-10 items-center justify-center rounded-full"
                            activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Nội dung chính */}
                    <View className="items-center px-6 pt-10">
                        <View
                            className="mb-6 size-16 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'rgba(38,198,218,0.12)' }}>
                            <Ionicons name="key-outline" size={30} color={COLORS.primary} />
                        </View>

                        <Text className="text-center text-[28px] font-extrabold text-foreground">
                            Quên mật khẩu?
                        </Text>
                        <Text className="mt-3 text-center text-base leading-6 text-muted">
                            Nhập email đăng ký, chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.
                        </Text>
                    </View>

                    <View className="mt-8 px-6">
                        <FormInput
                            label="Email"
                            icon="mail-outline"
                            placeholder="Nhập địa chỉ email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <PrimaryButton
                            onPress={handleSubmit}
                            disabled={loading || !canSubmit}
                            loading={loading}
                            label="Gửi mã xác thực"
                            loadingLabel="Đang gửi..."
                        />

                        <TouchableOpacity
                            className="mt-6 self-center"
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.7}>
                            <Text className="text-sm text-muted">
                                Quay lại{' '}
                                <Text className="font-bold text-primary">Đăng nhập</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
