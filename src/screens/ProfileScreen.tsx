import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@/src/stores';
import { COLORS } from '@/src/constants/colors';
import type { ProfileStackParamList } from '@/src/navigation/types';
import { ScreenHeader } from '@/src/components';

type ItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function SettingItem({ icon, title, subtitle, onPress }: ItemProps) {
  return (
    <TouchableOpacity
      className="mb-3 flex-row items-center rounded-xl border border-border bg-surface p-4"
      activeOpacity={0.8}
      onPress={onPress}>
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const insets = useSafeAreaInsets();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      Toast.show({ type: 'success', text1: 'Đã đăng xuất', text2: 'Hẹn gặp lại!' });
      setShowLogoutModal(false);
    } catch {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể đăng xuất, thử lại sau' });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <ScreenHeader title="Hồ sơ & Cài đặt" topInset={insets.top} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View className="mb-5 items-center rounded-2xl border border-border bg-surface p-6">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full border-4 border-bg bg-primary/15">
            <Ionicons name="person" size={40} color={COLORS.primary} />
            <TouchableOpacity
              className="absolute -bottom-1 -right-1 h-7 w-7 items-center justify-center rounded-full bg-primary"
              activeOpacity={0.8}>
              <Ionicons name="pencil" size={14} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <Text className="text-xl font-bold text-foreground">
            {user?.full_name || 'Nguyễn Văn A'}
          </Text>
          <Text className="mt-1 text-sm text-muted">{user?.email || 'Quản lý cửa hàng'}</Text>
          <View className="mt-2 rounded-full bg-primary/10 px-3 py-1">
            <Text className="text-xs font-semibold text-primary">ID: {user?.id || '987654'}</Text>
          </View>
        </View>

        <Text className="mb-3 ml-1 text-xs font-bold uppercase tracking-[1.5px] text-muted">
          Quản lý
        </Text>
        <SettingItem
          icon="storefront-outline"
          title="Quản lý cửa hàng"
          subtitle="Quản lý chi nhánh & thông tin"
          onPress={() => Toast.show({ type: 'info', text1: 'Quản lý cửa hàng', text2: 'Sắp có' })}
        />
        <SettingItem
          icon="people-outline"
          title="Quản lý nhân viên"
          subtitle="Phân quyền & vai trò"
          onPress={() => Toast.show({ type: 'info', text1: 'Quản lý nhân viên', text2: 'Sắp có' })}
        />
        <SettingItem
          icon="stats-chart-outline"
          title="Báo cáo doanh thu"
          subtitle="Biểu đồ & phân tích doanh thu"
          onPress={() => navigation.navigate('SalesReport')}
        />

        <Text className="mb-3 ml-1 mt-4 text-xs font-bold uppercase tracking-[1.5px] text-muted">
          Cài đặt ứng dụng
        </Text>
        <SettingItem
          icon="hardware-chip-outline"
          title="Cài đặt phần cứng"
          subtitle="Máy in & máy quét"
          onPress={() => Toast.show({ type: 'info', text1: 'Phần cứng', text2: 'Sắp có' })}
        />
        <SettingItem
          icon="shield-checkmark-outline"
          title="Đổi mật khẩu"
          subtitle="Cập nhật bảo mật tài khoản"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <SettingItem
          icon="help-circle-outline"
          title="Trợ giúp & Hỗ trợ"
          subtitle="Câu hỏi thường gặp & liên hệ"
          onPress={() => Toast.show({ type: 'info', text1: 'Trợ giúp', text2: 'Sắp có' })}
        />

        <TouchableOpacity
          className="mt-4 flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 py-4"
          activeOpacity={0.8}
          onPress={() => setShowLogoutModal(true)}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text className="ml-2 text-base font-semibold" style={{ color: COLORS.error }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>

        <Text className="mt-3 text-center text-xs text-text-light">
          Phiên bản 2.4.0 (Build 305)
        </Text>
      </ScrollView>

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}>
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ backgroundColor: COLORS.overlay }}>
          <View className="w-full rounded-3xl bg-surface p-6">
            <View
              className="mb-4 h-14 w-14 items-center justify-center self-center rounded-2xl"
              style={{ backgroundColor: COLORS.errorLight }}>
              <Ionicons name="log-out-outline" size={26} color={COLORS.error} />
            </View>
            <Text className="text-center text-lg font-bold text-foreground">Đăng xuất?</Text>
            <Text className="mt-2 text-center text-sm text-muted">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
            </Text>

            <TouchableOpacity
              className="mt-5 h-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: COLORS.error }}
              activeOpacity={0.85}
              onPress={handleLogout}
              disabled={loggingOut}>
              <Text className="text-base font-bold text-white">
                {loggingOut ? 'Đang đăng xuất...' : 'Đăng Xuất'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-2.5 h-12 items-center justify-center rounded-xl bg-bg"
              activeOpacity={0.8}
              onPress={() => setShowLogoutModal(false)}>
              <Text className="text-base font-semibold text-text-secondary">Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
