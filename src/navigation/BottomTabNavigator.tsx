import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Package,
  Download,
  Sparkles,
  Activity,
  ShoppingCart,
  UserCircle,
  MessageCircle,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useThemeStore } from '../store/useThemeStore';
import { useChatStore } from '../store/useChatStore';
import { BottomTabParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import ImportScreen from '../screens/ImportScreen';
import AskAIScreen from '../screens/AskAIScreen';
import NutritionScreen from '../screens/NutritionScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatBotScreen from '../screens/ChatBotScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ─── Floating Chat FAB ──────────────────────────────────────────────

const ChatFAB = () => {
  const openChat = useChatStore((s) => s.open);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.fabContainer, { transform: [{ scale: pulse }] }]}
    >
      <TouchableOpacity
        onPress={openChat}
        activeOpacity={0.8}
        style={styles.fab}
      >
        <MessageCircle size={24} color={colors.white} fill={colors.white} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Bottom Tab Navigator ───────────────────────────────────────────

const BottomTabNavigator = () => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const isChatOpen = useChatStore((s) => s.isOpen);
  const closeChat = useChatStore((s) => s.close);

  return (
    <View style={styles.root}>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode
          ? colors.textSecondary
          : colors.textMuted,
        tabBarStyle: {
          backgroundColor: isDarkMode
            ? colors.backgroundDark
            : colors.backgroundLight,
          borderTopColor: isDarkMode ? colors.border : colors.borderLight,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Pantry"
        component={PantryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Package size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Import"
        component={ImportScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Download size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AskAI"
        component={AskAIScreen}
        options={{
          tabBarLabel: 'Ask AI',
          tabBarIcon: ({ color, size }) => (
            <Sparkles size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Activity size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserCircle size={size - 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>

      {/* Floating Chat FAB */}
      <ChatFAB />

      {/* Chat Modal */}
      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeChat}
      >
        <ChatBotScreen onClose={closeChat} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 76,
    right: 16,
    zIndex: 100,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default BottomTabNavigator;
