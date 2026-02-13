import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  description: string;
  emoji: string;
  backgroundColor?: string;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  title,
  description,
  emoji,
  backgroundColor,
}) => {
  return (
    <View style={[styles.slide, backgroundColor ? { backgroundColor } : null]}>
      <View style={styles.illustrationContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[typography.h2, styles.title]}>{title}</Text>
        <Text style={[typography.body, styles.description]}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default OnboardingSlide;
