import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { HomeScreen } from '@/src/screens/HomeScreen';
import { ProductsScreen } from '@/src/screens/ProductsScreen';
import { OrdersScreen } from '@/src/screens/OrdersScreen';
import { ProfileNavigator } from './ProfileNavigator';
import { COLORS } from '@/src/constants/colors';
import { stores } from '@/src/data/mockData';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    Products: { active: 'cube', inactive: 'cube-outline' },
    Orders: { active: 'receipt', inactive: 'receipt-outline' },
    ProfileStack: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
    Home: 'Trang chủ',
    Products: 'Sản phẩm',
    Orders: 'Đơn hàng',
    ProfileStack: 'Hồ sơ',
};

interface Props {
    onLogout: () => void;
}

export function MainNavigator({ onLogout }: Props) {
    const currentStore = stores[0];

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, size }) => {
                    const icons = TAB_ICONS[route.name];
                    return (
                        <Ionicons
                            name={(focused ? icons.active : icons.inactive) as any}
                            size={size}
                            color={focused ? COLORS.primary : '#94A3B8'}
                        />
                    );
                },
                tabBarLabel: TAB_LABELS[route.name],
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
                tabBarStyle: {
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 65,
                    borderTopWidth: 1,
                    borderTopColor: '#E2E8F0',
                },
            })}
        >
            <Tab.Screen name="Home">
                {() => <HomeScreen currentStore={currentStore} />}
            </Tab.Screen>
            <Tab.Screen name="Products" component={ProductsScreen} />
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="ProfileStack">
                {() => <ProfileNavigator onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
