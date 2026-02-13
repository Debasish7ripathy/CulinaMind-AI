import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { AlertTriangle, ArrowRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { hapticWarning } from '../utils/haptics';

interface SurplusAlertBannerProps {
  surplusCount: number;
  onPress?: () => void;
}

const SurplusAlertBanner: React.FC<SurplusAlertBannerProps> = ({
  surplusCount,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  if (surplusCount === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(400)} style={animatedStyle}>
      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          hapticWarning();
          onPress?.();
        }}
      >
        <View style={styles.iconContainer}>
          <AlertTriangle size={20} color={colors.warning} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[typography.bodySmall, styles.title]}>
            Surplus Alert!
          </Text>
          <Text style={[typography.caption, styles.subtitle]}>
            {surplusCount} item{surplusCount > 1 ? 's' : ''} available to share
            with the community
          </Text>
        </View>
        <ArrowRight size={18} color={colors.warning} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderColor: colors.warning + '40',
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    color: colors.warning,
  },
  subtitle: {
    color: colors.warningLight,
    marginTop: 2,
  },
});

export default SurplusAlertBanner;
