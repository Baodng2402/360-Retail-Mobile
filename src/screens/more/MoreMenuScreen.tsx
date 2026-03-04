import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import { ScreenHeader } from '@/src/components';

// =============================================
// MoreMenuScreen — Menu "Thêm" chứa tất cả screens quản lý
//
// Hiển thị menu items theo vai trò:
//   - Staff: chỉ thấy Chấm công, Công việc, KH, CRM, Cài đặt
//   - Manager: + Nhân sự, SP, Kho, Cửa hàng, Báo cáo
//   - StoreOwner: + Subscription
// =============================================

type Props = StackScreenProps<MoreStackParamList, 'MoreMenu'>;

/** Cấu hình 1 menu item */
interface MenuItem {
    key: keyof MoreStackParamList;
    label: string;
    icon: string;
    description: string;
    /** Roles được phép xem menu này */
    roles: string[];
}

/** Tất cả menu items — thứ tự hiển thị */
const MENU_ITEMS: MenuItem[] = [
    {
        key: 'Timekeeping',
        label: 'Chấm công',
        icon: 'finger-print-outline',
        description: 'Check-in/out, lịch sử chấm công',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'MyTasks',
        label: 'Công việc của tôi',
        icon: 'checkbox-outline',
        description: 'Xem và cập nhật việc được giao',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'StaffManagement',
        label: 'Quản lý nhân sự',
        icon: 'people-outline',
        description: 'Nhân viên, mời NV, giao việc',
        roles: ['StoreOwner', 'Manager'],
    },
    {
        key: 'StoreManagement',
        label: 'Quản lý cửa hàng',
        icon: 'storefront-outline',
        description: 'Thêm/sửa cửa hàng',
        roles: ['StoreOwner', 'Manager'],
    },
    {
        key: 'ProductManagement',
        label: 'Sản phẩm',
        icon: 'pricetag-outline',
        description: 'CRUD sản phẩm, danh mục, biến thể',
        roles: ['StoreOwner', 'Manager'],
    },
    {
        key: 'InventoryManagement',
        label: 'Kho hàng',
        icon: 'cube-outline',
        description: 'Phiếu nhập/xuất kho',
        roles: ['StoreOwner', 'Manager'],
    },
    {
        key: 'CustomerManagement',
        label: 'Khách hàng',
        icon: 'person-outline',
        description: 'CRUD khách hàng, loyalty',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'CrmDashboard',
        label: 'CRM & Loyalty',
        icon: 'heart-outline',
        description: 'Phản hồi, tích điểm, quy đổi',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'Reports',
        label: 'Báo cáo',
        icon: 'bar-chart-outline',
        description: 'Thống kê phản hồi, đánh giá',
        roles: ['StoreOwner', 'Manager'],
    },
    {
        key: 'Settings',
        label: 'Cài đặt',
        icon: 'settings-outline',
        description: 'Thông tin CH, bảo mật',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'Subscription',
        label: 'Gói dịch vụ',
        icon: 'diamond-outline',
        description: 'Xem và nâng cấp gói',
        roles: ['StoreOwner'],
    },
];

export function MoreMenuScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const rawRole = useAuthStore((s) => s.user?.role);

    // Role từ JWT có thể là string hoặc array — normalize luôn thành string
    const userRole = Array.isArray(rawRole) ? rawRole[0] ?? '' : rawRole ?? '';

    // Debug: xem role nhận được từ store
    console.log('[MoreMenu] userRole:', userRole);

    /** Lọc menu items theo role hiện tại — nếu role rỗng, hiện tất cả */
    const visibleItems = userRole
        ? MENU_ITEMS.filter((item) => item.roles.includes(userRole))
        : MENU_ITEMS;

    return (
        <View className="flex-1 bg-bg">
            {/* Header */}
            <View className='mb'>
                <ScreenHeader title="Quản lý cửa hàng" topInset={insets.top} />
            </View>


            {/* Menu Grid */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}>
                {visibleItems.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        className="mb-3 flex-row items-center rounded-2xl bg-surface p-4"
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate(item.key as any)}>
                        <View
                            className="mr-4 h-11 w-11 items-center justify-center rounded-xl"
                            style={{ backgroundColor: COLORS.primaryLight }}>
                            <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-foreground">{item.label}</Text>
                            <Text className="mt-0.5 text-xs text-muted">{item.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
