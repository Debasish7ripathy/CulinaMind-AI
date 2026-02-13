import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

// ─── Store ────────────────────────────────────────────────────────────

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;

  addMessage: (role: 'user' | 'bot', text: string) => void;
  setTyping: (typing: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  clearMessages: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: "Hi there! 👋 I'm CulinaMind, your AI cooking assistant. Ask me anything about recipes, ingredients, cooking techniques, nutrition, meal planning, or food storage tips!",
  timestamp: Date.now(),
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [WELCOME_MESSAGE],
  isTyping: false,
  isOpen: false,

  addMessage: (role, text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role,
          text,
          timestamp: Date.now(),
        },
      ],
    })),

  setTyping: (typing) => set({ isTyping: typing }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  clearMessages: () => set({ messages: [WELCOME_MESSAGE] }),
}));
