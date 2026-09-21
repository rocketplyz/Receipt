import { useColorScheme } from 'react-native';

const light = {
  background: '#FFFFFF',
  surface: '#F5F5F7',
  text: '#111114',
  textMuted: '#6B6B70',
  border: '#E2E2E6',
  accent: '#2563EB',
  danger: '#DC2626',
  warning: '#D97706',
  safe: '#16A34A',
};

const dark = {
  background: '#0E0E10',
  surface: '#1C1C1F',
  text: '#F5F5F7',
  textMuted: '#9A9AA1',
  border: '#2E2E32',
  accent: '#60A5FA',
  danger: '#F87171',
  warning: '#FBBF24',
  safe: '#4ADE80',
};

export type ThemeColors = typeof light;

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
