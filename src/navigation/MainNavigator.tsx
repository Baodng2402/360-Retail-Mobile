import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { HomeScreen } from '@/src/screens/HomeScreen';
import { ProductsScreen } from '@/src/screens/ProductsScreen';
import { OrdersScreen } from '@/src/screens/OrdersScreen';
import { ProfileNavigator } from './ProfileNavigator';
import { RentalsNavigator } from './RentalsNavigator';
import { COLORS } from '@/src/constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG: Record<keyof MainTabParamList, { active: string; inactive: string; label: string }> = {
    Home: { active: 'home', inactive: 'home-outline', label: 'Tổng quan' },
    Rentals: { active: 'pricetag', inactive: 'pricetag-outline', label: 'Bán hàng' },
    Orders: { active: 'receipt', inactive: 'receipt-outline', label: 'Đơn hàng' },
    Inventory: { active: 'cube', inactive: 'cube-outline', label: 'Kho hàng' },
    ProfileStack: { active: 'person', inactive: 'person-outline', label: 'Hồ sơ' },
};

export function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                lazy: true,
                freezeOnBlur: true,
                tabBarHideOnKeyboard: true,
                tabBarIcon: ({ focused }) => {
                    const config = TAB_CONFIG[route.name];
                    return (
                        <Ionicons
                            name={(focused ? config.active : config.inactive) as any}
                            size={20}
                            color={focused ? COLORS.primary : COLORS.textMuted}
                        />
                    );
                },
                tabBarLabel: TAB_CONFIG[route.name].label,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                tabBarItemStyle: {
                    paddingTop: 2,
                },
                tabBarStyle: {
                    paddingTop: 6,
                    paddingBottom: 8,
                    height: 64,
                    backgroundColor: COLORS.surface,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.divider,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Rentals" component={RentalsNavigator} />
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Inventory" component={ProductsScreen} />
            <Tab.Screen name="ProfileStack" component={ProfileNavigator} />
        </Tab.Navigator>
    );
}
