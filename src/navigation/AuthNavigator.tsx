import { createStackNavigator } from '@react-navigation/stack';
import type { AuthStackParamList } from './types';
import { LoginScreen } from '@/src/screens/auth/LoginScreen';
import { SignupScreen } from '@/src/screens/auth/SignupScreen';

const Stack = createStackNavigator<AuthStackParamList>();

interface Props {
    onLogin: (token: string) => void;
}

export function AuthNavigator({ onLogin }: Props) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Signup">
                {(props) => <SignupScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}
