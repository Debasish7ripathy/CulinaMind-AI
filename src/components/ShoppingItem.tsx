import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { ShoppingItem as ShoppingItemType } from '../types/shoppingItem';
import { hapticSelection } from '../utils/haptics';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onToggle?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  onToggle,
  onRemove,
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 100);
    hapticSelection();
    onToggle?.(item.id);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
            opacity: item.isChecked ? 0.6 : 1,
          },
        ]}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: item.isChecked
                ? colors.secondary
                : 'transparent',
              borderColor: item.isChecked
                ? colors.secondary
                : isDarkMode
                ? colors.border
                : colors.borderLight,
            },
          ]}
        >
          {item.isChecked && <Check size={14} color={colors.white} />}
        </View>
        <View style={styles.content}>
          <Text
            style={[
              typography.body,
              {
                color: isDarkMode ? colors.textPrimary : colors.textDark,
                textDecorationLine: item.isChecked ? 'line-through' : 'none',
              },
            ]}
          >
            {item.name}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {item.quantity} {item.unit}
          </Text>
        </View>
        {item.estimatedPrice && (
          <Text
            style={[
              typography.bodySmall,
              {
                color: isDarkMode ? colors.textSecondary : colors.textMuted,
                fontFamily: 'Inter-SemiBold',
              },
            ]}
          >
            ${item.estimatedPrice.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
});

export default ShoppingItem;
