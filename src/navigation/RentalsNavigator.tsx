import { createStackNavigator } from '@react-navigation/stack';
import type { RentalsStackParamList } from './types';
import { POSScreen } from '@/src/screens/pos/POSScreen';
import { CheckoutScreen } from '@/src/screens/pos/CheckoutScreen';

const Stack = createStackNavigator<RentalsStackParamList>();

export function RentalsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="POS" component={POSScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
    );
}
