import type { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/src/constants/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  topInset: number;
  rightSlot?: ReactNode;
  children?: ReactNode;
  showBackButton?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  topInset,
  rightSlot,
  children,
  showBackButton,
}: ScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="border-b border-divider bg-bg px-4 pb-4" style={{ paddingTop: topInset + 12 }}>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="mr-3 flex-1 flex-row items-center">
          {showBackButton && (
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-2xl font-extrabold text-foreground">{title}</Text>
            {subtitle ? <Text className="mt-1 text-xs text-muted">{subtitle}</Text> : null}
          </View>
        </View>
        {rightSlot ? <View>{rightSlot}</View> : null}
      </View>
      {children}
    </View>
  );
}
