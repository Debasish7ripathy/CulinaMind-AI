import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  BookOpen,
  ShoppingCart,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { ExtractedRecipe, GroceryItem, GroceryCategory } from '../types/recipe';

const CATEGORY_EMOJIS: Record<GroceryCategory, string> = {
  'Produce': '🥬',
  'Meat & Seafood': '🥩',
  'Dairy & Eggs': '🧀',
  'Bakery': '🍞',
  'Pantry Staples': '🌾',
  'Spices & Seasonings': '🌶️',
  'Frozen': '🧊',
  'Beverages': '🥤',
  'Other': '📦',
};

const RecipeResultScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const recipe: ExtractedRecipe = route?.params?.recipe;

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[typography.body, { color: colors.textMuted }]}>No recipe data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text
          style={[typography.h3, { color: textColor, flex: 1 }]}
          numberOfLines={2}
        >
          {recipe.title}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Meta badges */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
          style={styles.metaRow}
        >
          {(recipe.totalTime || recipe.estimatedTime) && (
            <View style={[styles.metaBadge, { backgroundColor: cardBg }]}>
              <Clock size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: textColor }]}>
                {recipe.totalTime || recipe.estimatedTime}
              </Text>
            </View>
          )}
          {recipe.servings && (
            <View style={[styles.metaBadge, { backgroundColor: cardBg }]}>
              <Users size={14} color={colors.secondary} />
              <Text style={[styles.metaText, { color: textColor }]}>
                {recipe.servings} servings
              </Text>
            </View>
          )}
          {recipe.cuisine && (
            <View style={[styles.metaBadge, { backgroundColor: cardBg }]}>
              <ChefHat size={14} color={colors.info} />
              <Text style={[styles.metaText, { color: textColor }]}>
                {recipe.cuisine}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Description */}
        {recipe.description && (
          <Animated.View entering={FadeInDown.delay(150).duration(300)}>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginTop: spacing.md, lineHeight: 22 },
              ]}
            >
              {recipe.description}
            </Text>
          </Animated.View>
        )}

        {/* Ingredients */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <View style={styles.sectionHeader}>
            <ShoppingCart size={18} color={colors.primary} />
            <Text style={[typography.subtitle, { color: textColor, marginLeft: 8 }]}>
              Ingredients
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 'auto' }]}>
              {recipe.ingredients?.length || 0} items
            </Text>
          </View>
          {recipe.ingredients?.map((ingredient, i) => (
            <View key={i} style={[styles.ingredientRow, { backgroundColor: cardBg }]}>
              <View style={styles.ingredientDot} />
              <Text style={[typography.body, { color: textColor, flex: 1 }]}>
                {ingredient.quantity} {ingredient.name}
                {ingredient.notes ? ` (${ingredient.notes})` : ''}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(300)}>
            <View style={styles.sectionHeader}>
              <BookOpen size={18} color={colors.secondary} />
              <Text style={[typography.subtitle, { color: textColor, marginLeft: 8 }]}>
                Instructions
              </Text>
            </View>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text
                  style={[
                    typography.body,
                    { color: textColor, flex: 1, lineHeight: 22 },
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Chef Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(300)}>
            <View
              style={[
                styles.tipsCard,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <Text
                style={[
                  typography.subtitle,
                  { color: colors.primary, marginBottom: spacing.sm },
                ]}
              >
                💡 Chef Tips
              </Text>
              {recipe.tips.map((tip, i) => (
                <Text
                  key={i}
                  style={[
                    typography.body,
                    { color: textColor, lineHeight: 20, marginBottom: 4 },
                  ]}
                >
                  • {tip}
                </Text>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  content: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  metaText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 4,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: colors.white,
  },
  tipsCard: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
  },
});

export default RecipeResultScreen;
