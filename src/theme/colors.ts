export const colors = {
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',
  secondary: '#22C55E',
  secondaryLight: '#4ADE80',
  secondaryDark: '#16A34A',

  backgroundDark: '#0F172A',
  backgroundLight: '#F8FAFC',

  cardDark: '#1E293B',
  cardDarkElevated: '#334155',
  cardLight: '#FFFFFF',

  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textDark: '#1E293B',
  textMuted: '#64748B',

  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  warning: '#F59E0B',
  warningLight: '#FDE68A',
  success: '#22C55E',
  info: '#3B82F6',

  border: '#334155',
  borderLight: '#E2E8F0',

  overlay: 'rgba(0, 0, 0, 0.5)',
  glassDark: 'rgba(30, 41, 59, 0.8)',
  glassLight: 'rgba(255, 255, 255, 0.8)',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
