import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { hapticLight } from '../utils/haptics';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onPress,
  style,
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
          },
          getShadow('small'),
        ]}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          hapticLight();
          onPress();
        }}
      >
        {icon}
        <Text
          style={[
            typography.caption,
            styles.label,
            {
              color: isDarkMode ? colors.textSecondary : colors.textMuted,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    minHeight: 88,
    minWidth: 88,
  },
  label: {
    marginTop: spacing.sm,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
});

export default QuickActionButton;
