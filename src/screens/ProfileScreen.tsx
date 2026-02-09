import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { MenuItem } from '../components/ui';
import { COLORS } from '../constants/colors';

const MENU_ITEMS = [
    { icon: 'person-outline', label: 'Thông tin cá nhân', color: COLORS.primary, bgClass: 'bg-teal-50' },
    { icon: 'storefront-outline', label: 'Quản lý cửa hàng', color: COLORS.accent, bgClass: 'bg-orange-50' },
    { icon: 'notifications-outline', label: 'Thông báo', color: COLORS.warning, bgClass: 'bg-amber-50' },
    { icon: 'shield-checkmark-outline', label: 'Bảo mật', color: COLORS.success, bgClass: 'bg-green-50' },
    { icon: 'help-circle-outline', label: 'Trợ giúp', color: COLORS.blue, bgClass: 'bg-blue-50' },
];

export function ProfileScreen() {
    const insets = useSafeAreaInsets();

    const handleMenuPress = (label: string) => {
        Toast.show({ type: 'info', text1: label, text2: 'Tính năng đang phát triển' });
    };

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: () => Toast.show({ type: 'success', text1: 'Đã đăng xuất' }) },
        ]);
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
                            onPress={() => handleMenuPress(item.label)}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    className="bg-white rounded-2xl p-4 mt-4 flex-row items-center shadow-sm"
                    activeOpacity={0.7}
                    onPress={handleLogout}
                >
                    <View className="w-11 h-11 rounded-xl bg-red-50 items-center justify-center">
                        <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                    </View>
                    <Text className="text-base font-semibold text-red-500 ml-3">Đăng xuất</Text>
                </TouchableOpacity>

                <Text className="text-center text-slate-400 text-sm mt-6">Phiên bản 1.0.0</Text>
            </ScrollView>
        </View>
    );
}
