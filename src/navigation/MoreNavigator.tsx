import { createStackNavigator } from '@react-navigation/stack';
import type { MoreStackParamList } from './types';
import { STACK_SCREEN_OPTIONS } from './screenOptions';

// Screens
import { MoreMenuScreen } from '@/src/screens/more/MoreMenuScreen';
import { MyTasksScreen } from '@/src/screens/tasks/MyTasksScreen';
import { StaffManagementScreen } from '@/src/screens/staff/StaffManagementScreen';
import { EmployeeDetailScreen } from '@/src/screens/staff/EmployeeDetailScreen';
import { StoreManagementScreen } from '@/src/screens/stores/StoreManagementScreen';
import { CustomerManagementScreen } from '@/src/screens/customers/CustomerManagementScreen';
import { CrmDashboardScreen } from '@/src/screens/crm/CrmDashboardScreen';
import { ReportsScreen } from '@/src/screens/reports/ReportsScreen';
import { SettingsScreen } from '@/src/screens/settings/SettingsScreen';
import { TimekeepingScreen } from '@/src/screens/timekeeping/TimekeepingScreen';
import { SubscriptionScreen } from '@/src/screens/subscription/SubscriptionScreen';
import { ProductsScreen } from '@/src/screens/ProductsScreen';
import { InventoryScreen } from '@/src/screens/inventory/InventoryScreen';
import { ProductFormScreen } from '@/src/screens/products/ProductFormScreen';
import { CategoryFormScreen } from '@/src/screens/products/CategoryFormScreen';
import { InventoryDetailScreen } from '@/src/screens/inventory/InventoryDetailScreen';
import { InventoryFormScreen } from '@/src/screens/inventory/InventoryFormScreen';

// --- End of Screens import ---

// =============================================
// More Navigator — Stack cho tất cả screens quản lý
// Menu → từng module: HR, CRM, Cài đặt, v.v.
// =============================================

const Stack = createStackNavigator<MoreStackParamList>();

export function MoreNavigator() {
    return (
        <Stack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
            <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
            <Stack.Screen name="MyTasks" component={MyTasksScreen} />
            <Stack.Screen name="Timekeeping" component={TimekeepingScreen} />
            <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />
            <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
            <Stack.Screen name="StoreManagement" component={StoreManagementScreen} />
            <Stack.Screen name="ProductManagement" component={ProductsScreen} />
            <Stack.Screen name="ProductForm" component={ProductFormScreen} />
            <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
            <Stack.Screen name="InventoryManagement" component={InventoryScreen} />
            <Stack.Screen name="InventoryDetail" component={InventoryDetailScreen} />
            <Stack.Screen name="InventoryForm" component={InventoryFormScreen} />
            <Stack.Screen name="CustomerManagement" component={CustomerManagementScreen} />
            <Stack.Screen name="CrmDashboard" component={CrmDashboardScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        </Stack.Navigator>
    );
}
