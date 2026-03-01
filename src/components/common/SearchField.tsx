import { memo } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

function SearchFieldComponent({
  value,
  onChangeText,
  placeholder,
  rightIcon,
  onRightPress,
}: SearchFieldProps) {
  return (
    <View className="h-12 flex-row items-center rounded-xl border border-border bg-surface px-3">
      <Ionicons name="search" size={18} color={COLORS.textMuted} />
      <TextInput
        className="ml-2 flex-1 text-base text-foreground"
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
      {rightIcon ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={18} color={COLORS.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export const SearchField = memo(SearchFieldComponent);
