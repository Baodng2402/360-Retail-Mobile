import { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, type ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';
import { useAuthStore, useSubscriptionStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';
import type { MoreStackParamList } from '@/src/navigation/types';
import { ScreenHeader } from '@/src/components';
import { MENU_FEATURE_MAP } from '@/src/config/plan.config';
import { hasAnyRole } from '@/src/utils/role';

// =============================================
// MoreMenuScreen — Menu "Thêm" chứa tất cả screens quản lý
//
// Hiển thị menu items theo:
//   1. Vai trò nhân viên (role)
//   2. Tính năng khả dụng theo gói (feature gate)
//
// Ví dụ:
//   - Staff: chỉ thấy Chấm công, Công việc, KH, CRM, Cài đặt
//   - Manager dùng Trial: thêm SP, Kho, Báo cáo nhưng lọc cái cần nâng cấp
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

interface MenuCardProps {
    item: MenuItem;
    onPress: (item: MenuItem) => void;
}

const MenuCard = memo(function MenuCard({ item, onPress }: MenuCardProps) {
    return (
        <TouchableOpacity
            className="mb-3 flex-row items-center rounded-2xl bg-surface p-4"
            activeOpacity={0.7}
            onPress={() => onPress(item)}>
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
    );
});

/** Tất cả menu items — thứ tự hiển thị */
const MENU_ITEMS: MenuItem[] = [
    {
        key: 'Timekeeping',
        label: 'Chấm công',
        icon: 'time-outline',
        description: 'Check-in/out và lịch sử chấm công',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'MyTasks',
        label: 'Công việc của tôi',
        icon: 'list-outline',
        description: 'Theo dõi công việc được giao',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'TaskManagement',
        label: 'Quản lý công việc',
        icon: 'clipboard-outline',
        description: 'Phân công và cập nhật tiến độ task',
        roles: ['StoreOwner', 'Manager'],
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
        icon: 'cube-outline',
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
        description: 'Quản lý hồ sơ và lịch sử khách hàng',
        roles: ['StoreOwner', 'Manager', 'Staff'],
    },
    {
        key: 'CrmDashboard',
        label: 'CRM',
        icon: 'heart-outline',
        description: 'Phản hồi, loyalty và chăm sóc khách hàng',
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
        roles: ['StoreOwner', 'PotentialOwner'],
    },
];

export function MoreMenuScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const rawRole = useAuthStore((s) => s.user?.role);
    const canUse = useSubscriptionStore((s) => s.canUse);

    /**
     * Lọc menu items theo:
     * 1. Role hiện tại
     * 2. Feature gate — nếu menu item cần feature, check xem subscription có allow không
     */
    const visibleItems = useMemo(
        () =>
            MENU_ITEMS.filter((item) => {
                if (!hasAnyRole(rawRole, item.roles)) return false;

                const requiredFeature = MENU_FEATURE_MAP[item.key as string];
                if (requiredFeature && !canUse(requiredFeature)) {
                    return false;
                }

                return true;
            }),
        [rawRole, canUse],
    );

    const handlePress = useCallback(
        (item: MenuItem) => {
            navigation.navigate(item.key as any);
        },
        [navigation],
    );

    const keyExtractor = useCallback((item: MenuItem) => String(item.key), []);

    const renderMenuItem = useCallback<ListRenderItem<MenuItem>>(
        ({ item }) => <MenuCard item={item} onPress={handlePress} />,
        [handlePress],
    );

    const getItemLayout = useCallback(
        (_: ArrayLike<MenuItem> | null | undefined, index: number) => ({
            length: 76,
            offset: 76 * index,
            index,
        }),
        [],
    );

    return (
        <View className="flex-1 bg-bg">
            <ScreenHeader title="Trung tâm quản lý" topInset={insets.top} />

            <FlatList
                data={visibleItems}
                keyExtractor={keyExtractor}
                renderItem={renderMenuItem}
                getItemLayout={getItemLayout}
                initialNumToRender={10}
                maxToRenderPerBatch={12}
                windowSize={7}
                removeClippedSubviews
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            />
        </View>
    );
}
