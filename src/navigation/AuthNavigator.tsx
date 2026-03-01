import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import { LoginScreen, SignupScreen, OTPScreen } from '@/src/screens/auth';
import { STACK_SCREEN_OPTIONS } from './screenOptions';

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
        </Stack.Navigator>
    );
}
