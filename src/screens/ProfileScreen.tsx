import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { MenuItem } from '@/src/components/ui';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';
import { formatCompact } from '@/src/utils/format';
import { dashboardStats } from '@/src/data/mockData';
import type { ProfileStackParamList } from '@/src/navigation/types';

export function ProfileScreen() {
    const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
    const insets = useSafeAreaInsets();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Zustand — reusable ở bất kỳ screen nào
    const user = useAuthStore((s) => s.user);
    console.log(user);

    const logout = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            Toast.show({ type: 'success', text1: 'Đã đăng xuất', text2: 'Hẹn gặp lại!' });
            setShowLogoutModal(false);
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể đăng xuất, thử lại sau' });
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View className="bg-surface border-b border-divider px-5 pb-5 items-center"
                style={{ paddingTop: insets.top + 12 }}>
                <Text className="text-lg font-bold text-foreground">Hồ Sơ & Cài Đặt</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

                {/* Avatar Card */}
                <View className="bg-surface rounded-2xl p-5 items-center mb-4"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
                    <View className="w-20 h-20 rounded-full bg-primary-light items-center justify-center mb-3"
                        style={{ borderWidth: 3, borderColor: COLORS.primary }}>
                        <Ionicons name="person" size={36} color={COLORS.primary} />
                    </View>
                    <Text className="text-xl font-bold text-foreground">{user?.fullName || 'Chưa cập nhật'}</Text>
                    <Text className="text-sm text-muted mt-0.5">{user?.email || 'Quản lý cửa hàng'}</Text>
                    {user?.id && (
                        <View className="bg-bg px-2.5 py-1 rounded-lg mt-1.5">
                            <Text className="text-xs text-muted">ID: {user.id}</Text>
                        </View>
                    )}

                    {/* Stats Row */}
                    <View className="flex-row mt-4 w-full gap-2">
                        <View className="flex-1 bg-bg rounded-xl p-3 items-center">
                            <Text className="text-xs text-muted font-semibold uppercase">Doanh thu</Text>
                            <Text className="text-base font-extrabold text-foreground mt-1">{formatCompact(dashboardStats.totalSales)}</Text>
                            <Text className="text-xs font-semibold mt-0.5" style={{ color: COLORS.success }}>+{dashboardStats.totalSalesTrend}%</Text>
                        </View>
                        <View className="flex-1 bg-bg rounded-xl p-3 items-center">
                            <Text className="text-xs text-muted font-semibold uppercase">Giá trị kho</Text>
                            <Text className="text-base font-extrabold text-foreground mt-1">{formatCompact(dashboardStats.inventoryValue)}</Text>
                            <Text className="text-xs font-semibold mt-0.5" style={{ color: COLORS.success }}>+{dashboardStats.inventoryTrend}%</Text>
                        </View>
                    </View>
                </View>

                {/* Quản lý */}
                <Text className="text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">Quản lý</Text>
                <View className="bg-surface rounded-2xl overflow-hidden mb-4">
                    <MenuItem icon="storefront-outline" label="Quản lý cửa hàng" subtitle="Địa điểm & thông tin" iconColor={COLORS.primary}
                        onPress={() => Toast.show({ type: 'info', text1: 'Quản lý cửa hàng', text2: 'Sắp có' })} />
                    <MenuItem icon="people-outline" label="Quản lý nhân viên" subtitle="Phân quyền & vai trò" iconColor={COLORS.info}
                        onPress={() => Toast.show({ type: 'info', text1: 'Quản lý nhân viên', text2: 'Sắp có' })} />
                    <MenuItem icon="stats-chart-outline" label="Báo cáo doanh thu" subtitle="Biểu đồ & phân tích" iconColor={COLORS.success}
                        showBorder={false} onPress={() => navigation.navigate('SalesReport')} />
                </View>

                {/* Cài đặt */}
                <Text className="text-xs font-bold text-muted uppercase tracking-widest mb-2 ml-1">Cài đặt</Text>
                <View className="bg-surface rounded-2xl overflow-hidden mb-4">
                    <MenuItem icon="hardware-chip-outline" label="Thiết bị phần cứng" subtitle="Máy in & máy quét" iconColor={COLORS.warning}
                        onPress={() => Toast.show({ type: 'info', text1: 'Phần cứng', text2: 'Sắp có' })} />
                    <MenuItem icon="shield-checkmark-outline" label="Đổi mật khẩu" subtitle="Cập nhật bảo mật" iconColor={COLORS.success}
                        onPress={() => navigation.navigate('ChangePassword')} />
                    <MenuItem icon="help-circle-outline" label="Trợ giúp & Hỗ trợ" subtitle="FAQ & liên hệ" iconColor={COLORS.info}
                        showBorder={false} onPress={() => Toast.show({ type: 'info', text1: 'Trợ giúp', text2: 'Sắp có' })} />
                </View>

                {/* Logout */}
                <TouchableOpacity className="bg-surface rounded-2xl p-3.5 flex-row items-center justify-center mb-2"
                    activeOpacity={0.7} onPress={() => setShowLogoutModal(true)}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                    <Text className="text-base font-semibold ml-2" style={{ color: COLORS.error }}>Đăng Xuất</Text>
                </TouchableOpacity>

                <Text className="text-center text-xs text-text-light mt-2">Phiên bản 2.4.0 (Build 1016)</Text>
            </ScrollView>

            {/* Logout Modal */}
            <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
                <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: COLORS.overlay }}>
                    <View className="bg-surface rounded-3xl w-full p-6 items-center">
                        <View className="w-14 h-14 rounded-2xl items-center justify-center mb-4" style={{ backgroundColor: COLORS.errorLight }}>
                            <Ionicons name="log-out-outline" size={28} color={COLORS.error} />
                        </View>
                        <Text className="text-lg font-bold text-foreground mb-2">Đăng Xuất?</Text>
                        <Text className="text-sm text-muted text-center mb-5">
                            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                        </Text>
                        <TouchableOpacity className="w-full h-12 rounded-xl items-center justify-center mb-2.5"
                            style={{ backgroundColor: COLORS.error }} activeOpacity={0.8} onPress={handleLogout} disabled={loggingOut}>
                            <Text className="text-white text-base font-bold">{loggingOut ? 'Đang đăng xuất...' : 'Đăng Xuất'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="w-full h-12 rounded-xl bg-bg items-center justify-center"
                            activeOpacity={0.7} onPress={() => setShowLogoutModal(false)}>
                            <Text className="text-text-secondary text-base font-semibold">Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
