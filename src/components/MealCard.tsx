import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Clock, Users, Flame } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { Meal } from '../types/meal';
import { hapticLight } from '../utils/haptics';

interface MealCardProps {
  meal: Meal;
  compact?: boolean;
  onPress?: (meal: Meal) => void;
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  compact = false,
  onPress,
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'Breakfast':
        return '#F59E0B';
      case 'Lunch':
        return '#3B82F6';
      case 'Dinner':
        return '#8B5CF6';
      case 'Snack':
        return '#22C55E';
      default:
        return colors.primary;
    }
  };

  if (compact) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[
            styles.compactCard,
            {
              backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
            },
          ]}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            hapticLight();
            onPress?.(meal);
          }}
        >
          <View
            style={[
              styles.mealTypeDot,
              { backgroundColor: getMealTypeColor(meal.mealType) },
            ]}
          />
          <View style={styles.compactContent}>
            <Text
              style={[
                typography.caption,
                {
                  color: getMealTypeColor(meal.mealType),
                  fontFamily: 'Inter-SemiBold',
                },
              ]}
            >
              {meal.mealType}
            </Text>
            <Text
              style={[
                typography.bodySmall,
                {
                  color: isDarkMode ? colors.textPrimary : colors.textDark,
                  fontFamily: 'Inter-SemiBold',
                },
              ]}
              numberOfLines={1}
            >
              {meal.name}
            </Text>
          </View>
          <View style={styles.compactMeta}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 3 }]}>
              {meal.prepTime + meal.cookTime}m
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
          },
          getShadow('medium'),
        ]}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          hapticLight();
          onPress?.(meal);
        }}
      >
        <View
          style={[
            styles.imagePlaceholder,
            {
              backgroundColor: isDarkMode
                ? colors.cardDarkElevated
                : colors.borderLight,
            },
          ]}
        >
          <Text style={styles.placeholderEmoji}>
            {meal.mealType === 'Breakfast'
              ? '🍳'
              : meal.mealType === 'Lunch'
              ? '🥗'
              : meal.mealType === 'Dinner'
              ? '🍝'
              : '🍎'}
          </Text>
        </View>
        <View style={styles.content}>
          <View
            style={[
              styles.mealTypeBadge,
              { backgroundColor: getMealTypeColor(meal.mealType) + '20' },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: getMealTypeColor(meal.mealType),
                  fontFamily: 'Inter-SemiBold',
                },
              ]}
            >
              {meal.mealType}
            </Text>
          </View>
          <Text
            style={[
              typography.subtitle,
              {
                color: isDarkMode ? colors.textPrimary : colors.textDark,
                marginTop: spacing.xs,
              },
            ]}
            numberOfLines={1}
          >
            {meal.name}
          </Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={[typography.caption, styles.metaText]}>
                {meal.prepTime + meal.cookTime} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color={colors.textSecondary} />
              <Text style={[typography.caption, styles.metaText]}>
                {meal.servings} servings
              </Text>
            </View>
            {meal.calories && (
              <View style={styles.metaItem}>
                <Flame size={14} color={colors.primary} />
                <Text style={[typography.caption, styles.metaText]}>
                  {meal.calories} cal
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  imagePlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  content: {
    padding: spacing.md,
  },
  mealTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: colors.textSecondary,
    marginLeft: 4,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  mealTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  compactContent: {
    flex: 1,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MealCard;
