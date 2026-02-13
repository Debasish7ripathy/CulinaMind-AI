import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Trash2, Bot, User } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { useChatStore, ChatMessage } from '../store/useChatStore';
import { chatWithGemini, ChatTurn } from '../services/gemini';
import { usePantryStore } from '../store/usePantryStore';

// ─── Typing Dots Animation ──────────────────────────────────────────

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={styles.typingRow}>
      <View style={styles.botAvatar}>
        <Bot size={14} color={colors.white} />
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.typingDot, dotStyle(d)]} />
        ))}
      </View>
    </View>
  );
};

// ─── Message Bubble ─────────────────────────────────────────────────

const MessageBubble = React.memo(({ item }: { item: ChatMessage }) => {
  const isUser = item.role === 'user';
  const time = new Date(item.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Bot size={14} color={colors.white} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[styles.timeText, isUser && { color: 'rgba(255,255,255,0.6)' }]}
        >
          {time}
        </Text>
      </View>
      {isUser && (
        <View style={styles.userAvatar}>
          <User size={14} color={colors.white} />
        </View>
      )}
    </View>
  );
});

// ─── Chat Screen ────────────────────────────────────────────────────

interface ChatBotScreenProps {
  onClose: () => void;
}

const ChatBotScreen: React.FC<ChatBotScreenProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const messages = useChatStore((s) => s.messages);
  const isTyping = useChatStore((s) => s.isTyping);
  const addMessage = useChatStore((s) => s.addMessage);
  const setTyping = useChatStore((s) => s.setTyping);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const pantryIngredients = usePantryStore((s) => s.ingredients);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    Keyboard.dismiss();
    setInput('');

    // Add user message
    addMessage('user', trimmed);
    setTyping(true);

    try {
      // Build history from existing messages (excluding welcome)
      const history: ChatTurn[] = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

      // Build pantry context so the AI knows what the user has
      const pantryContext = pantryIngredients.length > 0
        ? `The user currently has these items in their pantry (use this to give personalized recipe suggestions and cooking advice):\n${pantryIngredients.map((i) => {
            const daysLeft = Math.ceil((new Date(i.expiryDate).getTime() - Date.now()) / 86400000);
            return `• ${i.name}: ${i.quantity} ${i.unit} (expires in ${daysLeft} days${daysLeft <= 3 ? ' ⚠️ EXPIRING SOON' : ''}, category: ${i.category})`;
          }).join('\n')}\nWhen the user asks for recipes or meal ideas, prioritize using ingredients they already have. If items are expiring soon, suggest recipes that use those first.`
        : undefined;

      const reply = await chatWithGemini(trimmed, history, pantryContext);
      addMessage('bot', reply);
    } catch (error: any) {
      addMessage(
        'bot',
        '⚠️ ' +
          (error?.message ||
            'Something went wrong. Please check your connection and try again.'),
      );
    } finally {
      setTyping(false);
    }
  }, [input, isTyping, messages]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Bot size={20} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>CulinaMind Chat</Text>
            <Text style={styles.headerSubtitle}>
              {isTyping ? 'Typing...' : 'AI Cooking Assistant'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={clearMessages}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Input Area */}
        <View style={[styles.inputArea, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything about cooking..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
              returnKeyType="default"
              editable={!isTyping}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || isTyping}
              style={[
                styles.sendBtn,
                (!input.trim() || isTyping) && styles.sendBtnDisabled,
              ]}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Send size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  flex1: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardDark,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardDarkElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239,68,68,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm + 4,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    maxWidth: '100%',
  },
  botBubble: {
    backgroundColor: colors.cardDarkElevated,
    borderBottomLeftRadius: borderRadius.xs || 4,
    marginLeft: spacing.xs + 2,
  },
  userBubble: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: borderRadius.xs || 4,
    marginRight: spacing.xs + 2,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  botMessageText: {
    color: colors.textPrimary,
  },
  userMessageText: {
    color: colors.white,
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // Avatars
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDarkElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: 4,
    marginLeft: spacing.xs + 2,
    gap: 5,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#8B5CF6',
  },

  // Input
  inputArea: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: colors.cardDark,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.cardDarkElevated,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    minHeight: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default ChatBotScreen;
