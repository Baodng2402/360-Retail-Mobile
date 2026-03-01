import './global.css';
import { useEffect } from 'react';
import {StatusBar } from 'react-native';
import { NavigationContainer, type Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthNavigator, MainNavigator } from '@/src/navigation';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';

const NAV_THEME: Theme = {
  dark: false,
  colors: {
    primary: COLORS.primary,
    background: COLORS.bg,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

function RootNavigator() {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) return null;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={NAV_THEME}>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}
