import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { COLORS } from '@/src/constants/colors';
import type { AuthStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'OTP'>;

export function OTPScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [countdown, setCountdown] = useState(45);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const code = otp.join('');
        if (code.length < 4) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ mã xác thực' });
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Toast.show({ type: 'success', text1: 'Đã xác thực!', text2: 'Tài khoản đã được xác minh' });
            navigation.navigate('Login');
        }, 1500);
    };

    const handleResend = () => {
        if (countdown > 0) return;
        setCountdown(45);
        Toast.show({ type: 'info', text1: 'Đã gửi mã', text2: 'Mã xác thực mới đã được gửi' });
    };

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24 }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: COLORS.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 }}>
                    Xác Thực
                </Text>
                <View
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: 20,
                        backgroundColor: COLORS.primaryLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 28,
                    }}
                >
                    <Ionicons name="shield-checkmark-outline" size={36} color={COLORS.primary} />
                </View>
                <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.text }}>Nhập Mã Xác Thực</Text>
                <Text
                    style={{
                        fontSize: 14,
                        color: COLORS.textMuted,
                        textAlign: 'center',
                        marginTop: 8,
                        lineHeight: 20,
                    }}
                >
                    Chúng tôi đã gửi mã xác thực đến số điện thoại{'\n'}của bạn. Vui lòng nhập mã bên dưới.
                </Text>

                {/* OTP Inputs */}
                <View style={{ flexDirection: 'row', marginTop: 32, gap: 12 }}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 14,
                                borderWidth: 2,
                                borderColor: digit ? COLORS.primary : COLORS.border,
                                backgroundColor: digit ? COLORS.primaryLight : COLORS.bg,
                                textAlign: 'center',
                                fontSize: 22,
                                fontWeight: '700',
                                color: COLORS.text,
                            }}
                            maxLength={1}
                            keyboardType="number-pad"
                            value={digit}
                            onChangeText={(v) => handleOtpChange(v, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleResend}
                    disabled={countdown > 0}
                    style={{ marginTop: 24 }}
                    activeOpacity={0.7}
                >
                    <Text style={{ fontSize: 14, color: COLORS.textMuted }}>
                        Gửi lại mã sau{' '}
                        <Text style={{ color: countdown > 0 ? COLORS.primary : COLORS.accent, fontWeight: '700' }}>
                            {formatTime(countdown)}
                        </Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={{ width: '100%', marginTop: 40 }}
                >
                    <View
                        style={{
                            height: 52,
                            borderRadius: 14,
                            backgroundColor: loading ? COLORS.textMuted : COLORS.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
                            {loading ? 'Đang xác thực...' : 'Xác Thực'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
