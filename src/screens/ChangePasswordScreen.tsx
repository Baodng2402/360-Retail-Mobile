import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { FormInput } from '@/src/components/ui/FormInput';
import { AuthTopSection, PrimaryButton } from '@/src/components';
import { authApi } from '@/src/api';
import { useAuthStore } from '@/src/stores';

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
                    <AuthTopSection
                        topInset={insets.top}
                        icon="shield-checkmark-outline"
                        title="Đổi Mật Khẩu"
                        subtitle="Nhập mật khẩu hiện tại và mật khẩu mới"
                        onBack={() => navigation.goBack()}
                    />

                    {/* Form */}
                    <View className="px-6">
                        <FormInput label="Mật khẩu hiện tại" icon="lock-closed-outline" placeholder="Nhập mật khẩu hiện tại"
                            isPassword value={currentPassword} onChangeText={setCurrentPassword} />
                        <FormInput label="Mật khẩu mới" icon="lock-open-outline" placeholder="Nhập mật khẩu mới"
                            isPassword value={newPassword} onChangeText={setNewPassword} />
                        <FormInput label="Xác nhận mật khẩu" icon="checkmark-circle-outline" placeholder="Nhập lại mật khẩu mới"
                            isPassword value={confirmNewPassword} onChangeText={setConfirmNewPassword} />

                        <PrimaryButton
                            onPress={handleChangePassword}
                            disabled={loading}
                            loading={loading}
                            label="Đổi Mật Khẩu"
                            loadingLabel="Đang xử lý..."
                            className="mt-4 h-[52px] items-center justify-center rounded-2xl"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
