import React from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Share2, Trash2, Flame, DollarSign } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { useShoppingStore } from '../store/useShoppingStore';
import { RootStackScreenProps } from '../navigation/types';
import ShoppingItem from '../components/ShoppingItem';
import NutritionCard from '../components/NutritionCard';
import Badge from '../components/Badge';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const ShoppingListScreen = ({
  navigation,
}: RootStackScreenProps<'ShoppingList'>) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const { items, toggleItem, getGroupedItems, getTotalEstimate, clearChecked } =
    useShoppingStore();

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;
  const total = getTotalEstimate();
  const grouped = getGroupedItems();

  const sections = Object.entries(grouped).map(([category, categoryItems]) => ({
    title: category,
    data: categoryItems,
  }));

  const checkedCount = items.filter((i) => i.isChecked).length;

  // Mock nutrition projection for all items
  const projectedNutrition = { calories: 2340, protein: 156, carbs: 280, fat: 92 };

  return (
    <View
      style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: cardBg }]}
          onPress={() => { hapticLight(); navigation.goBack(); }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[typography.subtitle, { color: textColor }]}>
          Shopping List
        </Text>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => hapticLight()}
          activeOpacity={0.7}
        >
          <Share2 size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Cost & Summary Card */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)}>
        <View
          style={[styles.costCard, { backgroundColor: cardBg }, getShadow('small')]}
        >
          <View style={styles.costRow}>
            <View>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Estimated Total
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <DollarSign size={18} color={colors.primary} />
                <Text style={[typography.h2, { color: colors.primary }]}>
                  {total.toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={styles.costMeta}>
              <Badge label={`${items.length - checkedCount} remaining`} color={colors.info} />
              <Badge label={`${checkedCount} done`} color={colors.secondary} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Grouped Shopping List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[typography.label, styles.sectionHeader, { color: colors.textSecondary }]}>
                {section.title.toUpperCase()}
              </Text>
              <Badge label={`${section.data.length}`} />
            </View>
          </Animated.View>
        )}
        renderItem={({ item }) => (
          <ShoppingItem item={item} onToggle={toggleItem} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={null}
        ListFooterComponent={
          items.length > 0 ? (
            <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.nutritionFooter}>
              <View style={styles.nutritionHeader}>
                <Flame size={16} color={colors.primary} />
                <Text style={[typography.label, { color: textColor, marginLeft: 6 }]}>
                  Nutrition Projection
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                Total nutrition from all items in your list
              </Text>
              <NutritionCard
                calories={projectedNutrition.calories}
                protein={projectedNutrition.protein}
                carbs={projectedNutrition.carbs}
                fat={projectedNutrition.fat}
                compact
              />
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={[typography.subtitle, { color: textColor, marginTop: spacing.md }]}>
              Your list is empty
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Items will appear here when you import recipes
            </Text>
          </View>
        }
      />

      {/* Bottom Actions */}
      {checkedCount > 0 && (
        <Animated.View
          entering={FadeInUp.duration(200)}
          style={[styles.bottomBar, { backgroundColor: cardBg }, getShadow('medium')]}
        >
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => { hapticSuccess(); clearChecked(); }}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={colors.danger} />
            <Text style={[typography.buttonSmall, { color: colors.danger, marginLeft: 6 }]}>
              Clear {checkedCount} checked
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costCard: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.md,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  nutritionFooter: {
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: 34,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.danger + '30',
    backgroundColor: colors.danger + '10',
  },
});

export default ShoppingListScreen;
