import { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/src/constants/colors';

interface PrimaryButtonProps {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  className?: string;
}

function PrimaryButtonComponent({
  label,
  loadingLabel = 'Đang xử lý...',
  loading = false,
  disabled = false,
  onPress,
  className = 'h-14 items-center justify-center rounded-xl',
}: PrimaryButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      className={className}
      style={{ backgroundColor: isDisabled ? COLORS.textMuted : COLORS.primary }}>
      <Text className="text-base font-bold text-slate-900">{loading ? loadingLabel : label}</Text>
    </TouchableOpacity>
  );
}

export const PrimaryButton = memo(PrimaryButtonComponent);
