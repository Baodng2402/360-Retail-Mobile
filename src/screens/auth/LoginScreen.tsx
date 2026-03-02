import { useState, useMemo } from 'react';
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
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';


// Firebase Google Sign-In — webClientId lấy từ google-services.json (client_type: 3)
GoogleSignin.configure({
  webClientId: '849161368020-r9oqj5qkc78pbmtbn025embhj5crns1a.apps.googleusercontent.com',
  // TODO: Thêm iosClientId khi có GoogleService-Info.plist cho iOS
});

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.length > 0,
    [email, password]
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const resData = res.data;
      const token = resData?.data?.accessToken || (resData as any)?.accessToken;
      const userData = resData?.data?.user || (resData as any)?.user;
      if (token) {
        await login(token, userData);
        Toast.show({ type: 'success', text1: 'Chào mừng trở lại!', text2: 'Đăng nhập thành công' });
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không nhận được token từ máy chủ' });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Đăng nhập thất bại! Kiểm tra lại thông tin',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      // Reset state if there is any pending signIn from a previous crash/dismiss
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore errors if not signed in
      }
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (idToken) {
        const res = await authApi.loginExternal({
          provider: 'Google',
          idToken: idToken,
        });

        const resData = res.data;
        const token = resData?.data?.accessToken || (resData as any)?.accessToken;
        const userData = resData?.data?.user || (resData as any)?.user;

        if (token) {
          await login(token, userData);
          Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đăng nhập Google thành công!' });
        } else {
          Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không nhận được token từ máy chủ' });
        }
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress already');
        // Force completely clear the stuck instance so next click works
        try {
          await GoogleSignin.signOut();
        } catch { }
        Toast.show({ type: 'info', text1: 'Thông báo', text2: 'Vui lòng thử bấm lại Đăng nhập' });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Play Services không khả dụng' });
      } else {
        console.error('Google Sign-In Error:', error);
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Đăng nhập Google thất bại' });
      }
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
            icon="storefront"
            title="Chào mừng trở lại"
            subtitle="Đăng nhập để tiếp tục sử dụng 360 Rental"
          />

          <View className="px-6">
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
              label="Mật khẩu"
              icon="lock-closed-outline"
              placeholder="Nhập mật khẩu"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity className="mb-6 self-end" activeOpacity={0.7}>
              <Text className="text-sm font-semibold text-primary">Quên mật khẩu?</Text>
            </TouchableOpacity>

            <PrimaryButton
              onPress={handleLogin}
              disabled={loading || !canSubmit}
              loading={loading}
              label="Đăng nhập"
              loadingLabel="Đang xử lý..."
            />

            <View className="my-8 flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              <Text className="mx-4 text-sm text-muted">Hoặc tiếp tục với</Text>
              <View className="h-px flex-1 bg-border" />
            </View>

            <View className="flex-row gap-3">
              <View
                className="h-12 flex-1 flex-row items-center justify-center rounded-xl bg-transparent">
                <GoogleSigninButton
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                />
              </View>
            </View>

            <View className="mt-10 flex-row justify-center">
              <Text className="text-sm text-muted">Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                <Text className="text-sm font-bold text-primary">Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
