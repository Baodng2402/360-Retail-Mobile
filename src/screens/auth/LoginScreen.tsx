import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { FormInput } from '@/src/components/ui/FormInput';
import { authApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { AuthStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Login'> & {
    onLogin: (token: string) => void;
};

export function LoginScreen({ navigation, onLogin }: Props) {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin' });
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            const resData = res.data;
            // Try multiple response structures
            const token =
                resData?.data?.accessToken ||
                (resData as any)?.accessToken;
            if (token) {
                await onLogin(token);
                Toast.show({ type: 'success', text1: 'Đăng nhập thành công', text2: 'Chào mừng bạn quay lại!' });
            } else {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không nhận được token từ server' });
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đăng nhập thất bại!';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: message });
            console.log("Lỗi: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 40, paddingBottom: 60, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                <View className="px-6 items-center">
                    <View className="w-20 h-20 rounded-2xl bg-white/20 items-center justify-center mb-4">
                        <Ionicons name="storefront" size={40} color="#fff" />
                    </View>
                    <Text className="text-white text-3xl font-bold">360 Retail</Text>
                    <Text className="text-white/70 text-base mt-2">Quản lý bán hàng thông minh</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text className="text-2xl font-bold text-slate-800 mb-6">Đăng nhập</Text>

                    <FormInput
                        label="Email"
                        icon="mail-outline"
                        placeholder="Nhập email của bạn"
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

                    <TouchableOpacity className="self-end mb-6" activeOpacity={0.7}>
                        <Text className="text-teal-500 font-semibold">Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient
                            colors={loading ? ['#94A3B8', '#64748B'] : [COLORS.primary, COLORS.primaryDark]}
                            className="h-14 rounded-xl items-center justify-center"
                        >
                            <Text className="text-white text-base font-bold">
                                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-slate-200" />
                        <Text className="text-slate-400 mx-4">hoặc</Text>
                        <View className="flex-1 h-px bg-slate-200" />
                    </View>

                    <TouchableOpacity className="flex-row items-center justify-center h-14 rounded-xl border border-slate-200 mb-4" activeOpacity={0.7}>
                        <Ionicons name="logo-google" size={22} color="#EA4335" />
                        <Text className="text-slate-700 font-semibold ml-3">Tiếp tục với Google</Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-4">
                        <Text className="text-slate-500">Chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                            <Text className="text-teal-500 font-bold">Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
