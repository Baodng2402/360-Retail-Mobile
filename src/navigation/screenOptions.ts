import type { StackNavigationOptions } from '@react-navigation/stack';
import { COLORS } from '@/src/constants/colors';

export const STACK_SCREEN_OPTIONS: StackNavigationOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: COLORS.bg },
};
