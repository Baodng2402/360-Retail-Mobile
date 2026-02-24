import { createStackNavigator } from '@react-navigation/stack';
import type { ProfileStackParamList } from './types';
import { ProfileScreen } from '@/src/screens/ProfileScreen';
import { ChangePasswordScreen } from '@/src/screens/ChangePasswordScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

interface Props {
    onLogout: () => void;
}

export function ProfileNavigator({ onLogout }: Props) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Profile">
                {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="ChangePassword">
                {(props) => <ChangePasswordScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}
