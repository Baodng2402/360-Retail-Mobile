import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { MenuItem } from '@/src/components/ui';
import { COLORS } from '@/src/constants/colors';
import type { ProfileStackParamList } from '@/src/navigation/types';

interface Props {
    onLogout: () => void;
}

const MENU_ITEMS = [
    { icon: 'person-outline', label: 'Thông tin cá nhân', color: COLORS.primary, bgClass: 'bg-teal-50' },
    { icon: 'storefront-outline', label: 'Quản lý cửa hàng', color: COLORS.accent, bgClass: 'bg-orange-50' },
    { icon: 'notifications-outline', label: 'Thông báo', color: COLORS.warning, bgClass: 'bg-amber-50' },
    { icon: 'shield-checkmark-outline', label: 'Đổi mật khẩu', color: COLORS.success, bgClass: 'bg-green-50', screen: 'ChangePassword' as const },
    { icon: 'help-circle-outline', label: 'Trợ giúp', color: COLORS.blue, bgClass: 'bg-blue-50' },
];

export function ProfileScreen({ onLogout }: Props) {
    const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
    const insets = useSafeAreaInsets();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleMenuPress = (label: string, screen?: string) => {
        if (screen) {
            navigation.navigate(screen as keyof ProfileStackParamList);
            return;
        }
        Toast.show({ type: 'info', text1: label, text2: 'Tính năng đang phát triển' });
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await AsyncStorage.clear();
            Toast.show({ type: 'success', text1: 'Đăng xuất thành công', text2: 'Hẹn gặp lại bạn!' });
            setShowLogoutModal(false);
            onLogout();
        } catch {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể đăng xuất, thử lại sau' });
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 80, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
                <Text className="text-white text-2xl font-bold mb-4">Hồ sơ</Text>
            </LinearGradient>

            <View className="mx-5 -mt-12 bg-white rounded-2xl p-4 flex-row items-center shadow-lg">
                <View className="w-16 h-16 rounded-full bg-teal-50 items-center justify-center">
                    <Text className="text-2xl font-extrabold text-teal-700">NA</Text>
                </View>
                <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-slate-800">Nguyễn Văn A</Text>
                    <Text className="text-sm text-slate-400 mt-0.5">owner@360retail.vn</Text>
                    <View className="flex-row mt-2">
                        <View className="bg-orange-100 px-2.5 py-1 rounded-full">
                            <Text className="text-xs font-bold text-orange-600">Owner</Text>
                        </View>
                        <View className="bg-amber-100 px-2.5 py-1 rounded-full ml-1.5 flex-row items-center">
                            <Ionicons name="diamond" size={10} color={COLORS.warning} />
                            <Text className="text-xs font-bold text-amber-600 ml-1">Premium</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    className="w-11 h-11 rounded-full bg-teal-50 items-center justify-center"
                    activeOpacity={0.7}
                    onPress={() => handleMenuPress('Chỉnh sửa hồ sơ')}
                >
                    <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {MENU_ITEMS.map((item, index) => (
                        <MenuItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            iconColor={item.color}
                            bgColor={item.bgClass}
                            showBorder={index < MENU_ITEMS.length - 1}
                            onPress={() => handleMenuPress(item.label, (item as any).screen)}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    className="bg-white rounded-2xl p-4 mt-4 flex-row items-center shadow-sm"
                    activeOpacity={0.7}
                    onPress={() => setShowLogoutModal(true)}
                >
                    <View className="w-11 h-11 rounded-xl bg-red-50 items-center justify-center">
                        <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                    </View>
                    <Text className="text-base font-semibold text-red-500 ml-3">Đăng xuất</Text>
                </TouchableOpacity>

                <Text className="text-center text-slate-400 text-sm mt-6">Phiên bản 1.0.0</Text>
            </ScrollView>

            <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
                <View className="flex-1 bg-black/50 items-center justify-center px-8">
                    <View className="bg-white rounded-3xl w-full p-6 items-center">
                        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
                            <Ionicons name="log-out-outline" size={32} color={COLORS.error} />
                        </View>
                        <Text className="text-xl font-bold text-slate-800 mb-2">Đăng xuất?</Text>
                        <Text className="text-sm text-slate-500 text-center mb-6">
                            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
                        </Text>
                        <TouchableOpacity
                            className="w-full h-12 rounded-xl bg-red-500 items-center justify-center mb-3"
                            activeOpacity={0.8}
                            onPress={handleLogout}
                            disabled={loggingOut}
                        >
                            <Text className="text-white text-base font-bold">
                                {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-full h-12 rounded-xl bg-slate-100 items-center justify-center"
                            activeOpacity={0.7}
                            onPress={() => setShowLogoutModal(false)}
                        >
                            <Text className="text-slate-600 text-base font-semibold">Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
