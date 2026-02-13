import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import {
  Link,
  Sparkles,
  ClipboardPaste,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Youtube,
  Globe,
  DollarSign,
  Clock,
  Users,
  ChefHat,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useCartStore } from '../store/useCartStore';
import { extractRecipeFromUrl } from '../services/gemini';
import type { ExtractedRecipe, GroceryItem } from '../types/recipe';
import AppHeader from '../components/AppHeader';

const CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry Staples',
  'Spices & Seasonings',
  'Frozen',
  'Beverages',
  'Other',
];

const ImportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDarkMode);
  const addItemsForRecipe = useCartStore((s) => s.addItemsForRecipe);

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState<ExtractedRecipe | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [totalCost, setTotalCost] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const bg = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;
  const subtextColor = isDark ? colors.textSecondary : colors.textMuted;
  const inputBg = isDark ? colors.cardDarkElevated : '#F1F5F9';

  const isYouTube = /youtu\.?be/.test(url);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) setUrl(text);
    } catch {
      // ignore
    }
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    setLoading(true);
    setError('');
    setRecipe(null);
    setGroceryList([]);
    setAddedToCart(false);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    try {
      const result = await extractRecipeFromUrl(url.trim());
      setRecipe(result.recipe);
      setGroceryList(result.groceryList);
      setTotalCost(result.totalEstimatedCost || 'N/A');

      // Auto-expand all categories
      const expanded: Record<string, boolean> = {};
      CATEGORIES.forEach((c) => { expanded[c] = true; });
      setExpandedCategories(expanded);
    } catch (err: any) {
      setError(err.message || 'Failed to extract recipe');
    } finally {
      setLoading(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddToCart = () => {
    if (!recipe || groceryList.length === 0) return;
    const items = groceryList.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      category: item.category,
      estimatedPrice: 3.5, // rough estimate per item
      notes: item.notes,
    }));
    addItemsForRecipe(recipe.id, recipe.title, items);
    setAddedToCart(true);
    Alert.alert('Added to Cart!', recipe.title + ' ingredients added to your cart.');
  };

  const groupedItems = CATEGORIES.map((cat) => ({
    category: cat,
    items: groceryList.filter((item) => item.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <AppHeader title="Import Recipe" subtitle="Extract from any URL" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
      >
        {/* URL Input */}
        <View style={[styles.inputCard, { backgroundColor: cardBg }]}>
          <View style={styles.inputHeader}>
            <Link size={18} color={colors.primary} />
            <Text style={[typography.subtitle, { color: textColor }]}>Recipe URL</Text>
          </View>
          <View style={[styles.inputRow, { backgroundColor: inputBg }]}>
            {url.length > 0 && isYouTube ? (
              <Youtube size={18} color="#FF0000" />
            ) : (
              <Globe size={18} color={subtextColor} />
            )}
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Paste YouTube or recipe URL..."
              placeholderTextColor={subtextColor}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={handlePaste} style={styles.pasteBtn}>
              <ClipboardPaste size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <AlertCircle size={14} color={colors.danger} />
              <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleExtract}
            disabled={loading || !url.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? ['#94A3B8', '#64748B'] : ['#F97316', '#EA580C']}
              style={styles.extractBtn}
            >
              {loading ? (
                <Animated.View style={{ opacity: pulseAnim, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={[typography.body, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
                    Gemini AI is analyzing...
                  </Text>
                </Animated.View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={20} color={colors.white} />
                  <Text style={[typography.body, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
                    Extract with Gemini AI
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recipe Info */}
        {recipe && (
          <View style={[styles.recipeCard, { backgroundColor: cardBg }]}>
            <View style={styles.recipeHeader}>
              <ChefHat size={20} color={colors.primary} />
              <Text style={[typography.subtitle, { color: textColor, flex: 1 }]}>{recipe.title}</Text>
            </View>
            {recipe.sourceTitle && (
              <Text style={[typography.caption, { color: subtextColor }]}>
                Source: {recipe.sourceTitle}
              </Text>
            )}
            {recipe.description && (
              <Text style={[typography.bodySmall, { color: subtextColor, marginTop: spacing.xs }]}>
                {recipe.description}
              </Text>
            )}
            <View style={styles.recipeMetaRow}>
              {recipe.totalTime && (
                <View style={styles.metaChip}>
                  <Clock size={14} color={colors.primary} />
                  <Text style={[typography.caption, { color: textColor }]}>{recipe.totalTime}</Text>
                </View>
              )}
              {recipe.servings && (
                <View style={styles.metaChip}>
                  <Users size={14} color={colors.secondary} />
                  <Text style={[typography.caption, { color: textColor }]}>{recipe.servings} servings</Text>
                </View>
              )}
              {totalCost && totalCost !== 'N/A' && (
                <View style={styles.metaChip}>
                  <DollarSign size={14} color={colors.warning} />
                  <Text style={[typography.caption, { color: textColor }]}>{totalCost}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Grocery List */}
        {groupedItems.length > 0 && (
          <View style={{ marginTop: spacing.md }}>
            <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>
              Grocery List ({groceryList.length} items)
            </Text>
            {groupedItems.map((group) => (
              <View key={group.category} style={[styles.categoryCard, { backgroundColor: cardBg }]}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(group.category)}
                >
                  <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-SemiBold', flex: 1 }]}>
                    {group.category} ({group.items.length})
                  </Text>
                  {expandedCategories[group.category] ? (
                    <ChevronUp size={18} color={subtextColor} />
                  ) : (
                    <ChevronDown size={18} color={subtextColor} />
                  )}
                </TouchableOpacity>
                {expandedCategories[group.category] &&
                  group.items.map((item) => (
                    <View key={item.id} style={styles.groceryItem}>
                      <View style={styles.groceryDot} />
                      <Text style={[typography.bodySmall, { color: textColor, flex: 1 }]}>{item.name}</Text>
                      <Text style={[typography.caption, { color: subtextColor }]}>{item.quantity}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
        )}

        {/* Add to Cart Button */}
        {recipe && groceryList.length > 0 && (
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={addedToCart}
            activeOpacity={0.8}
            style={{ marginTop: spacing.md }}
          >
            <LinearGradient
              colors={addedToCart ? ['#22C55E', '#16A34A'] : ['#F97316', '#EA580C']}
              style={styles.addToCartBtn}
            >
              {addedToCart ? (
                <CheckCircle size={22} color={colors.white} />
              ) : (
                <ShoppingCart size={22} color={colors.white} />
              )}
              <Text style={[typography.body, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
                {addedToCart ? 'Added to Cart!' : 'Add All to Cart'}
              </Text>
              {!addedToCart && (
                <Text style={[typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  for {recipe.title}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputCard: { padding: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm },
  inputHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    height: 48,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter-Regular' },
  pasteBtn: {
    padding: spacing.xs,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.sm,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  extractBtn: {
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recipeMetaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  categoryCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  groceryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  addToCartBtn: {
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
});

export default ImportScreen;
