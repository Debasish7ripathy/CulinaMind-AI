import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { GroceryItem } from '../types/recipe';
import { hapticLight } from '../utils/haptics';

interface GroceryListItemProps {
  item: GroceryItem;
  onToggle: () => void;
}

const GroceryListItem: React.FC<GroceryListItemProps> = ({ item, onToggle }) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBg }]}
      activeOpacity={0.7}
      onPress={() => {
        hapticLight();
        onToggle();
      }}
    >
      {/* Checkbox */}
      <View
        style={[
          styles.checkbox,
          item.isChecked
            ? { backgroundColor: colors.secondary, borderColor: colors.secondary }
            : { borderColor: colors.textMuted },
        ]}
      >
        {item.isChecked && <Check size={14} color={colors.white} />}
      </View>

      {/* Item details */}
      <View style={styles.content}>
        <Text
          style={[
            typography.body,
            {
              color: item.isChecked ? colors.textMuted : textColor,
              textDecorationLine: item.isChecked ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginTop: 1 },
          ]}
        >
          {item.quantity}
          {item.notes ? ` · ${item.notes}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
});

export default GroceryListItem;
