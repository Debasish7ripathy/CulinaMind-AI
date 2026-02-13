import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  ArrowLeft,
  Video,
  Sparkles,
  ShoppingCart,
  Trash2,
  ExternalLink,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { extractRecipeFromUrl, combineGroceryLists } from '../services/gemini';
import VideoLinkInput from '../components/VideoLinkInput';
import AILoadingAnimation from '../components/AILoadingAnimation';
import GroceryListItem from '../components/GroceryListItem';
import { hapticMedium, hapticSuccess, hapticError } from '../utils/haptics';
import { GroceryCategory } from '../types/recipe';

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

const VideoToListScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const {
    savedUrls,
    extractedRecipes,
    currentGroceryList,
    isExtracting,
    extractionError,
    totalEstimatedCost,
    addUrl,
    removeUrl,
    setExtractedRecipes,
    setCurrentGroceryList,
    setIsExtracting,
    setExtractionError,
    setTotalEstimatedCost,
    toggleGroceryItem,
    clearGroceryList,
  } = useRecipeStore();

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  const handleExtract = useCallback(async () => {
    if (savedUrls.length === 0) {
      setExtractionError('Paste at least one video or recipe URL first.');
      return;
    }

    hapticMedium();
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const result = await combineGroceryLists(savedUrls);
      setExtractedRecipes(result.recipes);
      setCurrentGroceryList(result.combinedList);
      setTotalEstimatedCost(result.totalEstimatedCost ?? null);
      hapticSuccess();
    } catch (err: any) {
      setExtractionError(err.message || 'Failed to extract recipes.');
      hapticError();
    } finally {
      setIsExtracting(false);
    }
  }, [savedUrls]);

  const handleClearAll = () => {
    Alert.alert('Clear Grocery List', 'Remove all items from the list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearGroceryList },
    ]);
  };

  // Group grocery items by category
  const groupedItems = currentGroceryList.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof currentGroceryList>);

  const checkedCount = currentGroceryList.filter((i) => i.isChecked).length;

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
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: textColor }]}>
            Video → Grocery List
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Paste any recipe or cooking video link
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* URL Input */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <VideoLinkInput
            urls={savedUrls}
            onAddUrl={addUrl}
            onRemoveUrl={removeUrl}
          />
        </Animated.View>

        {/* Extract Button */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <TouchableOpacity
            style={[
              styles.extractButton,
              {
                backgroundColor:
                  savedUrls.length > 0 ? colors.primary : colors.textMuted,
              },
              getShadow('medium'),
            ]}
            activeOpacity={0.85}
            onPress={handleExtract}
            disabled={isExtracting || savedUrls.length === 0}
          >
            <Sparkles size={20} color={colors.white} />
            <Text style={[typography.button, { color: colors.white, marginLeft: 8 }]}>
              Extract Recipes & Build List
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Loading */}
        {isExtracting && (
          <AILoadingAnimation
            message="Analyzing your links..."
            submessage="Gemini AI is reading the recipes and building your consolidated grocery list"
          />
        )}

        {/* Error */}
        {extractionError && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.errorCard, { backgroundColor: colors.danger + '15' }]}
          >
            <Text style={[typography.body, { color: colors.danger }]}>
              {extractionError}
            </Text>
          </Animated.View>
        )}

        {/* Extracted Recipes Summary */}
        {!isExtracting && extractedRecipes.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            style={styles.recipesSection}
          >
            <Text
              style={[
                typography.subtitle,
                { color: textColor, marginBottom: spacing.sm },
              ]}
            >
              📋 Extracted {extractedRecipes.length} recipe
              {extractedRecipes.length > 1 ? 's' : ''}
            </Text>
            {extractedRecipes.map((recipe, i) => (
              <View
                key={recipe.id}
                style={[styles.recipePreview, { backgroundColor: cardBg }]}
              >
                <View style={styles.recipePreviewHeader}>
                  <Text
                    style={[typography.subtitle, { color: textColor, flex: 1 }]}
                    numberOfLines={1}
                  >
                    {recipe.title}
                  </Text>
                  {recipe.sourceUrl && (
                    <ExternalLink size={14} color={colors.textMuted} />
                  )}
                </View>
                <Text
                  style={[typography.caption, { color: colors.textSecondary }]}
                >
                  {recipe.servings && `${recipe.servings} servings`}
                  {recipe.servings && recipe.estimatedTime ? ' · ' : ''}
                  {recipe.estimatedTime && `${recipe.estimatedTime}`}
                  {(recipe.servings || recipe.estimatedTime) && recipe.ingredientCount
                    ? ' · '
                    : ''}
                  {recipe.ingredientCount &&
                    `${recipe.ingredientCount} ingredients`}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Grocery List */}
        {!isExtracting && currentGroceryList.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(300)}
            style={styles.grocerySection}
          >
            <View style={styles.groceryHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.subtitle, { color: textColor }]}>
                  🛒 Grocery List
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {checkedCount}/{currentGroceryList.length} items checked
                  {totalEstimatedCost ? ` · ~$${totalEstimatedCost}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                <Trash2 size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(checkedCount / currentGroceryList.length) * 100}%`,
                    backgroundColor: colors.secondary,
                  },
                ]}
              />
            </View>

            {Object.entries(groupedItems).map(([category, items]) => (
              <View key={category} style={styles.categoryGroup}>
                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                  {CATEGORY_EMOJIS[category as GroceryCategory] || '📦'}{' '}
                  {category}
                </Text>
                {items.map((item) => (
                  <GroceryListItem
                    key={item.id}
                    item={item}
                    onToggle={() => toggleGroceryItem(item.id)}
                  />
                ))}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Empty state */}
        {!isExtracting &&
          currentGroceryList.length === 0 &&
          extractedRecipes.length === 0 &&
          !extractionError && (
            <Animated.View
              entering={FadeIn.delay(400).duration(300)}
              style={styles.emptyState}
            >
              <Video size={56} color={colors.textMuted} />
              <Text
                style={[
                  typography.subtitle,
                  { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
                ]}
              >
                Paste a cooking video or recipe link
              </Text>
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textMuted,
                    textAlign: 'center',
                    marginTop: spacing.xs,
                    lineHeight: 18,
                  },
                ]}
              >
                Works with YouTube, TikTok, Instagram reels,{'\n'}food blogs, and any
                recipe website
              </Text>
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
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
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
    marginTop: spacing.md,
  },
  errorCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  recipesSection: {
    marginTop: spacing.xl,
  },
  recipePreview: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  recipePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grocerySection: {
    marginTop: spacing.xl,
  },
  groceryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryGroup: {
    marginBottom: spacing.md,
  },
  categoryLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
});

export default VideoToListScreen;
