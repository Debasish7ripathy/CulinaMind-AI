import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  HeartPulse,
  ShoppingCart,
  BookmarkPlus,
  Share2,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { RootStackScreenProps } from '../navigation/types';
import NutritionCard from '../components/NutritionCard';
import Badge from '../components/Badge';
import { hapticLight, hapticSuccess } from '../utils/haptics';

// Mock recipe details
const MOCK_RECIPE = {
  id: '1',
  title: 'Grilled Chicken Quinoa Bowl',
  description:
    'A wholesome, high-protein grain bowl featuring grilled chicken, fluffy quinoa, roasted seasonal vegetables, and a zesty lemon-tahini dressing.',
  cookTime: '25 min',
  prepTime: '10 min',
  servings: 4,
  difficulty: 'Easy' as const,
  healthScore: 8.5,
  cuisine: 'Mediterranean',
  tags: ['High Protein', 'Gluten Free', 'Meal Prep'],
  nutrition: { calories: 520, protein: 42, carbs: 48, fat: 16, fiber: 9 },
  ingredients: [
    { name: 'Chicken Breast', qty: '500g', available: true },
    { name: 'Quinoa', qty: '1 cup', available: true },
    { name: 'Cherry Tomatoes', qty: '200g', available: true },
    { name: 'Spinach', qty: '100g', available: true },
    { name: 'Cucumber', qty: '1 medium', available: false },
    { name: 'Avocado', qty: '1 ripe', available: false },
    { name: 'Lemon', qty: '1', available: true },
    { name: 'Tahini', qty: '2 tbsp', available: false },
    { name: 'Olive Oil', qty: '2 tbsp', available: true },
    { name: 'Garlic', qty: '2 cloves', available: true },
  ],
  steps: [
    'Season chicken breasts with salt, pepper, and garlic powder.',
    'Cook quinoa according to package instructions and fluff with a fork.',
    'Grill chicken for 6-7 minutes per side until internal temp reaches 165°F.',
    'Roast cherry tomatoes at 400°F for 12 minutes.',
    'Whisk together tahini, lemon juice, garlic, and water for the dressing.',
    'Slice chicken and assemble bowls with quinoa, veggies, and dressing.',
  ],
  substitutions: [
    { original: 'Quinoa', alternative: 'Brown Rice', reason: 'Similar texture, adds extra fiber' },
    { original: 'Tahini', alternative: 'Greek Yogurt', reason: 'Lighter dressing, more protein' },
    { original: 'Chicken', alternative: 'Tofu (firm)', reason: 'Plant-based protein alternative' },
  ],
};

const RecipeDetailsScreen = ({ navigation, route }: RootStackScreenProps<'RecipeDetails'>) => {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDarkMode);
  const bg = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;

  const [saved, setSaved] = useState(false);
  const recipe = MOCK_RECIPE;

  const missingCount = recipe.ingredients.filter((i) => !i.available).length;

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: cardBg }]}
          onPress={() => { hapticLight(); navigation.goBack(); }}
        >
          <ArrowLeft size={22} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => hapticLight()}>
            <Share2 size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { hapticSuccess(); setSaved(!saved); }}
            style={{ marginLeft: 16 }}
          >
            <BookmarkPlus size={20} color={saved ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Title & Meta */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={[typography.h2, { color: textColor }]}>{recipe.title}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>
            {recipe.description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                {recipe.cookTime}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={14} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
                {recipe.servings} servings
              </Text>
            </View>
            <Badge label={recipe.difficulty} color={colors.secondary} />
            <Badge label={recipe.cuisine} color={colors.info} />
          </View>

          {/* Health Score */}
          <View style={[styles.healthScore, { backgroundColor: colors.secondary + '12' }]}>
            <HeartPulse size={18} color={colors.secondary} />
            <Text style={[typography.subtitle, { color: colors.secondary, marginLeft: 8 }]}>
              Health Score: {recipe.healthScore}/10
            </Text>
          </View>
        </Animated.View>

        {/* Tags */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)} style={styles.tagsRow}>
          {recipe.tags.map((tag) => (
            <Badge key={tag} label={tag} color={colors.primary} size="medium" />
          ))}
        </Animated.View>

        {/* Nutrition */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>
            Nutrition per Serving
          </Text>
          <NutritionCard
            calories={recipe.nutrition.calories}
            protein={recipe.nutrition.protein}
            carbs={recipe.nutrition.carbs}
            fat={recipe.nutrition.fat}
            fiber={recipe.nutrition.fiber}
          />
        </Animated.View>

        {/* Ingredients */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)} style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.subtitle, { color: textColor }]}>
              Ingredients
            </Text>
            {missingCount > 0 && (
              <Badge label={`${missingCount} missing`} color={colors.danger} size="medium" />
            )}
          </View>
          <View style={[styles.ingredientsList, { backgroundColor: cardBg }, getShadow('small')]}>
            {recipe.ingredients.map((ing, i) => (
              <View
                key={i}
                style={[
                  styles.ingredientRow,
                  i < recipe.ingredients.length - 1 && styles.ingredientBorder,
                ]}
              >
                <View
                  style={[
                    styles.availDot,
                    { backgroundColor: ing.available ? colors.secondary : colors.danger },
                  ]}
                />
                <Text style={[typography.body, { color: textColor, flex: 1 }]}>{ing.name}</Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{ing.qty}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Steps */}
        <Animated.View entering={FadeInUp.delay(400).duration(300)} style={{ marginTop: spacing.lg }}>
          <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>
            Instructions
          </Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={[styles.stepCard, { backgroundColor: cardBg }, getShadow('small')]}>
              <View style={styles.stepNum}>
                <Text style={[typography.label, { color: colors.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[typography.body, { color: textColor, flex: 1 }]}>{step}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Substitutions */}
        <Animated.View entering={FadeInUp.delay(500).duration(300)} style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <RefreshCw size={18} color={colors.info} />
            <Text style={[typography.subtitle, { color: textColor, marginLeft: 8 }]}>
              Smart Substitutions
            </Text>
          </View>
          {recipe.substitutions.map((sub, i) => (
            <View key={i} style={[styles.subCard, { backgroundColor: cardBg }, getShadow('small')]}>
              <View style={styles.subRow}>
                <Text style={[typography.body, { color: colors.textSecondary, textDecorationLine: 'line-through' }]}>
                  {sub.original}
                </Text>
                <Text style={[typography.body, { color: textColor, marginLeft: 8 }]}>→ {sub.alternative}</Text>
              </View>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                {sub.reason}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Bottom Actions */}
        <Animated.View entering={FadeInUp.delay(600).duration(300)} style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => { hapticSuccess(); navigation.navigate('ShoppingList'); }}
          >
            <ShoppingCart size={18} color={colors.white} />
            <Text style={[typography.button, { color: colors.white, marginLeft: 8 }]}>
              Add to Shopping List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => { hapticLight(); /* add to nutrition tracker */ }}
          >
            <Flame size={18} color={colors.primary} />
            <Text style={[typography.button, { color: colors.primary, marginLeft: 8 }]}>
              Log to Nutrition
            </Text>
          </TouchableOpacity>
        </Animated.View>

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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 40 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  healthScore: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ingredientsList: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  ingredientBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  bottomActions: {
    marginTop: spacing.xl,
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecipeDetailsScreen;
