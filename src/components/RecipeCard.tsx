import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Clock, Flame, ChefHat, ArrowRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';

export interface RecipeCardData {
  id: string;
  title: string;
  description: string;
  cookTime: string;
  calories: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  matchScore?: number;
  tags?: string[];
}

interface RecipeCardProps {
  recipe: RecipeCardData;
  index?: number;
  onPress?: () => void;
}

const difficultyColor = {
  Easy: colors.secondary,
  Medium: colors.warning,
  Hard: colors.danger,
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index = 0, onPress }) => {
  const isDark = useThemeStore((s) => s.isDarkMode);
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(300)}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }, getShadow('small')]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={[typography.subtitle, { color: textColor, flex: 1 }]} numberOfLines={2}>
            {recipe.title}
          </Text>
          {recipe.matchScore !== undefined && (
            <View style={[styles.scoreBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[typography.label, { color: colors.primary }]}>
                {recipe.matchScore}% match
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text
          style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}
          numberOfLines={2}
        >
          {recipe.description}
        </Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
              {recipe.cookTime}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Flame size={14} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
              {recipe.calories} cal
            </Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: difficultyColor[recipe.difficulty] + '15' }]}>
            <Text style={[typography.caption, { color: difficultyColor[recipe.difficulty] }]}>
              {recipe.difficulty}
            </Text>
          </View>
          <ArrowRight size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
        </View>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={[typography.caption, { color: colors.info }]}>{tag}</Text>
              </View>
            ))}
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
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: colors.info + '12',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});

export default RecipeCard;
