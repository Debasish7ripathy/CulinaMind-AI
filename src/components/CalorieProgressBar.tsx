import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface CalorieProgressBarProps {
  consumed: number;
  goal: number;
  label?: string;
}

const CalorieProgressBar: React.FC<CalorieProgressBarProps> = ({
  consumed,
  goal,
  label = 'Weekly Calories',
}) => {
  const isDark = useThemeStore((s) => s.isDarkMode);
  const textColor = isDark ? colors.textPrimary : colors.textDark;

  const pct = Math.min(100, Math.round((consumed / goal) * 100));
  const barColor =
    pct > 100 ? colors.danger : pct > 85 ? colors.warning : colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[typography.bodySmall, { color: textColor }]}>{label}</Text>
        <Text style={[typography.label, { color: colors.textSecondary }]}>
          {consumed.toLocaleString()} / {goal.toLocaleString()} kcal
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[typography.caption, { color: barColor, marginTop: 4, alignSelf: 'flex-end' }]}>
        {pct}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});

export default CalorieProgressBar;
