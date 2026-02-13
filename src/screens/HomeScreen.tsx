import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChefHat,
  ShoppingCart,
  Sparkles,
  Download,
  UtensilsCrossed,
  Clock,
  TrendingUp,
  ArrowRight,
  Salad,
  Package,
  BarChart3,
  Zap,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { usePantryStore } from '../store/usePantryStore';
import { useCartStore } from '../store/useCartStore';
import { getQuickRecipeIdeas } from '../services/gemini';
import type { NavigationProp } from '@react-navigation/native';
import type { BottomTabParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

interface Props {
  navigation: NavigationProp<BottomTabParamList>;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDarkMode);
  const ingredients = usePantryStore((s) => s.ingredients);
  const cartItems = useCartStore((s) => s.items);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getTotalCost = useCartStore((s) => s.getTotalCost);

  const [quickRecipes, setQuickRecipes] = useState<
    { title: string; description: string; time: string; ingredients: string[] }[]
  >([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  const bg = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;
  const subtextColor = isDark ? colors.textSecondary : colors.textMuted;

  useEffect(() => {
    if (ingredients.length > 0) {
      loadQuickRecipes();
    }
  }, []);

  const loadQuickRecipes = async () => {
    setLoadingRecipes(true);
    try {
      const names = ingredients.map((i) => i.name);
      const recipes = await getQuickRecipeIdeas(names);
      setQuickRecipes(recipes);
    } catch {
      // silently fail
    } finally {
      setLoadingRecipes(false);
    }
  };

  const statCards = [
    {
      icon: Package,
      label: 'Pantry Items',
      value: ingredients.length.toString(),
      color: colors.secondary,
      onPress: () => navigation.navigate('Pantry' as any),
    },
    {
      icon: ShoppingCart,
      label: 'Cart Items',
      value: getItemCount().toString(),
      color: colors.primary,
      onPress: () => navigation.navigate('Cart' as any),
    },
    {
      icon: TrendingUp,
      label: 'Est. Cost',
      value: '$' + getTotalCost().toFixed(0),
      color: colors.info,
      onPress: () => navigation.navigate('Cart' as any),
    },
  ];

  const featureCards = [
    {
      icon: Download,
      title: 'Import Recipe',
      description: 'Paste a YouTube or recipe URL to extract ingredients',
      gradient: ['#F97316', '#EA580C'] as [string, string],
      onPress: () => navigation.navigate('Pantry' as any),
    },
    {
      icon: Sparkles,
      title: 'Ask AI Chef',
      description: 'Search for recipes powered by Gemini AI',
      gradient: ['#8B5CF6', '#6D28D9'] as [string, string],
      onPress: () => navigation.navigate('AskAI' as any),
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Cart',
      description: 'View your cart items grouped by recipe',
      gradient: ['#22C55E', '#16A34A'] as [string, string],
      onPress: () => navigation.navigate('Cart' as any),
    },
    {
      icon: BarChart3,
      title: 'Nutrition',
      description: 'Track your meals and get AI nutrition insights',
      gradient: ['#3B82F6', '#2563EB'] as [string, string],
      onPress: () => navigation.navigate('AskAI' as any),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#FFF7ED', '#F8FAFC']}
          style={[styles.hero, { paddingTop: insets.top + spacing.md }]}
        >
          <View style={styles.heroContent}>
            <View style={styles.logoRow}>
              <View style={styles.logoBadge}>
                <ChefHat size={28} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h2, { color: textColor }]}>CulinaMind AI</Text>
                <Text style={[typography.bodySmall, { color: subtextColor }]}>
                  Your AI-powered kitchen assistant
                </Text>
              </View>
            </View>
            <View style={styles.greetingCard}>
              <LinearGradient
                colors={['#F97316', '#F59E0B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.greetingGradient}
              >
                <Zap size={20} color={colors.white} />
                <Text style={[typography.subtitle, { color: colors.white, flex: 1 }]}>
                  Ready to cook something amazing?
                </Text>
                <TouchableOpacity
                  style={styles.greetingBtn}
                  onPress={() => navigation.navigate('Pantry' as any)}
                >
                  <Text style={[typography.caption, { color: colors.primary, fontFamily: 'Inter-Bold' }]}>
                    Let's Go
                  </Text>
                  <ArrowRight size={14} color={colors.primary} />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          {statCards.map((stat, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.statCard, { backgroundColor: cardBg }]}
              onPress={stat.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <stat.icon size={18} color={stat.color} />
              </View>
              <Text style={[typography.h3, { color: textColor }]}>{stat.value}</Text>
              <Text style={[typography.caption, { color: subtextColor }]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.md }]}>
            Quick Actions
          </Text>
          <View style={styles.featureGrid}>
            {featureCards.map((card, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.featureCard, { backgroundColor: cardBg }]}
                onPress={card.onPress}
                activeOpacity={0.7}
              >
                <LinearGradient colors={card.gradient} style={styles.featureIconBg}>
                  <card.icon size={22} color={colors.white} />
                </LinearGradient>
                <Text
                  style={[
                    typography.bodySmall,
                    { color: textColor, fontFamily: 'Inter-SemiBold', marginTop: spacing.sm },
                  ]}
                >
                  {card.title}
                </Text>
                <Text
                  style={[typography.caption, { color: subtextColor, marginTop: 4 }]}
                  numberOfLines={2}
                >
                  {card.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {ingredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.subtitle, { color: textColor }]}>
                Quick Ideas from Your Pantry
              </Text>
              {!loadingRecipes && quickRecipes.length > 0 && (
                <TouchableOpacity onPress={loadQuickRecipes}>
                  <Text style={[typography.caption, { color: colors.primary }]}>Refresh</Text>
                </TouchableOpacity>
              )}
            </View>
            {loadingRecipes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="small" />
                <Text style={[typography.bodySmall, { color: subtextColor, marginLeft: spacing.sm }]}>
                  AI is thinking of recipes...
                </Text>
              </View>
            ) : quickRecipes.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickRecipes.map((recipe, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.quickRecipeCard, { backgroundColor: cardBg }]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('AskAI' as any)}
                  >
                    <View style={styles.quickRecipeHeader}>
                      <UtensilsCrossed size={16} color={colors.primary} />
                      <View style={styles.quickRecipeTime}>
                        <Clock size={12} color={subtextColor} />
                        <Text style={[typography.caption, { color: subtextColor }]}>
                          {recipe.time}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        typography.bodySmall,
                        { color: textColor, fontFamily: 'Inter-SemiBold', marginTop: spacing.xs },
                      ]}
                      numberOfLines={1}
                    >
                      {recipe.title}
                    </Text>
                    <Text
                      style={[typography.caption, { color: subtextColor, marginTop: 4 }]}
                      numberOfLines={2}
                    >
                      {recipe.description}
                    </Text>
                    <View style={styles.quickRecipeIngredients}>
                      {recipe.ingredients.slice(0, 3).map((ing, i) => (
                        <View
                          key={i}
                          style={[styles.ingredientChip, { backgroundColor: colors.primary + '15' }]}
                        >
                          <Text style={[typography.caption, { color: colors.primary, fontSize: 10 }]}>
                            {ing}
                          </Text>
                        </View>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <Text style={[typography.caption, { color: subtextColor, fontSize: 10 }]}>
                          +{recipe.ingredients.length - 3}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <TouchableOpacity
                style={[styles.emptyRecipeCard, { backgroundColor: cardBg }]}
                onPress={loadQuickRecipes}
              >
                <Salad size={24} color={subtextColor} />
                <Text style={[typography.bodySmall, { color: subtextColor, marginTop: spacing.sm }]}>
                  Tap to get AI recipe ideas
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {cartItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.subtitle, { color: textColor }]}>Cart Preview</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Cart' as any)}>
                <Text style={[typography.caption, { color: colors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.cartPreview, { backgroundColor: cardBg }]}
              onPress={() => navigation.navigate('Cart' as any)}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.cartPreviewIcon}>
                <ShoppingCart size={20} color={colors.white} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-SemiBold' }]}>
                  {getItemCount()} items in cart
                </Text>
                <Text style={[typography.caption, { color: subtextColor }]}>
                  {'Estimated: $' + getTotalCost().toFixed(2)}
                </Text>
              </View>
              <ArrowRight size={18} color={subtextColor} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingBottom: spacing.lg, paddingHorizontal: spacing.md },
  heroContent: { gap: spacing.md },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingCard: { borderRadius: borderRadius.lg, overflow: 'hidden' },
  greetingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  greetingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: -spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  section: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  featureCard: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  quickRecipeCard: {
    width: 200,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  quickRecipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickRecipeTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickRecipeIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.sm,
  },
  ingredientChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  emptyRecipeCard: { padding: spacing.xl, borderRadius: borderRadius.lg, alignItems: 'center' },
  cartPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  cartPreviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
