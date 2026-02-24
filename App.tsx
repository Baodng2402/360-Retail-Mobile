import './global.css';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthNavigator, MainNavigator } from '@/src/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import { COLORS } from '@/src/constants/colors';

function RootNavigator() {
  const { isAuthenticated, checkAuth, login, logout } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {isAuthenticated ? (
        <MainNavigator onLogout={logout} />
      ) : (
        <AuthNavigator onLogin={login} />
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}
