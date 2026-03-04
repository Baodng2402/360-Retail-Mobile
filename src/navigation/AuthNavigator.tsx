import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import {
    IntroductionScreen,
    LoginScreen,
    SignupScreen,
    OTPScreen,
    ForgotPasswordScreen,
    ResetPasswordScreen,
} from '@/src/screens/auth';
import { STACK_SCREEN_OPTIONS } from './screenOptions';

// =============================================
// Auth Navigator — Stack cho luồng xác thực
// Introduction → Login ↔ Signup ↔ OTP
//                     ↘ ForgotPassword → ResetPassword
// =============================================

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={STACK_SCREEN_OPTIONS} initialRouteName="Introduction">
            <Stack.Screen name="Introduction" component={IntroductionScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
    );
}
