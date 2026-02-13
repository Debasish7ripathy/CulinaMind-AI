import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  BookOpen,
  Plus,
  Search,
  Library,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { useCookbookStore } from '../store/useCookbookStore';
import { Cookbook } from '../types/cookbook';
import CookbookCard from '../components/CookbookCard';
import { hapticMedium, hapticLight } from '../utils/haptics';

const CookbookCollectionScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const { cookbooks, addCookbook, removeCookbook } = useCookbookStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;
  const inputBg = isDarkMode ? colors.cardDarkElevated : '#F1F5F9';

  const handleAddCookbook = () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Info', 'Please enter the cookbook title.');
      return;
    }
    hapticMedium();
    const cookbook: Cookbook = {
      id: `cb-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Unknown Author',
      addedAt: new Date().toISOString(),
    };
    addCookbook(cookbook);
    setNewTitle('');
    setNewAuthor('');
    setShowAddForm(false);
  };

  const handleRemove = (id: string, title: string) => {
    Alert.alert('Remove Cookbook', `Remove "${title}" from your collection?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          hapticLight();
          removeCookbook(id);
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text style={[typography.h2, { color: textColor }]}>
            📚 My Cookbooks
          </Text>
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
          >
            {cookbooks.length} {cookbooks.length === 1 ? 'cookbook' : 'cookbooks'} in
            your collection
          </Text>
        </View>
      </View>

      {/* Find Recipes CTA */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <TouchableOpacity
          style={[styles.findRecipesCta, getShadow('glow')]}
          activeOpacity={0.85}
          onPress={() => {
            hapticMedium();
            navigation.navigate('RecipeFinder');
          }}
        >
          <View style={styles.ctaInner}>
            <View style={styles.ctaIconCircle}>
              <Search size={22} color={colors.white} />
            </View>
            <View style={styles.ctaContent}>
              <Text style={[typography.button, { color: colors.white }]}>
                Find Recipes by Ingredients
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.white + 'B0', marginTop: 2 },
                ]}
              >
                Tell us what's in your kitchen
              </Text>
            </View>
            <ChevronRight size={20} color={colors.white + '80'} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Cookbook list */}
      <FlatList
        data={cookbooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(150 + index * 60).duration(350)}>
            <CookbookCard
              cookbook={item}
              onRemove={() => handleRemove(item.id, item.title)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Library size={48} color={colors.textMuted} />
            <Text
              style={[
                typography.subtitle,
                { color: colors.textMuted, marginTop: spacing.md },
              ]}
            >
              No cookbooks yet
            </Text>
            <Text
              style={[
                typography.caption,
                {
                  color: colors.textMuted,
                  textAlign: 'center',
                  marginTop: spacing.xs,
                },
              ]}
            >
              Add the cookbooks you own so we can{'\n'}find recipes for you
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* Add Cookbook Form / Button */}
      {showAddForm ? (
        <View style={[styles.addForm, { backgroundColor: cardBg }, getShadow('medium')]}>
          <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>
            Add a Cookbook
          </Text>
          <TextInput
            style={[styles.formInput, { backgroundColor: inputBg, color: textColor }]}
            placeholder="Cookbook Title *"
            placeholderTextColor={colors.textMuted}
            value={newTitle}
            onChangeText={setNewTitle}
            returnKeyType="next"
          />
          <TextInput
            style={[styles.formInput, { backgroundColor: inputBg, color: textColor }]}
            placeholder="Author"
            placeholderTextColor={colors.textMuted}
            value={newAuthor}
            onChangeText={setNewAuthor}
            returnKeyType="done"
            onSubmitEditing={handleAddCookbook}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddForm(false);
                setNewTitle('');
                setNewAuthor('');
              }}
            >
              <Text style={[typography.button, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleAddCookbook}
            >
              <Text style={[typography.button, { color: colors.white }]}>
                Add Cookbook
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }, getShadow('glow')]}
          onPress={() => {
            hapticLight();
            setShowAddForm(true);
          }}
        >
          <Plus size={26} color={colors.white} />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  findRecipesCta: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  ctaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  ctaContent: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  addForm: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  formInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  saveButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CookbookCollectionScreen;
