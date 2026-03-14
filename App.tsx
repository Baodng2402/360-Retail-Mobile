import './global.css';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, type Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AuthNavigator, MainNavigator } from '@/src/navigation';
import { navigationRef } from '@/src/navigation/navigationRef';
import { useAuthStore } from '@/src/stores';
import { useStoreStore } from '@/src/stores/useStoreStore';
import { registerSessionExpiredHandler } from '@/src/api/client';
import { COLORS } from '@/src/constants/colors';
import { UpgradeDialog } from '@/src/components/subscription/UpgradeDialog';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

// ─────────────────────────────────────────────
// Đăng ký session expired handler — chạy một lần khi module load
//
// Khi 401 xảy ra trong client.ts → handler này được gọi:
//   1. clearSession() → xóa auth state + subscription state
//   2. useStoreStore.clear() → xóa store state
//   3. isAuthenticated = false → React re-render → AuthNavigator tự hiện
//
// Dùng callback pattern để tránh circular import:
//   client.ts → stores → api → client (vòng tròn!)
// ─────────────────────────────────────────────
registerSessionExpiredHandler(async () => {
  await useAuthStore.getState().clearSession();
  useStoreStore.getState().clear();
});

// ─────────────────────────────────────────────
// Navigation Theme
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Root Navigator — Chọn Auth hay Main dựa vào auth state
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// App — Root component
//
// ErrorBoundary wrap toàn bộ app → crash 1 screen không làm trắng app
// ─────────────────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });

  const handleUpgrade = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigationRef.current as any)?.navigate('More', { screen: 'Subscription' });
  };

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} theme={NAV_THEME}>
          <RootNavigator />
          <UpgradeDialog onUpgrade={handleUpgrade} />
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
