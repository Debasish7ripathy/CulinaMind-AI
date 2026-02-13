import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { hapticSelection } from '../utils/haptics';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }, 100);
    hapticSelection();
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.chip,
          {
            backgroundColor: isActive
              ? colors.primary
              : colors.cardDark,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <Text
          style={[
            typography.buttonSmall,
            {
              color: isActive ? colors.white : colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
});

export default FilterChip;
