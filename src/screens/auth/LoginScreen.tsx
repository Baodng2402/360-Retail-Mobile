import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { COLORS } from '../../constants/colors';

interface Props {
    onLogin: () => void;
    onNavigateToSignup: () => void;
}

const MOCK_USER = { email: 'admin@360retail.vn', password: '123456' };

export function LoginScreen({ onLogin, onNavigateToSignup }: Props) {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin' });
            return;
        }

        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email === MOCK_USER.email && password === MOCK_USER.password) {
            Toast.show({ type: 'success', text1: 'Đăng nhập thành công', text2: 'Chào mừng bạn quay lại!' });
            onLogin();
        } else {
            Toast.show({ type: 'error', text1: 'Đăng nhập thất bại', text2: 'Email hoặc mật khẩu không đúng' });
        }
        setLoading(false);
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

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-slate-600 mb-2">Email</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
                            <Ionicons name="mail-outline" size={22} color="#94A3B8" />
                            <TextInput
                                className="flex-1 text-base text-slate-800 ml-3"
                                placeholder="Nhập email của bạn"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-medium text-slate-600 mb-2">Mật khẩu</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
                            <Ionicons name="lock-closed-outline" size={22} color="#94A3B8" />
                            <TextInput
                                className="flex-1 text-base text-slate-800 ml-3"
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity className="self-end mb-6" activeOpacity={0.7}>
                        <Text className="text-teal-500 font-semibold">Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient
                            colors={loading ? ['#94A3B8', '#64748B'] : [COLORS.primary, COLORS.primaryDark]}
                            className="h-14 rounded-xl items-center justify-center"
                        >
                            {loading ? (
                                <Text className="text-white text-base font-bold">Đang xử lý...</Text>
                            ) : (
                                <Text className="text-white text-base font-bold">Đăng nhập</Text>
                            )}
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
                        <TouchableOpacity onPress={onNavigateToSignup} activeOpacity={0.7}>
                            <Text className="text-teal-500 font-bold">Đăng ký ngay</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-8 p-4 bg-teal-50 rounded-xl">
                        <Text className="text-teal-700 font-semibold mb-2">📌 Tài khoản demo:</Text>
                        <Text className="text-teal-600">Email: admin@360retail.vn</Text>
                        <Text className="text-teal-600">Password: 123456</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
