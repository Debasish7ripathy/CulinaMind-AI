import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ChefHat, Clock, Check, AlertCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { RecipeMatch } from '../types/cookbook';

interface RecipeMatchCardProps {
  match: RecipeMatch;
  onPress?: () => void;
}

const RecipeMatchCard: React.FC<RecipeMatchCardProps> = ({ match, onPress }) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  const matchColor =
    match.matchPercentage >= 80
      ? colors.secondary
      : match.matchPercentage >= 50
      ? colors.warning
      : colors.danger;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }, getShadow('small')]}
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        {/* Match percentage badge */}
        <View style={[styles.matchBadge, { backgroundColor: matchColor + '20' }]}>
          <Text style={[styles.matchPercent, { color: matchColor }]}>
            {match.matchPercentage}%
          </Text>
          <Text style={[styles.matchLabel, { color: matchColor }]}>match</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[typography.subtitle, { color: textColor }]} numberOfLines={2}>
            {match.title}
          </Text>

          <View style={styles.sourceRow}>
            <ChefHat size={12} color={colors.textSecondary} />
            <Text
              style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}
              numberOfLines={1}
            >
              {match.cookbookTitle}
            </Text>
          </View>

          <Text
            style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}
            numberOfLines={2}
          >
            {match.description}
          </Text>

          {/* Ingredient matches */}
          <View style={styles.ingredientTags}>
            {match.matchedIngredients.slice(0, 4).map((ing, i) => (
              <View
                key={i}
                style={[styles.ingredientTag, { backgroundColor: colors.secondary + '15' }]}
              >
                <Check size={10} color={colors.secondary} />
                <Text style={[styles.tagText, { color: colors.secondary }]}>
                  {ing}
                </Text>
              </View>
            ))}
            {match.missingIngredients.slice(0, 2).map((ing, i) => (
              <View
                key={`m-${i}`}
                style={[styles.ingredientTag, { backgroundColor: colors.warning + '15' }]}
              >
                <AlertCircle size={10} color={colors.warning} />
                <Text style={[styles.tagText, { color: colors.warning }]}>
                  {ing}
                </Text>
              </View>
            ))}
          </View>

          {/* Footer meta */}
          <View style={styles.metaRow}>
            {match.estimatedTime && (
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.textMuted} />
                <Text
                  style={[typography.caption, { color: colors.textMuted, marginLeft: 3 }]}
                >
                  {match.estimatedTime}
                </Text>
              </View>
            )}
            {match.pageNumber && (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {match.pageNumber}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  matchBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    alignSelf: 'flex-start',
  },
  matchPercent: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  matchLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 9,
    marginTop: -2,
  },
  content: {
    flex: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ingredientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 4,
  },
  ingredientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    marginLeft: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default RecipeMatchCard;
