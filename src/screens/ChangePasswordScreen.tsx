import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { FormInput } from '@/src/components/ui/FormInput';
import { authApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';

interface Props {
    onLogout: () => void;
}

export function ChangePasswordScreen({ onLogout }: Props) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin' });
            return;
        }
        if (newPassword.length < 8) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        setLoading(true);
        try {
            await authApi.changePassword({ currentPassword, newPassword, confirmNewPassword });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.' });
            setTimeout(() => onLogout(), 1500);
        } catch (error: any) {
            const data = error.response?.data;
            let message = 'Đổi mật khẩu thất bại';

            if (data?.errors) {
                message = Object.values(data.errors).flat().join('\n');
            } else if (data?.message) {
                message = data.message;
            } else if (data?.title) {
                message = data.title;
            }

            Toast.show({ type: 'error', text1: 'Lỗi', text2: "Mật khẩu hiện tại không chính xác" });
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 12, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
                <View className="px-5 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-4">Đổi mật khẩu</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <FormInput
                        label="Mật khẩu hiện tại"
                        icon="lock-closed-outline"
                        placeholder="Nhập mật khẩu hiện tại"
                        isPassword
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />

                    <FormInput
                        label="Mật khẩu mới"
                        icon="key-outline"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        isPassword
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />

                    <FormInput
                        label="Xác nhận mật khẩu mới"
                        icon="shield-checkmark-outline"
                        placeholder="Nhập lại mật khẩu mới"
                        isPassword
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                    />

                    <TouchableOpacity onPress={handleChangePassword} disabled={loading} activeOpacity={0.8} className="mt-4">
                        <LinearGradient
                            colors={loading ? ['#94A3B8', '#64748B'] : [COLORS.primary, COLORS.primaryDark]}
                            className="h-14 rounded-xl items-center justify-center"
                        >
                            <Text className="text-white text-base font-bold">
                                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
