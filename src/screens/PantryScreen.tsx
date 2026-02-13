import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import {
  Search,
  ChefHat,
  AlertTriangle,
  Sparkles,
  Send,
  Plus,
  Check,
  Package,
  MessageCircle,
  X,
  Bot,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { usePantryStore } from '../store/usePantryStore';
import { TabScreenProps } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import FilterChip from '../components/FilterChip';
import IngredientCard from '../components/IngredientCard';
import Badge from '../components/Badge';
import { hapticLight, hapticMedium, hapticSuccess } from '../utils/haptics';
import { chatWithGemini } from '../services/gemini';
import { Ingredient, IngredientCategory, UnitType } from '../types/ingredient';

// ─── Types ──────────────────────────────────────────────────────────

interface ParsedItem {
  name: string;
  quantity: number;
  unit: UnitType;
  category: IngredientCategory;
  expiryDays: number;
  added: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  parsedItems?: ParsedItem[];
}

// ─── AI chat prompt ─────────────────────────────────────────────────

const PANTRY_SYSTEM = `You are CulinaMind Pantry AI. The user tells you what food items they have or just bought. Your job:
1. Parse what they said into individual food items.
2. For EACH item return a JSON array in a fenced code block with this schema:
\`\`\`json
[{"name":"Tomatoes","quantity":4,"unit":"pieces","category":"Vegetables","expiryDays":7}]
\`\`\`
Valid categories: Vegetables, Fruits, Dairy, Meat, Grains, Spices, Beverages, Snacks, Frozen, Other
Valid units: kg, g, lbs, oz, liters, ml, cups, tbsp, tsp, pieces, dozen, bunch
3. After the JSON block, add a SHORT friendly sentence (1-2 lines max) acknowledging what they listed.
4. If the user asks something not related to adding food, answer helpfully but do NOT output JSON.`;

// ─── Helpers ────────────────────────────────────────────────────────

function tryParseItems(text: string): ParsedItem[] {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[1]);
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any) => ({
      name: item.name ?? 'Unknown',
      quantity: item.quantity ?? 1,
      unit: item.unit ?? 'pieces',
      category: item.category ?? 'Other',
      expiryDays: item.expiryDays ?? 7,
      added: false,
    }));
  } catch {
    return [];
  }
}

function stripJsonBlock(text: string): string {
  return text.replace(/```json[\s\S]*?```/g, '').trim();
}

const filters = ['All', 'Expiring', 'Surplus'] as const;

// ─── Component ──────────────────────────────────────────────────────

const PantryScreen = ({ navigation }: TabScreenProps<'Pantry'>) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const {
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    getFilteredIngredients,
    ingredients,
    addIngredient,
  } = usePantryStore();

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;
  const filteredIngredients = getFilteredIngredients();

  const expiringCount = ingredients.filter(
    (i) => i.daysUntilExpiry !== undefined && i.daysUntilExpiry <= 3
  ).length;

  // ── Chat state ────────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatListRef = useRef<FlatList>(null);

  const toggleChat = () => {
    hapticLight();
    setChatOpen((prev) => !prev);
  };

  const handleAddItem = useCallback(
    (msgId: string, itemIdx: number) => {
      hapticSuccess();
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== msgId || !m.parsedItems) return m;
          const updated = [...m.parsedItems];
          const item = updated[itemIdx];
          if (item.added) return m;

          const now = new Date();
          const expiry = new Date();
          expiry.setDate(now.getDate() + item.expiryDays);

          const newIngredient: Ingredient = {
            id: `ai-${Date.now()}-${itemIdx}`,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            expiryDate: expiry.toISOString().split('T')[0],
            category: item.category,
            isSurplus: false,
            addedAt: now.toISOString().split('T')[0],
          };
          addIngredient(newIngredient);
          updated[itemIdx] = { ...item, added: true };
          return { ...m, parsedItems: updated };
        }),
      );
    },
    [addIngredient],
  );

  const handleAddAll = useCallback(
    (msgId: string) => {
      hapticSuccess();
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== msgId || !m.parsedItems) return m;
          const updated = m.parsedItems.map((item, idx) => {
            if (item.added) return item;
            const now = new Date();
            const expiry = new Date();
            expiry.setDate(now.getDate() + item.expiryDays);
            addIngredient({
              id: `ai-${Date.now()}-${idx}`,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              expiryDate: expiry.toISOString().split('T')[0],
              category: item.category,
              isSurplus: false,
              addedAt: now.toISOString().split('T')[0],
            });
            return { ...item, added: true };
          });
          return { ...m, parsedItems: updated };
        }),
      );
    },
    [addIngredient],
  );

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    hapticMedium();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        text: m.text,
      }));

      // Build pantry context so the AI knows what's already in the pantry
      let pantryPrompt = PANTRY_SYSTEM;
      if (ingredients.length > 0) {
        pantryPrompt += `\n\nThe user currently has these items in their pantry:\n${ingredients.map((i) => {
          const daysLeft = Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / 86400000);
          return `• ${i.name}: ${i.quantity} ${i.unit} (expires in ${daysLeft} days${daysLeft <= 3 ? ' ⚠️ EXPIRING SOON' : ''}, category: ${i.category})`;
        }).join('\n')}\nUse this info to avoid suggesting duplicates and give contextual advice like "you already have X" or "this pairs well with your existing Y".`;
      }

      const reply = await chatWithGemini(
        trimmed,
        [{ role: 'user' as const, text: pantryPrompt }, { role: 'model' as const, text: 'Understood! I can see your pantry. Tell me what food items you have and I\'ll help you add them.' }, ...history],
      );

      const parsed = tryParseItems(reply);
      const cleanText = stripJsonBlock(reply);

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: cleanText || 'Got it!',
        parsedItems: parsed.length > 0 ? parsed : undefined,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'assistant', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────

  const renderChatMessage = ({ item: msg }: { item: ChatMessage }) => {
    const isUser = msg.role === 'user';
    return (
      <Animated.View entering={FadeIn.duration(300)} style={[s.msgRow, isUser && s.msgRowUser]}>
        {!isUser && (
          <View style={s.avatarAi}>
            <Bot size={16} color={colors.primary} />
          </View>
        )}
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAi]}>
          <Text style={[s.bubbleText, isUser && { color: colors.white }]}>{msg.text}</Text>

          {/* Parsed item cards */}
          {msg.parsedItems && msg.parsedItems.length > 0 && (
            <View style={s.itemsContainer}>
              {msg.parsedItems.map((item, idx) => (
                <View key={idx} style={[s.itemCard, item.added && s.itemCardAdded]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemMeta}>
                      {item.quantity} {item.unit} · {item.category} · ~{item.expiryDays}d
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAddItem(msg.id, idx)}
                    disabled={item.added}
                    style={[s.addItemBtn, item.added && s.addItemBtnDone]}
                    activeOpacity={0.7}
                  >
                    {item.added ? (
                      <Check size={14} color={colors.white} />
                    ) : (
                      <Plus size={14} color={colors.white} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
              {/* Add All button */}
              {msg.parsedItems.some((i) => !i.added) && (
                <TouchableOpacity
                  style={s.addAllBtn}
                  onPress={() => handleAddAll(msg.id)}
                  activeOpacity={0.8}
                >
                  <Package size={14} color={colors.white} />
                  <Text style={s.addAllText}>Add All to Pantry</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  // ── Main UI ───────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppHeader title="My Pantry" subtitle={`${ingredients.length} ingredients tracked`} />

      {/* ── Chat overlay ───────────────────────────────────────── */}
      {chatOpen ? (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Chat header */}
          <View style={s.chatHeader}>
            <View style={s.chatHeaderLeft}>
              <Sparkles size={18} color={colors.primary} />
              <Text style={[typography.subtitle, { color: textColor, marginLeft: 8 }]}>
                AI Pantry Assistant
              </Text>
            </View>
            <TouchableOpacity onPress={toggleChat} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={chatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderChatMessage}
            contentContainerStyle={s.chatList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={s.emptyChat}>
                <View style={s.emptyChatIcon}>
                  <ChefHat size={32} color={colors.primary} />
                </View>
                <Text style={[typography.subtitle, { color: textColor, marginTop: 16 }]}>
                  Tell me what you have!
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center', marginTop: 6, paddingHorizontal: 30 }]}>
                  Say something like "I bought tomatoes, milk, chicken and some rice" and I'll add them for you.
                </Text>
                {/* Quick prompts */}
                <View style={s.quickPromptsRow}>
                  {['I just bought groceries', 'What\'s expiring soon?', 'Add eggs and butter'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={s.quickPrompt}
                      onPress={() => { setInput(p); }}
                      activeOpacity={0.7}
                    >
                      <Text style={s.quickPromptText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
          />

          {/* Typing indicator */}
          {sending && (
            <View style={s.typingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 8 }]}>
                Thinking...
              </Text>
            </View>
          )}

          {/* Input */}
          <View style={[s.inputRow, { backgroundColor: cardBg, paddingBottom: Math.max(insets.bottom, 8) }]}>
            <TextInput
              style={[s.chatInput, { color: textColor, backgroundColor: isDarkMode ? colors.backgroundDark : colors.borderLight }]}
              placeholder="Tell me what food you have..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[s.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]}
              onPress={sendMessage}
              disabled={!input.trim() || sending}
              activeOpacity={0.7}
            >
              <Send size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        /* ── Pantry list ─────────────────────────────────────── */
        <>
          {/* Expiring banner */}
          {expiringCount > 0 && (
            <Animated.View entering={FadeInDown.delay(50).duration(300)} style={{ paddingHorizontal: spacing.md }}>
              <View style={[styles.wasteBanner, { backgroundColor: colors.warning + '12' }]}>
                <AlertTriangle size={18} color={colors.warning} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[typography.label, { color: colors.warning }]}>
                    {expiringCount} item{expiringCount > 1 ? 's' : ''} expiring soon
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    Tap the AI button to get recipe ideas!
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Search */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: isDarkMode ? colors.cardDark : colors.borderLight }]}>
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search ingredients..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </Animated.View>

          {/* Filters */}
          <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.filterRow}>
            {filters.map((f) => (
              <FilterChip key={f} label={f} isActive={filter === f} onPress={() => setFilter(f)} />
            ))}
          </Animated.View>

          {/* Count */}
          <Animated.View entering={FadeInDown.delay(250).duration(300)}>
            <Text style={[typography.caption, { color: colors.textSecondary, marginHorizontal: spacing.md, marginBottom: spacing.sm }]}>
              {filteredIngredients.length} item{filteredIngredients.length !== 1 ? 's' : ''}
            </Text>
          </Animated.View>

          {/* Grid */}
          <FlatList
            data={filteredIngredients}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(300 + index * 50).duration(300)} style={styles.gridItem}>
                <IngredientCard ingredient={item} />
              </Animated.View>
            )}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🥬</Text>
                <Text style={[typography.subtitle, { color: textColor, marginTop: spacing.md }]}>
                  No ingredients found
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
                  Tap the AI button below to add items via chat
                </Text>
              </View>
            }
          />

          {/* AI Chat FAB */}
          <TouchableOpacity
            style={[styles.aiFab, getShadow('medium')]}
            onPress={toggleChat}
            activeOpacity={0.85}
          >
            <Sparkles size={22} color={colors.white} />
          </TouchableOpacity>

          {/* Manual add FAB */}
          <TouchableOpacity
            style={[styles.addFab, getShadow('small')]}
            onPress={() => { hapticLight(); navigation.navigate('AddIngredient'); }}
            activeOpacity={0.85}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// ─── Pantry list styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  chatContainer: { flex: 1 },
  wasteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  gridItem: { width: '48%' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 64 },
  aiFab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 84,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardDarkElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Chat styles ────────────────────────────────────────────────────

const s = StyleSheet.create({
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  chatList: { padding: spacing.md, paddingBottom: 20 },
  emptyChat: { alignItems: 'center', paddingTop: 40 },
  emptyChatIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPromptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  quickPrompt: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.primary + '12',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  quickPromptText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.primary,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  chatInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  // Messages
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  msgRowUser: { justifyContent: 'flex-end' },
  avatarAi: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: colors.cardDark,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  // Parsed items
  itemsContainer: { marginTop: 10, gap: 6 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    borderRadius: 12,
  },
  itemCardAdded: { opacity: 0.6 },
  itemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: colors.white,
  },
  itemMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  addItemBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addItemBtnDone: { backgroundColor: colors.textMuted },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginTop: 2,
  },
  addAllText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: colors.white,
  },
});

export default PantryScreen;
