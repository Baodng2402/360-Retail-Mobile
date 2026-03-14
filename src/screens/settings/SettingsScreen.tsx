import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import type { StackScreenProps } from '@react-navigation/stack';
import { useAuthStore } from '@/src/stores';
import { authApi } from '@/src/api';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import { isStoreOwner } from '@/src/utils/role';
import { ChangePasswordSchema } from '@/src/utils/validators';

// =============================================
// SettingsScreen — Cài đặt
//
// Staff/Manager: chỉ thấy tab Bảo mật (đổi mật khẩu)
// Owner: + Thông tin CH, Thông báo
// =============================================

type Props = StackScreenProps<MoreStackParamList, 'Settings'>;

type TabKey = 'security' | 'store' | 'notifications';

export function SettingsScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const rawRole = useAuthStore((s) => s.user?.role ?? '');
    const isOwnerRole = isStoreOwner(rawRole);

    const [activeTab, setActiveTab] = useState<TabKey>('security');

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const tabs: { key: TabKey; label: string; icon: string; show: boolean }[] = [
        { key: 'security', label: 'Bảo mật', icon: 'shield-checkmark-outline', show: true },
        { key: 'store', label: 'Cửa hàng', icon: 'storefront-outline', show: isOwnerRole },
        { key: 'notifications', label: 'Thông báo', icon: 'notifications-outline', show: isOwnerRole },
    ];

    const visibleTabs = tabs.filter((t) => t.show);

    // ──────────── Đổi mật khẩu ────────────
    const handleChangePassword = async () => {
        const validationResult = ChangePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmNewPassword: confirmPassword,
        });

        if (!validationResult.success) {
            // Lấy lỗi đầu tiên từ Zod để hiển thị
            const firstError = validationResult.error.issues[0];
            Toast.show({ type: 'error', text1: 'Lỗi nhập liệu', text2: firstError?.message || 'Dữ liệu không hợp lệ' });
            return;
        }

        setSaving(true);
        try {
            await authApi.changePassword({ currentPassword, newPassword, confirmNewPassword: confirmPassword });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đổi mật khẩu thành công!' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Đổi mật khẩu thất bại';
            Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View className="border-b border-divider bg-surface px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3" activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-foreground">Cài đặt</Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row gap-2 px-4 py-3">
                {visibleTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        className="flex-row items-center gap-1.5 rounded-full px-4 py-2"
                        style={{ backgroundColor: activeTab === tab.key ? COLORS.primary : COLORS.surface }}
                        activeOpacity={0.7}
                        onPress={() => setActiveTab(tab.key)}>
                        <Ionicons
                            name={tab.icon as any}
                            size={16}
                            color={activeTab === tab.key ? '#fff' : COLORS.textSecondary}
                        />
                        <Text
                            className="text-xs font-semibold"
                            style={{ color: activeTab === tab.key ? '#fff' : COLORS.textSecondary }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* ──────── Tab: Bảo mật ──────── */}
                {activeTab === 'security' && (
                    <View className="rounded-2xl bg-surface p-5">
                        <View className="mb-4 flex-row items-center">
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
                            <Text className="ml-2 text-base font-semibold text-foreground">Đổi mật khẩu</Text>
                        </View>

                        <Text className="mb-1 text-sm font-medium text-foreground">Mật khẩu hiện tại</Text>
                        <TextInput
                            className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                            placeholder="Nhập mật khẩu hiện tại"
                            placeholderTextColor={COLORS.textMuted}
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />

                        <Text className="mb-1 text-sm font-medium text-foreground">Mật khẩu mới</Text>
                        <TextInput
                            className="mb-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                            placeholder="Nhập mật khẩu mới (≥ 8 ký tự)"
                            placeholderTextColor={COLORS.textMuted}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <Text className="mb-1 text-sm font-medium text-foreground">Xác nhận mật khẩu mới</Text>
                        <TextInput
                            className="mb-4 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                            placeholder="Nhập lại mật khẩu mới"
                            placeholderTextColor={COLORS.textMuted}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <TouchableOpacity
                            className="items-center rounded-xl py-3"
                            style={{ backgroundColor: COLORS.primary }}
                            activeOpacity={0.7}
                            onPress={handleChangePassword}
                            disabled={saving}>
                            <Text className="font-semibold text-white">
                                {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ──────── Tab: Cửa hàng (placeholder) ──────── */}
                {activeTab === 'store' && (
                    <View className="items-center rounded-2xl bg-surface p-8">
                        <Ionicons name="storefront-outline" size={48} color={COLORS.textMuted} />
                        <Text className="mt-3 text-base font-semibold text-foreground">Thông tin cửa hàng</Text>
                        <Text className="mt-1 text-center text-sm text-muted">
                            Chỉnh sửa tên, địa chỉ, SĐT cửa hàng
                        </Text>
                    </View>
                )}

                {/* ──────── Tab: Thông báo (placeholder) ──────── */}
                {activeTab === 'notifications' && (
                    <View className="items-center rounded-2xl bg-surface p-8">
                        <Ionicons name="notifications-outline" size={48} color={COLORS.textMuted} />
                        <Text className="mt-3 text-base font-semibold text-foreground">Cài đặt thông báo</Text>
                        <Text className="mt-1 text-center text-sm text-muted">
                            Bật/tắt thông báo push, cảnh báo tồn kho thấp
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
