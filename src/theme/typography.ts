import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  buttonSmall: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
});
