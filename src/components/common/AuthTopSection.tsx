import type { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

interface AuthTopSectionProps {
  topInset: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: ReactNode;
  onBack?: () => void;
}

export function AuthTopSection({ topInset, icon, title, subtitle, onBack }: AuthTopSectionProps) {
  return (
    <>
      <View className="px-6" style={{ paddingTop: topInset + 20 }}>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full"
          activeOpacity={0.7}
          onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View className="items-center px-6 pb-9 pt-4">
        <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
          <Ionicons name={icon} size={32} color={COLORS.primary} />
        </View>
        <Text className="text-center text-[28px] font-extrabold text-foreground">{title}</Text>
        <View className="mt-2 items-center">{typeof subtitle === 'string' ? <Text className="text-center text-base text-muted">{subtitle}</Text> : subtitle}</View>
      </View>
    </>
  );
}
