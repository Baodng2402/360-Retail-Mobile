import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { PrimaryButton } from '@/src/components';
import { COLORS } from '@/src/constants/colors';
import type { AuthStackParamList } from '@/src/navigation/types';
import { authApi } from '@/src/api';

type Props = StackScreenProps<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 6;

export function OTPScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const insets = useSafeAreaInsets();

  const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [countdown, setCountdown] = useState(45);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const code = useMemo(() => otp.join(''), [otp]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const handleVerify = async () => {
    if (code.length < OTP_LENGTH) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Vui lòng nhập đủ mã ${OTP_LENGTH} số` });
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.verifyEmail(email, code);
      Toast.show({
        type: 'success',
        text1: 'Đã xác thực!',
        text2: res.data?.message ?? 'Tài khoản đã được xác minh thành công',
      });
      navigation.navigate('Login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xác thực thất bại';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      setCountdown(45);
      const res = await authApi.resendOTP(email);
      Toast.show({
        type: 'info',
        text1: 'Đã gửi mã',
        text2: res.data?.message ?? 'Mã xác thực mới đã được gửi',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gửi lại mã thất bại';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: message });
      setCountdown(0);
    }
  };

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <View className="flex-1 bg-bg">
      <View
        className="flex-row items-center justify-between px-4 pb-2"
        style={{ paddingTop: insets.top + 12 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="size-10 items-center justify-center rounded-full"
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text className="pr-10 text-lg font-bold text-foreground">Xác thực</Text>
      </View>

      <View className="flex-1 items-center px-6 pt-10">
        <View
          className="mb-6 size-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(38,198,218,0.12)' }}>
          <Ionicons name="lock-closed-outline" size={30} color={COLORS.primary} />
        </View>

        <Text className="text-center text-[32px] font-extrabold text-foreground">
          Nhập mã xác thực
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-muted">
          Chúng tôi đã gửi mã xác thực đến{`\n`}
          <Text className="font-semibold text-foreground">{email}</Text>
        </Text>

        <View className="mb-6 mt-10 flex-row gap-4">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className="h-16 w-14 border-b-2 text-center text-2xl font-bold text-foreground"
              style={{ borderBottomColor: digit ? COLORS.primary : COLORS.border }}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleResend}
          disabled={countdown > 0}
          style={{ opacity: countdown > 0 ? 1 : 0.9 }}
          activeOpacity={0.8}>
          <Text className="text-sm text-muted">
            Gửi lại mã sau <Text className="font-bold text-primary">{formatTime(countdown)}</Text>
          </Text>
        </TouchableOpacity>

        <View className="mt-auto w-full pb-8">
          <PrimaryButton
            onPress={handleVerify}
            disabled={loading}
            loading={loading}
            label="Xác thực"
            loadingLabel="Đang xác thực..."
            className="h-14 w-full items-center justify-center rounded-xl"
          />
        </View>
      </View>
    </View>
  );
}
