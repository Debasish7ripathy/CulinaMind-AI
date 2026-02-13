import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AlertTriangle, Clock } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { Ingredient } from '../types/ingredient';
import { hapticLight } from '../utils/haptics';

interface IngredientCardProps {
  ingredient: Ingredient;
  onPress?: (ingredient: Ingredient) => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  onPress,
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const daysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(ingredient.expiryDate);
    const diff = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const days = daysUntilExpiry();
  const isExpiringSoon = days <= 3;
  const isExpired = days < 0;

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      Vegetables: '🥬',
      Fruits: '🍎',
      Dairy: '🥛',
      Meat: '🥩',
      Grains: '🌾',
      Spices: '🧂',
      Beverages: '🥤',
      Snacks: '🍪',
      Frozen: '🧊',
      Other: '📦',
    };
    return emojis[category] || '📦';
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
            borderColor: isExpired
              ? colors.danger
              : isExpiringSoon
              ? colors.warning
              : isDarkMode
              ? colors.border
              : colors.borderLight,
            borderWidth: isExpired || isExpiringSoon ? 1.5 : 0.5,
          },
          getShadow('small'),
        ]}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          hapticLight();
          onPress?.(ingredient);
        }}
      >
        <Text style={styles.emoji}>{getCategoryEmoji(ingredient.category)}</Text>
        <Text
          style={[
            typography.bodySmall,
            styles.name,
            { color: isDarkMode ? colors.textPrimary : colors.textDark },
          ]}
          numberOfLines={1}
        >
          {ingredient.name}
        </Text>
        <Text
          style={[
            typography.caption,
            { color: isDarkMode ? colors.textSecondary : colors.textMuted },
          ]}
        >
          {ingredient.quantity} {ingredient.unit}
        </Text>
        <View style={styles.expiryRow}>
          {isExpired ? (
            <AlertTriangle size={12} color={colors.danger} />
          ) : (
            <Clock
              size={12}
              color={isExpiringSoon ? colors.warning : colors.textSecondary}
            />
          )}
          <Text
            style={[
              typography.caption,
              {
                color: isExpired
                  ? colors.danger
                  : isExpiringSoon
                  ? colors.warning
                  : colors.textSecondary,
                marginLeft: 4,
              },
            ]}
          >
            {isExpired
              ? 'Expired'
              : days === 0
              ? 'Today'
              : days === 1
              ? '1 day'
              : `${days} days`}
          </Text>
        </View>
        {ingredient.isSurplus && (
          <View style={styles.surplusBadge}>
            <Text style={styles.surplusText}>Surplus</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
    textAlign: 'center',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  surplusBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  surplusText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: colors.secondary,
  },
});

export default IngredientCard;
