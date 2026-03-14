export const COLORS = {
  // Primary — Teal accent (Synced from web repo)
  primary: '#19D6C8',
  primaryDark: '#0FA297',
  primaryLight: '#E0FAFA',

  // Action — Orange accent for CTAs (Synced from web repo)
  accent: '#FF7B21',
  accentDark: '#D45D0F',
  accentLight: '#FFE8DB',

  // Semantic
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FFA726',
  warningLight: '#FFF3E0',
  error: '#EF5350',
  errorLight: '#FFEBEE',
  info: '#42A5F5',
  infoLight: '#E3F2FD',

  // Light Theme Backgrounds
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  text: '#1E293B',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLight: '#CBD5E1',

  // Borders
  border: '#E2E8F0',
  divider: '#F1F5F9',

  // Misc
  overlay: 'rgba(0,0,0,0.5)',
} as const;

export const COLORS_DARK = {
  ...COLORS,
  bg: '#0B1220',
  surface: '#111A2B',
  card: '#111A2B',
  text: '#E2E8F0',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#243049',
  divider: '#1A253A',
  primaryLight: '#17363A',
  successLight: '#1B3322',
  warningLight: '#3C2F1A',
  errorLight: '#3E1F25',
  infoLight: '#1D2F44',
} as const;

export function resolveColors(isDarkMode: boolean) {
  return isDarkMode ? COLORS_DARK : COLORS;
}
