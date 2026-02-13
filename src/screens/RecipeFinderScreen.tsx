import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  ArrowLeft,
  Search,
  Sparkles,
  ChefHat,
  X,
  Plus,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { useCookbookStore } from '../store/useCookbookStore';
import { usePantryStore } from '../store/usePantryStore';
import { findRecipesFromCookbooks } from '../services/gemini';
import RecipeMatchCard from '../components/RecipeMatchCard';
import AILoadingAnimation from '../components/AILoadingAnimation';
import { hapticMedium, hapticSuccess, hapticError } from '../utils/haptics';

const RecipeFinderScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const { cookbooks, recipeMatches, isSearching, searchError, setRecipeMatches, setIsSearching, setSearchError } =
    useCookbookStore();
  const pantryIngredients = usePantryStore((s) => s.ingredients);

  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [usePantry, setUsePantry] = useState(true);

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;
  const inputBg = isDarkMode ? colors.cardDarkElevated : '#F1F5F9';

  // Build ingredient list from pantry + custom
  const allIngredients = [
    ...(usePantry ? pantryIngredients.map((i) => i.name) : []),
    ...customIngredients,
  ];

  const handleAddIngredient = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!customIngredients.includes(trimmed)) {
      setCustomIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue('');
  };

  const handleRemoveIngredient = (ing: string) => {
    setCustomIngredients((prev) => prev.filter((i) => i !== ing));
  };

  const handleSearch = useCallback(async () => {
    if (cookbooks.length === 0) {
      setSearchError('Add some cookbooks to your collection first!');
      return;
    }
    if (allIngredients.length === 0) {
      setSearchError('Add some ingredients to search with.');
      return;
    }

    hapticMedium();
    setIsSearching(true);
    setSearchError(null);

    try {
      const matches = await findRecipesFromCookbooks(cookbooks, allIngredients);
      setRecipeMatches(matches);
      hapticSuccess();
    } catch (err: any) {
      setSearchError(err.message || 'Something went wrong.');
      hapticError();
    } finally {
      setIsSearching(false);
    }
  }, [cookbooks, allIngredients]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: textColor, flex: 1 }]}>
          What Can I Cook?
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Using pantry toggle */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <TouchableOpacity
            style={[styles.pantryToggle, { backgroundColor: cardBg }]}
            activeOpacity={0.8}
            onPress={() => setUsePantry(!usePantry)}
          >
            <ChefHat size={20} color={usePantry ? colors.primary : colors.textMuted} />
            <Text
              style={[
                typography.body,
                { color: textColor, flex: 1, marginLeft: spacing.sm },
              ]}
            >
              Use my pantry ingredients
            </Text>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: usePantry ? colors.primary : colors.textMuted + '40',
                },
              ]}
            >
              <View
                style={[
                  styles.toggleDot,
                  {
                    alignSelf: usePantry ? 'flex-end' : 'flex-start',
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
          {usePantry && pantryIngredients.length > 0 && (
            <View style={styles.pantryPreview}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                From pantry: {pantryIngredients.map((i) => i.name).join(', ')}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Add custom ingredients */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Text
            style={[
              typography.subtitle,
              { color: textColor, marginTop: spacing.lg, marginBottom: spacing.sm },
            ]}
          >
            What else is in your kitchen?
          </Text>
          <View style={[styles.inputRow, { backgroundColor: inputBg }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              placeholder="e.g., chicken, broccoli, garlic..."
              placeholderTextColor={colors.textMuted}
              value={inputValue}
              onChangeText={setInputValue}
              returnKeyType="done"
              onSubmitEditing={handleAddIngredient}
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: inputValue.trim()
                    ? colors.primary
                    : colors.textMuted + '40',
                },
              ]}
              onPress={handleAddIngredient}
              disabled={!inputValue.trim()}
            >
              <Plus size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
          {customIngredients.length > 0 && (
            <View style={styles.chipContainer}>
              {customIngredients.map((ing, i) => (
                <View
                  key={i}
                  style={[styles.chip, { backgroundColor: colors.secondary + '15' }]}
                >
                  <Text style={[styles.chipText, { color: colors.secondary }]}>
                    {ing}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveIngredient(ing)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color={colors.secondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Search button */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <TouchableOpacity
            style={[
              styles.searchButton,
              {
                backgroundColor:
                  allIngredients.length > 0 ? colors.primary : colors.textMuted,
              },
              getShadow('medium'),
            ]}
            activeOpacity={0.85}
            onPress={handleSearch}
            disabled={isSearching || allIngredients.length === 0}
          >
            <Sparkles size={20} color={colors.white} />
            <Text style={[typography.button, { color: colors.white, marginLeft: 8 }]}>
              Find Recipes with Gemini AI
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
            ]}
          >
            Searching across {cookbooks.length} cookbooks · {allIngredients.length}{' '}
            ingredients
          </Text>
        </Animated.View>

        {/* Results */}
        {isSearching && (
          <AILoadingAnimation
            message="Searching your cookbooks..."
            submessage={`Checking ${cookbooks.length} cookbooks for recipes matching your ${allIngredients.length} ingredients`}
          />
        )}

        {searchError && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.errorCard, { backgroundColor: colors.danger + '15' }]}
          >
            <Text style={[typography.body, { color: colors.danger }]}>
              {searchError}
            </Text>
          </Animated.View>
        )}

        {!isSearching && recipeMatches.length > 0 && (
          <View style={styles.resultsSection}>
            <Text
              style={[
                typography.subtitle,
                { color: textColor, marginBottom: spacing.sm },
              ]}
            >
              🍳 Found {recipeMatches.length} recipes
            </Text>
            {recipeMatches.map((match, index) => (
              <Animated.View
                key={match.id}
                entering={FadeInDown.delay(index * 80).duration(300)}
              >
                <RecipeMatchCard match={match} />
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  pantryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  pantryPreview: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
  },
  chipText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
  },
  errorCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  resultsSection: {
    marginTop: spacing.xl,
  },
});

export default RecipeFinderScreen;
