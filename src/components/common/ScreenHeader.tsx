import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  topInset: number;
  rightSlot?: ReactNode;
  children?: ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  topInset,
  rightSlot,
  children,
}: ScreenHeaderProps) {
  return (
    <View className="border-b border-divider bg-bg px-4 pb-4" style={{ paddingTop: topInset + 12 }}>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-2xl font-extrabold text-foreground">{title}</Text>
          {subtitle ? <Text className="mt-1 text-xs text-muted">{subtitle}</Text> : null}
        </View>
        {rightSlot ? <View>{rightSlot}</View> : null}
      </View>
      {children}
    </View>
  );
}
