import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { FormInput } from '@/src/components/ui/FormInput';
import { authApi } from '@/src/api';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';

export function ChangePasswordScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const logout = useAuthStore((s) => s.logout);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đầy đủ thông tin' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu mới không khớp' });
            return;
        }
        if (newPassword.length < 6) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }
        setLoading(true);
        try {
            await authApi.changePassword({ currentPassword, newPassword, confirmNewPassword });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.' });
            setTimeout(() => logout(), 1500);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Đổi mật khẩu thất bại';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-surface">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Back */}
                    <View className="px-6 pb-2" style={{ paddingTop: insets.top + 16 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}
                            className="w-10 h-10 rounded-xl bg-bg items-center justify-center" activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Icon & Title */}
                    <View className="items-center py-6">
                        <View className="w-16 h-16 rounded-2xl bg-primary-light items-center justify-center mb-5">
                            <Ionicons name="shield-checkmark-outline" size={30} color={COLORS.primary} />
                        </View>
                        <Text className="text-2xl font-extrabold text-foreground">Đổi Mật Khẩu</Text>
                        <Text className="text-sm text-muted mt-1.5">Nhập mật khẩu hiện tại và mật khẩu mới</Text>
                    </View>

                    {/* Form */}
                    <View className="px-6">
                        <FormInput label="Mật khẩu hiện tại" icon="lock-closed-outline" placeholder="Nhập mật khẩu hiện tại"
                            isPassword value={currentPassword} onChangeText={setCurrentPassword} />
                        <FormInput label="Mật khẩu mới" icon="lock-open-outline" placeholder="Nhập mật khẩu mới"
                            isPassword value={newPassword} onChangeText={setNewPassword} />
                        <FormInput label="Xác nhận mật khẩu" icon="checkmark-circle-outline" placeholder="Nhập lại mật khẩu mới"
                            isPassword value={confirmNewPassword} onChangeText={setConfirmNewPassword} />

                        <TouchableOpacity onPress={handleChangePassword} disabled={loading} activeOpacity={0.8} className="mt-4">
                            <View className="h-[52px] rounded-2xl items-center justify-center"
                                style={{ backgroundColor: loading ? COLORS.textMuted : COLORS.primary }}>
                                <Text className="text-white text-base font-bold">{loading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
