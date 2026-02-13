import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShoppingCart,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  X,
  CreditCard,
  Package,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useCartStore, CartRecipeGroup } from '../store/useCartStore';
import AppHeader from '../components/AppHeader';

const CartScreen: React.FC = () => {
  const isDark = useThemeStore((s) => s.isDarkMode);
  const items = useCartStore((s) => s.items);
  const toggleItem = useCartStore((s) => s.toggleItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const removeRecipeItems = useCartStore((s) => s.removeRecipeItems);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearChecked = useCartStore((s) => s.clearChecked);
  const getGroupedByRecipe = useCartStore((s) => s.getGroupedByRecipe);
  const getTotalCost = useCartStore((s) => s.getTotalCost);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getCheckedCount = useCartStore((s) => s.getCheckedCount);

  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});

  const bg = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;
  const subtextColor = isDark ? colors.textSecondary : colors.textMuted;

  const groups = getGroupedByRecipe();
  const totalCost = getTotalCost();
  const itemCount = getItemCount();
  const checkedCount = getCheckedCount();

  const toggleRecipeExpand = (recipeId: string) => {
    setExpandedRecipes((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
  };

  const handleRemoveRecipe = (recipeId: string, recipeName: string) => {
    Alert.alert(
      'Remove Recipe Items',
      'Remove all items for "' + recipeName + '" from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeRecipeItems(recipeId) },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      'Total: $' + totalCost.toFixed(2) + '\n' + itemCount + ' items\n\nThis is a demo - no actual purchase will be made.',
      [{ text: 'OK' }]
    );
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <AppHeader title="Shopping Cart" />
        <View style={styles.emptyState}>
          <ShoppingCart size={64} color={subtextColor} />
          <Text style={[typography.h3, { color: textColor, marginTop: spacing.md }]}>
            Your cart is empty
          </Text>
          <Text style={[typography.bodySmall, { color: subtextColor, marginTop: spacing.xs, textAlign: 'center' }]}>
            Import a recipe or search with AI to add ingredients to your cart
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <AppHeader title="Shopping Cart" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 200 }}
      >
        {/* Summary Card */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#334155'] : ['#FFF7ED', '#FEF3C7']}
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text style={[typography.caption, { color: subtextColor }]}>Total Items</Text>
              <Text style={[typography.h2, { color: textColor }]}>{itemCount}</Text>
            </View>
            <View>
              <Text style={[typography.caption, { color: subtextColor }]}>Checked</Text>
              <Text style={[typography.h2, { color: colors.secondary }]}>{checkedCount}</Text>
            </View>
            <View>
              <Text style={[typography.caption, { color: subtextColor }]}>Est. Total</Text>
              <Text style={[typography.h2, { color: colors.primary }]}>
                {'$' + totalCost.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryActions}>
            {checkedCount > 0 && (
              <TouchableOpacity onPress={clearChecked} style={styles.summaryBtn}>
                <Trash2 size={14} color={colors.danger} />
                <Text style={[typography.caption, { color: colors.danger }]}>Clear Checked</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleClearCart} style={styles.summaryBtn}>
              <X size={14} color={colors.danger} />
              <Text style={[typography.caption, { color: colors.danger }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Recipe Groups */}
        <Text style={[typography.subtitle, { color: textColor, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Items by Recipe ({groups.length} recipes)
        </Text>
        {groups.map((group) => {
          const isExpanded = expandedRecipes[group.recipeId] !== false;
          const checkedInGroup = group.items.filter((i) => i.isChecked).length;
          return (
            <View key={group.recipeId} style={[styles.recipeGroup, { backgroundColor: cardBg }]}>
              <TouchableOpacity
                style={styles.recipeGroupHeader}
                onPress={() => toggleRecipeExpand(group.recipeId)}
              >
                <View style={styles.recipeGroupLeft}>
                  <Package size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodySmall, { color: textColor, fontFamily: 'Inter-SemiBold' }]} numberOfLines={1}>
                      {group.recipeName}
                    </Text>
                    <Text style={[typography.caption, { color: subtextColor }]}>
                      {checkedInGroup}/{group.items.length} items  -  {'$' + group.totalEstimatedCost.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => handleRemoveRecipe(group.recipeId, group.recipeName)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                  {isExpanded ? (
                    <ChevronUp size={18} color={subtextColor} />
                  ) : (
                    <ChevronDown size={18} color={subtextColor} />
                  )}
                </View>
              </TouchableOpacity>

              {isExpanded &&
                group.items.map((item) => (
                  <View key={item.id} style={[styles.cartItem, item.isChecked && styles.cartItemChecked]}>
                    <TouchableOpacity onPress={() => toggleItem(item.id)}>
                      {item.isChecked ? (
                        <CheckCircle size={22} color={colors.secondary} />
                      ) : (
                        <Circle size={22} color={subtextColor} />
                      )}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          typography.bodySmall,
                          {
                            color: item.isChecked ? subtextColor : textColor,
                            textDecorationLine: item.isChecked ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={[typography.caption, { color: subtextColor }]}>
                        {item.quantity} - {item.category}
                      </Text>
                    </View>
                    <Text style={[typography.bodySmall, { color: colors.primary, fontFamily: 'Inter-SemiBold' }]}>
                      {'$' + item.estimatedPrice.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={16} color={subtextColor} />
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Checkout Bar */}
      <View style={[styles.checkoutBar, { backgroundColor: cardBg }]}>
        <View>
          <Text style={[typography.caption, { color: subtextColor }]}>Total</Text>
          <Text style={[typography.h3, { color: colors.primary }]}>
            {'$' + totalCost.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCheckout}>
          <LinearGradient
            colors={['#F97316', '#EA580C']}
            style={styles.checkoutBtn}
          >
            <CreditCard size={18} color={colors.white} />
            <Text style={[typography.body, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
              Checkout
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  summaryCard: { borderRadius: borderRadius.lg, padding: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  summaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recipeGroup: { borderRadius: borderRadius.lg, marginBottom: spacing.sm, overflow: 'hidden' },
  recipeGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  recipeGroupLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border + '30',
  },
  cartItemChecked: { opacity: 0.6 },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
  },
});

export default CartScreen;
