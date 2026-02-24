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

type Props = StackScreenProps<AuthStackParamList, 'Signup'> & {
    onLogin: (token: string) => void;
};

export function SignupScreen({ navigation, onLogin }: Props) {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin' });
            return;
        }
        if (password !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu xác nhận không khớp' });
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
            const token =
                resData?.data?.accessToken ||
                (resData as any)?.accessToken;
            if (token) {
                await onLogin(token);
                Toast.show({ type: 'success', text1: 'Đăng ký thành công', text2: 'Chào mừng bạn đến với 360 Retail!' });
            } else {
                Toast.show({ type: 'success', text1: 'Đăng ký thành công', text2: 'Vui lòng đăng nhập!' });
                navigation.goBack();
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đăng ký thất bại';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: message });
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
                style={{ paddingTop: insets.top + 20, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                <View className="px-6 flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/20 items-center justify-center" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View className="flex-1 items-center mr-10">
                        <Text className="text-white text-2xl font-bold">Tạo tài khoản</Text>
                        <Text className="text-white/70 text-sm mt-1">Bắt đầu hành trình kinh doanh</Text>
                    </View>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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
                        placeholder="Nhập email của bạn"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <FormInput
                        label="Mật khẩu"
                        icon="lock-closed-outline"
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                        isPassword
                        value={password}
                        onChangeText={setPassword}
                    />

                    <FormInput
                        label="Xác nhận mật khẩu"
                        icon="shield-checkmark-outline"
                        placeholder="Nhập lại mật khẩu"
                        isPassword
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient
                            colors={loading ? ['#94A3B8', '#64748B'] : [COLORS.primary, COLORS.primaryDark]}
                            className="h-14 rounded-xl items-center justify-center"
                        >
                            <Text className="text-white text-base font-bold">
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text className="text-center text-slate-400 text-xs mt-4 px-4">
                        Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi
                    </Text>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-slate-500">Đã có tài khoản? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <Text className="text-teal-500 font-bold">Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
