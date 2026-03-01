import { memo } from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

export interface HorizontalChipItem {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface HorizontalChipsProps {
  items: HorizontalChipItem[];
  activeKey: string;
  onPress: (key: string) => void;
  containerClassName?: string;
}

function HorizontalChipsComponent({
  items,
  activeKey,
  onPress,
  containerClassName = 'border-b border-divider bg-bg px-4 pb-2 pt-1',
}: HorizontalChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={containerClassName}
      contentContainerStyle={{ paddingRight: 4 }}>
      {items.map((item) => {
        const isActive = activeKey === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => onPress(item.key)}
            activeOpacity={0.8}
            className={`mr-2 h-10 flex-row items-center rounded-full px-4 ${
              isActive ? 'bg-primary' : 'bg-surface'
            }`}>
            {item.icon ? (
              <Ionicons
                name={item.icon}
                size={16}
                color={isActive ? '#0F172A' : COLORS.textMuted}
                style={{ marginRight: 6 }}
              />
            ) : null}
            <Text
              numberOfLines={1}
              className={`text-sm font-semibold leading-5 ${
                isActive ? 'text-slate-900' : 'text-muted'
              }`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export const HorizontalChips = memo(HorizontalChipsComponent);
