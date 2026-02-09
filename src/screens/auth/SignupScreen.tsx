import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { COLORS } from '../../constants/colors';

interface Props {
    onSignup: () => void;
    onNavigateToLogin: () => void;
}

export function SignupScreen({ onSignup, onNavigateToLogin }: Props) {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        Toast.show({ type: 'success', text1: 'Đăng ký thành công', text2: 'Chào mừng bạn đến với 360 Retail!' });
        onSignup();
        setLoading(false);
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
                    <TouchableOpacity onPress={onNavigateToLogin} className="w-10 h-10 rounded-full bg-white/20 items-center justify-center" activeOpacity={0.7}>
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
                    <View className="mb-4">
                        <Text className="text-sm font-medium text-slate-600 mb-2">Họ và tên</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
                            <Ionicons name="person-outline" size={22} color="#94A3B8" />
                            <TextInput
                                className="flex-1 text-base text-slate-800 ml-3"
                                placeholder="Nhập họ và tên"
                                placeholderTextColor="#94A3B8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

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

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-slate-600 mb-2">Mật khẩu</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
                            <Ionicons name="lock-closed-outline" size={22} color="#94A3B8" />
                            <TextInput
                                className="flex-1 text-base text-slate-800 ml-3"
                                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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

                    <View className="mb-6">
                        <Text className="text-sm font-medium text-slate-600 mb-2">Xác nhận mật khẩu</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
                            <Ionicons name="shield-checkmark-outline" size={22} color="#94A3B8" />
                            <TextInput
                                className="flex-1 text-base text-slate-800 ml-3"
                                placeholder="Nhập lại mật khẩu"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient
                            colors={loading ? ['#94A3B8', '#64748B'] : [COLORS.primary, COLORS.primaryDark]}
                            className="h-14 rounded-xl items-center justify-center"
                        >
                            {loading ? (
                                <Text className="text-white text-base font-bold">Đang xử lý...</Text>
                            ) : (
                                <Text className="text-white text-base font-bold">Đăng ký</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text className="text-center text-slate-400 text-xs mt-4 px-4">
                        Bằng việc đăng ký, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi
                    </Text>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-slate-500">Đã có tài khoản? </Text>
                        <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                            <Text className="text-teal-500 font-bold">Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
