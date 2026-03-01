import { createStackNavigator } from '@react-navigation/stack';
import type { ProfileStackParamList } from './types';
import { ProfileScreen } from '@/src/screens/ProfileScreen';
import { ChangePasswordScreen } from '@/src/screens/ChangePasswordScreen';
import { SalesReportScreen } from '@/src/screens/reports/SalesReportScreen';
import { STACK_SCREEN_OPTIONS } from './screenOptions';

const Stack = createStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
    return (
        <Stack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="SalesReport" component={SalesReportScreen} />
        </Stack.Navigator>
    );
}
