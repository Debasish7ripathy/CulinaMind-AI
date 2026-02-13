#!/usr/bin/env python3
import os

content = r'''import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import {
  Search,
  Sparkles,
  Clock,
  Users,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  CheckCircle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  History,
  ChefHat,
  ImageIcon,
  Trash2,
  X,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { usePantryStore } from '../store/usePantryStore';
import { useCartStore } from '../store/useCartStore';
import { useHistoryStore, HistoryRecipe } from '../store/useHistoryStore';
import {
  generateRecipesFromQuery,
  generateRecipeImage,
  AIRecipeSuggestion,
} from '../services/gemini';
import AppHeader from '../components/AppHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CUISINES = ['All', 'Indian', 'Italian', 'Asian', 'Mexican', 'Mediterranean', 'American'];
type Tab = 'search' | 'history' | 'cooked';

const AskAIScreen: React.FC = () => {
  const isDark = useThemeStore((s) => s.isDarkMode);
  const pantryIngredients = usePantryStore((s) => s.ingredients);
  const addItemsForRecipe = useCartStore((s) => s.addItemsForRecipe);

  const {
    searchHistory, cookedItems,
    addSearchEntry, removeSearchEntry, clearSearchHistory,
    markAsCooked, clearCookedItems, isCooked,
  } = useHistoryStore();

  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<AIRecipeSuggestion[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [addedRecipes, setAddedRecipes] = useState<Set<string>>(new Set());
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [speakingRecipeId, setSpeakingRecipeId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [imageStates, setImageStates] = useState<Record<string, { loading: boolean; base64?: string }>>({});

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const bg = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;
  const subtextColor = isDark ? colors.textSecondary : colors.textMuted;
  const inputBg = isDark ? colors.cardDarkElevated : '#F1F5F9';
  const accentPurple = '#8B5CF6';
  const accentPurpleDark = '#6D28D9';

  useEffect(() => {
    if (isListening) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const speakRecipe = useCallback((recipe: AIRecipeSuggestion) => {
    if (speakingRecipeId === recipe.id) {
      Speech.stop();
      setSpeakingRecipeId(null);
      return;
    }
    Speech.stop();
    const ingredientsList = recipe.ingredients.map((ing) => ing.quantity + ' ' + ing.name).join(', ');
    const stepsList = recipe.instructions.map((step, i) => 'Step ' + (i + 1) + ': ' + step).join('. ');
    const text = recipe.title + '. ' + recipe.description +
      '. Cuisine: ' + recipe.cuisine + '. Time: ' + recipe.estimatedTime +
      '. Difficulty: ' + recipe.difficulty + '. Serves ' + recipe.servings +
      '. Ingredients: ' + ingredientsList +
      '. Instructions: ' + stepsList +
      '. Nutrition: ' + recipe.nutritionEstimate.calories + ' calories, ' +
      recipe.nutritionEstimate.protein + ' grams protein, ' +
      recipe.nutritionEstimate.carbs + ' grams carbs, ' +
      recipe.nutritionEstimate.fat + ' grams fat.';

    setSpeakingRecipeId(recipe.id);
    Speech.speak(text, {
      language: 'en',
      rate: 0.9,
      pitch: 1.0,
      onDone: () => setSpeakingRecipeId(null),
      onStopped: () => setSpeakingRecipeId(null),
      onError: () => setSpeakingRecipeId(null),
    });
  }, [speakingRecipeId]);

  useEffect(() => { return () => { Speech.stop(); }; }, []);

  const toggleListening = useCallback(() => {
    if (isListening) { setIsListening(false); return; }
    setIsListening(true);
    Alert.alert(
      '\uD83C\uDFA4 Voice Input',
      'Voice recognition requires a native module.\nTry quick suggestions:',
      [
        { text: 'Cancel', onPress: () => setIsListening(false) },
        { text: '"Butter Chicken"', onPress: () => { setQuery('Butter Chicken'); setIsListening(false); } },
        { text: '"Quick Pasta"', onPress: () => { setQuery('Quick Pasta'); setIsListening(false); } },
      ],
    );
    setTimeout(() => setIsListening(false), 5000);
  }, [isListening]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setExpandedRecipe(null); setImageStates({});
    try {
      const pantryNames = pantryIngredients.map((i) => i.name);
      const results = await generateRecipesFromQuery(query.trim(), cuisine, pantryNames);
      setRecipes(results);
      const historyRecipes: HistoryRecipe[] = results.map((r) => ({
        id: r.id, title: r.title, description: r.description,
        cuisine: r.cuisine, estimatedTime: r.estimatedTime,
        difficulty: r.difficulty, servings: r.servings, matchScore: r.matchScore,
      }));
      addSearchEntry({ query: query.trim(), cuisine, recipes: historyRecipes });
      results.slice(0, 3).forEach((r) => generateImageForRecipe(r.id, r.title, r.description));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to search recipes');
    } finally { setLoading(false); }
  };

  const generateImageForRecipe = async (recipeId: string, title: string, description?: string) => {
    setImageStates((prev) => ({ ...prev, [recipeId]: { loading: true } }));
    try {
      const base64 = await generateRecipeImage(title, description);
      setImageStates((prev) => ({ ...prev, [recipeId]: { loading: false, base64: base64 || undefined } }));
    } catch {
      setImageStates((prev) => ({ ...prev, [recipeId]: { loading: false } }));
    }
  };

  const handleAddToCart = (recipe: AIRecipeSuggestion) => {
    const items = recipe.ingredients.map((ing, idx) => ({
      id: 'ai-cart-' + Date.now() + '-' + idx,
      name: ing.name, quantity: ing.quantity, category: ing.category,
      estimatedPrice: 3.0, notes: undefined,
    }));
    addItemsForRecipe(recipe.id, recipe.title, items);
    setAddedRecipes((prev) => new Set(prev).add(recipe.id));
    Alert.alert('Added!', recipe.title + ' ingredients added to cart.');
  };

  const handleMarkCooked = (recipe: AIRecipeSuggestion) => {
    const img = imageStates[recipe.id]?.base64;
    markAsCooked({ recipeId: recipe.id, recipeTitle: recipe.title, cuisine: recipe.cuisine, imageBase64: img });
    Alert.alert('\uD83C\uDF89 Marked as Cooked!', '"' + recipe.title + '" added to your cooked history.');
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return colors.secondary;
      case 'Medium': return colors.warning;
      case 'Hard': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + 'd ago';
    return new Date(ts).toLocaleDateString();
  };

  const renderSearchTab = () => (
    <>
      <View style={[styles.searchCard, { backgroundColor: cardBg }]}>
        <View style={styles.searchInputRow}>
          <View style={[styles.searchRow, { backgroundColor: inputBg, flex: 1 }]}>
            <Search size={18} color={subtextColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="What do you want to cook?"
              placeholderTextColor={subtextColor}
              value={query} onChangeText={setQuery}
              onSubmitEditing={handleSearch} returnKeyType="search"
            />
          </View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={toggleListening}
              style={[styles.micBtn, { backgroundColor: isListening ? colors.danger : accentPurple }]}
            >
              {isListening ? <MicOff size={20} color={colors.white} /> : <Mic size={20} color={colors.white} />}
            </TouchableOpacity>
          </Animated.View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
          {CUISINES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCuisine(c)}
              style={[styles.cuisineChip, {
                backgroundColor: cuisine === c ? accentPurple : accentPurple + '15',
                borderWidth: cuisine === c ? 0 : 1, borderColor: accentPurple + '30',
              }]}>
              <Text style={[typography.caption, {
                color: cuisine === c ? colors.white : accentPurple,
                fontFamily: cuisine === c ? 'Inter-SemiBold' : 'Inter-Regular',
              }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={handleSearch} disabled={loading || !query.trim()}>
          <LinearGradient
            colors={loading ? ['#94A3B8', '#64748B'] : [accentPurple, accentPurpleDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchBtn}>
            {loading ? (
              <View style={styles.btnContent}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={[typography.body, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>Gemini is cooking...</Text>
              </View>
            ) : (
              <View style={styles.btnContent}>
                <Sparkles size={20} color={colors.white} />
                <Text style={[typography.body, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>Search with AI</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {searched && !loading && recipes.length > 0 && (
        <View style={styles.aiBadge}>
          <LinearGradient colors={[accentPurple + '20', colors.primary + '15']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.aiBadgeGradient}>
            <Sparkles size={14} color={accentPurple} />
            <Text style={[typography.caption, { color: accentPurple, fontFamily: 'Inter-SemiBold' }]}>
              {recipes.length} recipes found by Gemini AI
            </Text>
          </LinearGradient>
        </View>
      )}

      {recipes.map((r) => {
        const isExpanded = expandedRecipe === r.id;
        const isAdded = addedRecipes.has(r.id);
        const isSpeaking = speakingRecipeId === r.id;
        const recipeCooked = isCooked(r.id);
        const imgState = imageStates[r.id];
        return (
          <View key={r.id} style={[styles.recipeCard, { backgroundColor: cardBg }]}>
            {imgState?.base64 ? (
              <Image source={{ uri: imgState.base64 }} style={styles.recipeImage} resizeMode="cover" />
            ) : imgState?.loading ? (
              <View style={[styles.recipeImagePlaceholder, { backgroundColor: inputBg }]}>
                <ActivityIndicator size="small" color={accentPurple} />
                <Text style={[typography.caption, { color: subtextColor, marginTop: 4 }]}>AI generating image...</Text>
              </View>
            ) : null}
            <TouchableOpacity onPress={() => setExpandedRecipe(isExpanded ? null : r.id)} activeOpacity={0.7} style={{ padding: spacing.md }}>
              <View style={styles.recipeTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.subtitle, { color: textColor }]}>{r.title}</Text>
                  <Text style={[typography.caption, { color: subtextColor, marginTop: 2 }]}>{r.cuisine} cuisine</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity onPress={() => speakRecipe(r)}
                    style={[styles.iconBtn, { backgroundColor: isSpeaking ? colors.danger + '20' : accentPurple + '15' }]}>
                    {isSpeaking ? <VolumeX size={16} color={colors.danger} /> : <Volume2 size={16} color={accentPurple} />}
                  </TouchableOpacity>
                  <View style={[styles.scoreBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Star size={12} color={colors.primary} />
                    <Text style={[typography.caption, { color: colors.primary, fontFamily: 'Inter-Bold' }]}>{r.matchScore}%</Text>
                  </View>
                </View>
              </View>
              <Text style={[typography.bodySmall, { color: subtextColor, marginTop: spacing.xs }]}>{r.description}</Text>
              <View style={styles.recipeMeta}>
                <View style={styles.metaItem}><Clock size={14} color={subtextColor} /><Text style={[typography.caption, { color: subtextColor }]}>{r.estimatedTime}</Text></View>
                <View style={styles.metaItem}><Users size={14} color={subtextColor} /><Text style={[typography.caption, { color: subtextColor }]}>{r.servings} servings</Text></View>
                <View style={styles.metaItem}><Flame size={14} color={subtextColor} /><Text style={[typography.caption, { color: subtextColor }]}>{r.nutritionEstimate.calories} cal</Text></View>
                <View style={[styles.diffBadge, { backgroundColor: getDifficultyColor(r.difficulty) + '20' }]}>
                  <Text style={[typography.caption, { color: getDifficultyColor(r.difficulty), fontFamily: 'Inter-SemiBold' }]}>{r.difficulty}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'center', marginTop: spacing.xs }}>
                {isExpanded ? <ChevronUp size={18} color={subtextColor} /> : <ChevronDown size={18} color={subtextColor} />}
              </View>
            </TouchableOpacity>
            {isExpanded && (
              <View style={[styles.expandedContent, { paddingHorizontal: spacing.md, paddingBottom: spacing.md }]}>
                {!imgState?.base64 && !imgState?.loading && (
                  <TouchableOpacity onPress={() => generateImageForRecipe(r.id, r.title, r.description)}
                    style={[styles.generateImgBtn, { backgroundColor: accentPurple + '15' }]}>
                    <ImageIcon size={16} color={accentPurple} />
                    <Text style={[typography.bodySmall, { color: accentPurple, fontFamily: 'Inter-SemiBold' }]}>Generate AI Image</Text>
                  </TouchableOpacity>
                )}
                <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-SemiBold', marginTop: spacing.sm }]}>
                  Ingredients ({r.ingredients.length})
                </Text>
                {r.ingredients.map((ing, i) => (
                  <View key={i} style={styles.ingredientRow}>
                    <View style={[styles.dot, { backgroundColor: accentPurple }]} />
                    <Text style={[typography.bodySmall, { color: textColor, flex: 1 }]}>{ing.name}</Text>
                    <Text style={[typography.caption, { color: subtextColor }]}>{ing.quantity}</Text>
                  </View>
                ))}
                <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-SemiBold', marginTop: spacing.md }]}>
                  Instructions
                </Text>
                {r.instructions.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <LinearGradient colors={[accentPurple, accentPurpleDark]} style={styles.stepNum}>
                      <Text style={[typography.caption, { color: colors.white, fontFamily: 'Inter-Bold' }]}>{i + 1}</Text>
                    </LinearGradient>
                    <Text style={[typography.bodySmall, { color: textColor, flex: 1 }]}>{step}</Text>
                  </View>
                ))}
                <View style={[styles.nutritionRow, { backgroundColor: inputBg }]}>
                  <View style={styles.nutritionItem}>
                    <Text style={[typography.caption, { color: subtextColor }]}>Calories</Text>
                    <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-Bold' }]}>{r.nutritionEstimate.calories}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[typography.caption, { color: subtextColor }]}>Protein</Text>
                    <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-Bold' }]}>{r.nutritionEstimate.protein}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[typography.caption, { color: subtextColor }]}>Carbs</Text>
                    <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-Bold' }]}>{r.nutritionEstimate.carbs}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[typography.caption, { color: subtextColor }]}>Fat</Text>
                    <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-Bold' }]}>{r.nutritionEstimate.fat}g</Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleAddToCart(r)} disabled={isAdded} style={{ flex: 1 }}>
                    <LinearGradient colors={isAdded ? ['#22C55E', '#16A34A'] : [colors.primary, colors.primaryDark]} style={styles.actionBtn}>
                      {isAdded ? <CheckCircle size={16} color={colors.white} /> : <ShoppingCart size={16} color={colors.white} />}
                      <Text style={[typography.caption, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
                        {isAdded ? 'In Cart' : 'Add to Cart'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleMarkCooked(r)} disabled={recipeCooked} style={{ flex: 1 }}>
                    <LinearGradient colors={recipeCooked ? ['#22C55E', '#16A34A'] : [accentPurple, accentPurpleDark]} style={styles.actionBtn}>
                      {recipeCooked ? <CheckCircle size={16} color={colors.white} /> : <ChefHat size={16} color={colors.white} />}
                      <Text style={[typography.caption, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
                        {recipeCooked ? 'Cooked!' : 'Mark Cooked'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => speakRecipe(r)}
                  style={[styles.ttsFullBtn, { backgroundColor: isSpeaking ? colors.danger + '15' : accentPurple + '10' }]}>
                  {isSpeaking ? <VolumeX size={16} color={colors.danger} /> : <Volume2 size={16} color={accentPurple} />}
                  <Text style={[typography.caption, {
                    color: isSpeaking ? colors.danger : accentPurple, fontFamily: 'Inter-SemiBold',
                  }]}>{isSpeaking ? 'Stop Reading' : 'Read Recipe Aloud'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {!searched && !loading && (
        <View style={styles.emptyState}>
          <LinearGradient colors={[accentPurple + '20', colors.primary + '10']} style={styles.emptyGradient}>
            <Sparkles size={48} color={accentPurple} />
            <Text style={[typography.subtitle, { color: textColor, marginTop: spacing.md, textAlign: 'center' }]}>
              Ask AI Chef Anything
            </Text>
            <Text style={[typography.bodySmall, { color: subtextColor, marginTop: spacing.xs, textAlign: 'center' }]}>
              {'Search for recipes, get personalized suggestions,\nand discover new dishes powered by Gemini AI'}
            </Text>
            <View style={styles.suggestionPills}>
              {['Butter Chicken', 'Quick Pasta', 'Healthy Salad', 'Desserts'].map((s) => (
                <TouchableOpacity key={s} onPress={() => setQuery(s)}
                  style={[styles.suggestionPill, { backgroundColor: accentPurple + '15' }]}>
                  <Text style={[typography.caption, { color: accentPurple }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </View>
      )}

      {searched && !loading && recipes.length === 0 && (
        <View style={styles.emptyState}>
          <Search size={48} color={subtextColor} />
          <Text style={[typography.body, { color: subtextColor, marginTop: spacing.md }]}>No recipes found. Try a different search!</Text>
        </View>
      )}
    </>
  );

  const renderHistoryTab = () => (
    <>
      {searchHistory.length > 0 && (
        <TouchableOpacity onPress={() => Alert.alert('Clear History', 'Remove all search history?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearSearchHistory },
        ])} style={[styles.clearBtn, { backgroundColor: colors.danger + '15' }]}>
          <Trash2 size={14} color={colors.danger} />
          <Text style={[typography.caption, { color: colors.danger, fontFamily: 'Inter-SemiBold' }]}>Clear All History</Text>
        </TouchableOpacity>
      )}
      {searchHistory.length === 0 && (
        <View style={styles.emptyState}>
          <History size={48} color={subtextColor} />
          <Text style={[typography.body, { color: subtextColor, marginTop: spacing.md }]}>No search history yet</Text>
          <Text style={[typography.bodySmall, { color: subtextColor, marginTop: spacing.xs }]}>Your recipe searches will appear here</Text>
        </View>
      )}
      {searchHistory.map((entry) => (
        <View key={entry.id} style={[styles.historyCard, { backgroundColor: cardBg }]}>
          <View style={styles.historyHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Search size={14} color={accentPurple} />
                <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-SemiBold' }]}>{'"' + entry.query + '"'}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Clock size={12} color={subtextColor} />
                <Text style={[typography.caption, { color: subtextColor }]}>{formatTimestamp(entry.timestamp)}</Text>
                {entry.cuisine !== 'All' && (
                  <View style={[styles.cuisineTag, { backgroundColor: accentPurple + '15' }]}>
                    <Text style={[typography.caption, { color: accentPurple }]}>{entry.cuisine}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => removeSearchEntry(entry.id)} style={{ padding: 4 }}>
              <X size={16} color={subtextColor} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
            {entry.recipes.map((recipe) => (
              <View key={recipe.id} style={[styles.historyRecipeChip, { backgroundColor: inputBg }]}>
                <View style={[styles.historyRecipeImgPlaceholder, { backgroundColor: accentPurple + '20' }]}>
                  <Sparkles size={12} color={accentPurple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={[typography.caption, { color: textColor, fontFamily: 'Inter-SemiBold' }]}>{recipe.title}</Text>
                  <Text style={[typography.caption, { color: subtextColor, fontSize: 10 }]}>{recipe.cuisine} {recipe.estimatedTime}</Text>
                </View>
                <View style={[styles.miniScoreBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={{ color: colors.primary, fontSize: 10, fontFamily: 'Inter-Bold' }}>{recipe.matchScore}%</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={() => { setQuery(entry.query); setCuisine(entry.cuisine); setActiveTab('search'); }}
            style={[styles.reSearchBtn, { backgroundColor: accentPurple + '10' }]}>
            <Search size={14} color={accentPurple} />
            <Text style={[typography.caption, { color: accentPurple, fontFamily: 'Inter-SemiBold' }]}>Search Again</Text>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );

  const renderCookedTab = () => (
    <>
      {cookedItems.length > 0 && (
        <View style={[styles.cookedStats, { backgroundColor: cardBg }]}>
          <LinearGradient colors={[colors.secondary + '20', colors.secondary + '05']} style={styles.cookedStatsGradient}>
            <ChefHat size={24} color={colors.secondary} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={[typography.h3, { color: textColor }]}>{cookedItems.length}</Text>
              <Text style={[typography.caption, { color: subtextColor }]}>Recipes Cooked</Text>
            </View>
          </LinearGradient>
        </View>
      )}
      {cookedItems.length > 0 && (
        <TouchableOpacity onPress={() => Alert.alert('Clear Cooked', 'Remove all cooked history?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearCookedItems },
        ])} style={[styles.clearBtn, { backgroundColor: colors.danger + '15' }]}>
          <Trash2 size={14} color={colors.danger} />
          <Text style={[typography.caption, { color: colors.danger, fontFamily: 'Inter-SemiBold' }]}>Clear Cooked History</Text>
        </TouchableOpacity>
      )}
      {cookedItems.length === 0 && (
        <View style={styles.emptyState}>
          <ChefHat size={48} color={subtextColor} />
          <Text style={[typography.body, { color: subtextColor, marginTop: spacing.md }]}>Nothing cooked yet</Text>
          <Text style={[typography.bodySmall, { color: subtextColor, marginTop: spacing.xs }]}>Mark recipes as cooked to track your journey</Text>
        </View>
      )}
      <View style={styles.cookedGrid}>
        {cookedItems.map((item) => (
          <View key={item.id} style={[styles.cookedCard, { backgroundColor: cardBg }]}>
            {item.imageBase64 ? (
              <Image source={{ uri: item.imageBase64 }} style={styles.cookedImage} resizeMode="cover" />
            ) : (
              <LinearGradient colors={[accentPurple + '30', colors.primary + '20']} style={styles.cookedImagePlaceholder}>
                <ChefHat size={28} color={accentPurple} />
              </LinearGradient>
            )}
            <View style={{ padding: spacing.sm }}>
              <Text numberOfLines={2} style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-SemiBold' }]}>{item.recipeTitle}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Clock size={10} color={subtextColor} />
                <Text style={[typography.caption, { color: subtextColor, fontSize: 10 }]}>{formatTimestamp(item.cookedAt)}</Text>
              </View>
              <View style={[styles.cuisineTag, { backgroundColor: accentPurple + '15', marginTop: 4, alignSelf: 'flex-start' }]}>
                <Text style={{ color: accentPurple, fontSize: 10, fontFamily: 'Inter-SemiBold' }}>{item.cuisine}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <AppHeader title="Ask AI Chef" subtitle="Powered by Gemini" />
      <View style={[styles.tabBar, { backgroundColor: cardBg }]}>
        {([
          { key: 'search' as Tab, label: 'Search', icon: Search, count: undefined },
          { key: 'history' as Tab, label: 'History', icon: History, count: searchHistory.length || undefined },
          { key: 'cooked' as Tab, label: 'Cooked', icon: ChefHat, count: cookedItems.length || undefined },
        ]).map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)}
              style={[styles.tabItem, isActive && { borderBottomColor: accentPurple, borderBottomWidth: 2 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon size={16} color={isActive ? accentPurple : subtextColor} />
                <Text style={[typography.bodySmall, {
                  color: isActive ? accentPurple : subtextColor,
                  fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Regular',
                }]}>{tab.label}</Text>
                {tab.count !== undefined && tab.count > 0 && (
                  <View style={[styles.tabBadge, { backgroundColor: accentPurple }]}>
                    <Text style={{ color: colors.white, fontSize: 10, fontFamily: 'Inter-Bold' }}>
                      {tab.count > 99 ? '99+' : tab.count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}>
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'cooked' && renderCookedTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border + '30' },
  tabItem: { flex: 1, paddingVertical: spacing.sm + 2, alignItems: 'center', justifyContent: 'center' },
  tabBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  searchCard: { padding: spacing.md, borderRadius: borderRadius.xl, gap: spacing.sm },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.lg, paddingHorizontal: spacing.sm, gap: spacing.sm, height: 48 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter-Regular' },
  micBtn: { width: 48, height: 48, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  cuisineChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full, marginRight: spacing.xs },
  searchBtn: { borderRadius: borderRadius.lg, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiBadge: { marginTop: spacing.md, marginBottom: spacing.xs },
  aiBadgeGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full },
  recipeCard: { borderRadius: borderRadius.xl, marginTop: spacing.sm, overflow: 'hidden' },
  recipeImage: { width: '100%', height: 180 },
  recipeImagePlaceholder: { width: '100%', height: 120, alignItems: 'center', justifyContent: 'center' },
  recipeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.full },
  iconBtn: { width: 32, height: 32, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  recipeMeta: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  expandedContent: { borderTopWidth: 1, borderTopColor: colors.border + '30' },
  generateImgBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: borderRadius.md, marginTop: spacing.sm },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.md },
  nutritionItem: { alignItems: 'center', gap: 2 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: borderRadius.md },
  ttsFullBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: borderRadius.md, marginTop: spacing.sm },
  historyCard: { padding: spacing.md, borderRadius: borderRadius.xl, marginTop: spacing.sm },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyRecipeChip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.xs, borderRadius: borderRadius.md, marginRight: spacing.sm, width: 200 },
  historyRecipeImgPlaceholder: { width: 36, height: 36, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  miniScoreBadge: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: borderRadius.full },
  cuisineTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.full },
  reSearchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: borderRadius.md, marginTop: spacing.sm },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: borderRadius.md, alignSelf: 'flex-end' },
  cookedStats: { borderRadius: borderRadius.xl, overflow: 'hidden' },
  cookedStatsGradient: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  cookedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  cookedCard: { width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2, borderRadius: borderRadius.lg, overflow: 'hidden' },
  cookedImage: { width: '100%', height: 120 },
  cookedImagePlaceholder: { width: '100%', height: 120, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', marginTop: spacing.xxl, padding: spacing.xl },
  emptyGradient: { alignItems: 'center', padding: spacing.xl, borderRadius: borderRadius.xxl, width: '100%' },
  suggestionPills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.md },
  suggestionPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full },
});

export default AskAIScreen;
'''

target = os.path.join(os.path.dirname(__file__), '..', 'src', 'screens', 'AskAIScreen.tsx')
target = '/Users/debasish/Desktop/MOBILEAPP/CulinaMind-AI/src/screens/AskAIScreen.tsx'
with open(target, 'w') as f:
    f.write(content)

print(f'Written {len(content)} bytes to {target}')
