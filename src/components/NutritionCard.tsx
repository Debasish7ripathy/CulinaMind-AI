import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';

interface NutritionCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  compact?: boolean;
}

const NutritionCard: React.FC<NutritionCardProps> = ({
  calories, protein, carbs, fat, fiber, compact = false,
}) => {
  const isDark = useThemeStore((s) => s.isDarkMode);
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;

  const macros: { label: string; value: string; icon: typeof Beef; color: string }[] = [
    { label: 'Protein', value: `${protein}g`, icon: Beef, color: colors.primary },
    { label: 'Carbs', value: `${carbs}g`, icon: Wheat, color: colors.info },
    { label: 'Fat', value: `${fat}g`, icon: Droplets, color: colors.warning },
  ];
  if (fiber !== undefined) {
    macros.push({ label: 'Fiber', value: `${fiber}g`, icon: Droplets, color: colors.secondary });
  }

  return (
    <View style={[styles.card, compact && styles.compact, { backgroundColor: cardBg }, getShadow('small')]}>
      {/* Calorie header */}
      <View style={styles.calRow}>
        <Flame size={18} color={colors.primary} />
        <Text style={[typography.subtitle, { color: textColor, marginLeft: 6 }]}>
          {calories}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>
          kcal
        </Text>
      </View>

      {/* Macros */}
      <View style={styles.macroRow}>
        {macros.map((m) => (
          <View key={m.label} style={styles.macroItem}>
            <View style={[styles.macroIcon, { backgroundColor: m.color + '15' }]}>
              <m.icon size={14} color={m.color} />
            </View>
            <Text style={[typography.label, { color: textColor }]}>{m.value}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  compact: {
    padding: spacing.sm,
  },
  calRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    gap: 4,
  },
  macroIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NutritionCard;
