import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { FormInput } from '@/src/components/ui/FormInput';
import { AuthTopSection, PrimaryButton } from '@/src/components';
import { authApi } from '@/src/api';
import { useAuthStore } from '@/src/stores';
import type { AuthStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const canSubmit = useMemo(
    () => name.trim() && email.trim() && password.length >= 6,
    [name, email, password]
  );

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin bắt buộc' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ fullName: name, email, password });
      const resData = res.data;
      const token = resData?.data?.accessToken || (resData as any)?.accessToken;
      const userData = resData?.data?.user || (resData as any)?.user;
      if (token) {
        await login(token, userData);
        Toast.show({ type: 'success', text1: 'Chào mừng!', text2: 'Tạo tài khoản thành công' });
      } else {
        Toast.show({ type: 'success', text1: 'Đã tạo tài khoản', text2: 'Vui lòng đăng nhập!' });
        navigation.navigate('OTP', { email });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
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
          <AuthTopSection
            topInset={insets.top}
            icon="person-add-outline"
            title="Tạo tài khoản"
            subtitle="Đăng ký để bắt đầu sử dụng 360 Rental"
            onBack={() => navigation.goBack()}
          />

          <View className="px-6">
            <FormInput
              label="Họ và tên"
              icon="person-outline"
              placeholder="Nhập họ và tên"
              value={name}
              onChangeText={setName}
            />
            <FormInput
              label="Email"
              icon="mail-outline"
              placeholder="Nhập địa chỉ email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <FormInput
              label="Số điện thoại"
              icon="call-outline"
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <FormInput
              label="Mật khẩu"
              icon="lock-closed-outline"
              placeholder="Nhập mật khẩu"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <PrimaryButton
              onPress={handleSignup}
              disabled={loading || !canSubmit}
              loading={loading}
              label="Đăng ký"
              loadingLabel="Đang xử lý..."
              className="mt-3 h-14 items-center justify-center rounded-xl"
            />

            <View className="mt-8 flex-row justify-center">
              <Text className="text-sm text-muted">Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text className="text-sm font-bold text-primary">Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
