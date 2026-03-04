import { useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
// ResetPasswordScreen — Đặt lại mật khẩu
// Người dùng nhập OTP (6 số) + mật khẩu mới
// → Thành công → chuyển về Login
// =============================================

type Props = StackScreenProps<AuthStackParamList, 'ResetPassword'>;

const OTP_LENGTH = 6;

export function ResetPasswordScreen({ navigation, route }: Props) {
    const { email } = route.params;
    const insets = useSafeAreaInsets();

    const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const code = useMemo(() => otp.join(''), [otp]);
    const canSubmit = useMemo(
        () =>
            code.length === OTP_LENGTH &&
            newPassword.length >= 8 &&
            newPassword === confirmPassword,
        [code, newPassword, confirmPassword]
    );

    const handleOtpChange = (value: string, index: number) => {
        const normalized = value.replace(/\D/g, '').slice(0, 1);
        const nextOtp = [...otp];
        nextOtp[index] = normalized;
        setOtp(nextOtp);

        if (normalized && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (code.length < OTP_LENGTH) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: `Vui lòng nhập đủ mã ${OTP_LENGTH} số` });
            return;
        }
        if (newPassword.length < 8) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu phải có ít nhất 8 ký tự' });
            return;
        }
        if (newPassword !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(email, code, newPassword);
            Toast.show({
                type: 'success',
                text1: 'Thành công!',
                text2: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập.',
            });
            navigation.navigate('Login');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đặt lại mật khẩu thất bại';
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
                        <Text className="ml-2 text-lg font-bold text-foreground">Đặt lại mật khẩu</Text>
                    </View>

                    {/* OTP Section */}
                    <View className="items-center px-6 pt-8">
                        <View
                            className="mb-6 size-16 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'rgba(38,198,218,0.12)' }}>
                            <Ionicons name="shield-checkmark-outline" size={30} color={COLORS.primary} />
                        </View>

                        <Text className="text-center text-base leading-6 text-muted">
                            Nhập mã xác thực đã gửi đến{'\n'}
                            <Text className="font-semibold text-foreground">{email}</Text>
                        </Text>

                        {/* OTP Input boxes */}
                        <View className="mb-6 mt-8 flex-row gap-3">
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        inputRefs.current[index] = ref;
                                    }}
                                    className="h-14 w-12 rounded-xl border text-center text-xl font-bold text-foreground"
                                    style={{
                                        borderColor: digit ? COLORS.primary : COLORS.border,
                                        backgroundColor: digit ? COLORS.primaryLight : COLORS.surface,
                                    }}
                                    maxLength={1}
                                    keyboardType="number-pad"
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(event) => handleKeyPress(event, index)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* New Password Section */}
                    <View className="px-6">
                        <FormInput
                            label="Mật khẩu mới"
                            icon="lock-closed-outline"
                            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                            isPassword
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <FormInput
                            label="Xác nhận mật khẩu"
                            icon="lock-closed-outline"
                            placeholder="Nhập lại mật khẩu mới"
                            isPassword
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        {/* Validation feedback */}
                        {newPassword.length > 0 && newPassword.length < 8 && (
                            <Text className="mb-3 text-xs text-error">
                                ⚠ Mật khẩu phải có ít nhất 8 ký tự
                            </Text>
                        )}
                        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                            <Text className="mb-3 text-xs text-error">
                                ⚠ Mật khẩu xác nhận không khớp
                            </Text>
                        )}

                        <PrimaryButton
                            onPress={handleSubmit}
                            disabled={loading || !canSubmit}
                            loading={loading}
                            label="Đặt lại mật khẩu"
                            loadingLabel="Đang xử lý..."
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
