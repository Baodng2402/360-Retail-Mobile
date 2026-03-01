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

type Props = StackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const login = useAuthStore((s) => s.login);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

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
        <View className="flex-1 bg-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Back Button */}
                    <View className="px-6 pb-2" style={{ paddingTop: insets.top + 16 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}
                            className="w-10 h-10 rounded-xl bg-bg items-center justify-center" activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Icon & Title */}
                    <View className="items-center py-6">
                        <View className="w-16 h-16 rounded-2xl bg-primary-light items-center justify-center mb-5">
                            <Ionicons name="person-add-outline" size={30} color={COLORS.primary} />
                        </View>
                        <Text className="text-2xl font-extrabold text-foreground">Tạo Tài Khoản</Text>
                        <Text className="text-sm text-muted mt-1.5">Đăng ký để bắt đầu sử dụng 360 Store</Text>
                    </View>

                    {/* Form */}
                    <View className="px-6">
                        <FormInput label="Họ và tên" icon="person-outline" placeholder="Nhập họ và tên" value={name} onChangeText={setName} />
                        <FormInput label="Email" icon="mail-outline" placeholder="Nhập địa chỉ email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                        <FormInput label="Số điện thoại" icon="call-outline" placeholder="Nhập số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                        <FormInput label="Mật khẩu" icon="lock-closed-outline" placeholder="Nhập mật khẩu" isPassword value={password} onChangeText={setPassword} />

                        <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.8} className="mt-2">
                            <View className="h-[52px] rounded-2xl items-center justify-center"
                                style={{ backgroundColor: loading ? COLORS.textMuted : COLORS.accent }}>
                                <Text className="text-white text-base font-bold">{loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}</Text>
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-muted text-sm">Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                                <Text className="text-primary font-bold text-sm">Đăng Nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
