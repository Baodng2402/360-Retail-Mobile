import { Stack } from 'expo-router';
import { LoginScreen } from '@/src/features/auth/screens/LoginScreen';

export default function LoginRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Đăng nhập',
          headerShown: false,
        }}
      />
      <LoginScreen />
    </>
  );
}

