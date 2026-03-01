import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { FormInput } from '@/src/components/ui/FormInput';
import { authApi } from '@/src/api';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';
import type { AuthStackParamList } from '@/src/navigation/types';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const login = useAuthStore((s) => s.login);
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
            const token = resData?.data?.accessToken || (resData as any)?.accessToken;
            const userData = resData?.data?.user || (resData as any)?.user;
            if (token) {
                await login(token, userData);
                Toast.show({ type: 'success', text1: 'Chào mừng trở lại!', text2: 'Đăng nhập thành công' });
            } else {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không nhận được token từ máy chủ' });
            }
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Đăng nhập thất bại! Kiểm tra lại thông tin' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Logo & Title */}
                    <View className="items-center pb-10" style={{ paddingTop: insets.top + 60 }}>
                        <View className="w-[72px] h-[72px] rounded-2xl bg-primary-light items-center justify-center mb-6">
                            <Ionicons name="storefront" size={36} color={COLORS.primary} />
                        </View>
                        <Text className="text-[26px] font-extrabold text-foreground">Chào Mừng Trở Lại</Text>
                        <Text className="text-sm text-muted mt-1.5">Đăng nhập để tiếp tục sử dụng 360 Store</Text>
                    </View>

                    {/* Form */}
                    <View className="px-6">
                        <FormInput label="Email" icon="mail-outline" placeholder="Nhập địa chỉ email"
                            keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                        <FormInput label="Mật khẩu" icon="lock-closed-outline" placeholder="Nhập mật khẩu"
                            isPassword value={password} onChangeText={setPassword} />

                        <TouchableOpacity className="self-end mb-6" activeOpacity={0.7}>
                            <Text className="text-sm font-semibold text-primary">Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                            <View className="h-[52px] rounded-2xl items-center justify-center"
                                style={{ backgroundColor: loading ? COLORS.textMuted : COLORS.primary }}>
                                <Text className="text-white text-base font-bold">
                                    {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className="flex-row items-center my-6">
                            <View className="flex-1 h-px bg-border" />
                            <Text className="text-muted mx-4 text-sm">hoặc</Text>
                            <View className="flex-1 h-px bg-border" />
                        </View>

                        {/* Google */}
                        <TouchableOpacity className="flex-row items-center justify-center h-[52px] rounded-2xl border border-border mb-3"
                            activeOpacity={0.7}>
                            <Ionicons name="logo-google" size={20} color="#EA4335" />
                            <Text className="text-text-secondary font-semibold ml-2.5 text-sm">Đăng nhập với Google</Text>
                        </TouchableOpacity>

                        {/* Signup Link */}
                        <View className="flex-row justify-center mt-5">
                            <Text className="text-muted text-sm">Chưa có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.7}>
                                <Text className="text-primary font-bold text-sm">Đăng Ký</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
