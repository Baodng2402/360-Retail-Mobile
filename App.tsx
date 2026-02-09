import './global.css';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { HomeScreen, ProductsScreen, OrdersScreen, ProfileScreen, LoginScreen, SignupScreen } from './src/screens';
import { stores } from './src/data/mockData';
import { COLORS } from './src/constants/colors';

type TabKey = 'home' | 'products' | 'orders' | 'profile';
type AuthScreen = 'login' | 'signup';

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Trang chủ' },
  { key: 'products', icon: 'cube', label: 'Sản phẩm' },
  { key: 'orders', icon: 'receipt', label: 'Đơn hàng' },
  { key: 'profile', icon: 'person', label: 'Hồ sơ' },
];

function TabBar({ activeTab, onTabChange }: { activeTab: TabKey; onTabChange: (tab: TabKey) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row bg-white border-t border-slate-200 shadow-lg"
      style={{ paddingBottom: insets.bottom + 8, paddingTop: 8 }}
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            className="flex-1 items-center py-2"
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View className={isActive ? 'bg-teal-50 rounded-xl p-2' : undefined}>
              <Ionicons
                name={isActive ? tab.icon as any : `${tab.icon}-outline` as any}
                size={24}
                color={isActive ? COLORS.primary : '#94A3B8'}
              />
            </View>
            <Text className={`text-xs mt-1 font-semibold ${isActive ? 'text-teal-500' : 'text-slate-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const currentStore = stores[0];

  if (!isAuthenticated) {
    if (authScreen === 'login') {
      return (
        <LoginScreen
          onLogin={() => setIsAuthenticated(true)}
          onNavigateToSignup={() => setAuthScreen('signup')}
        />
      );
    }
    return (
      <SignupScreen
        onSignup={() => setIsAuthenticated(true)}
        onNavigateToLogin={() => setAuthScreen('login')}
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen currentStore={currentStore} />;
      case 'products': return <ProductsScreen />;
      case 'orders': return <OrdersScreen />;
      case 'profile': return <ProfileScreen />;
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {renderScreen()}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
      <Toast />
    </SafeAreaProvider>
  );
}
