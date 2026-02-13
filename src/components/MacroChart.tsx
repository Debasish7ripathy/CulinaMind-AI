import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';

interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const MacroChart: React.FC<MacroChartProps> = ({ protein, carbs, fat }) => {
  const isDark = useThemeStore((s) => s.isDarkMode);
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;
  const width = Dimensions.get('window').width - 64;

  const total = protein + carbs + fat || 1;
  const data = [
    {
      name: 'Protein',
      population: protein,
      color: colors.primary,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Carbs',
      population: carbs,
      color: colors.info,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Fat',
      population: fat,
      color: colors.warning,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: cardBg }, getShadow('small')]}>
      <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>
        Macro Distribution
      </Text>
      <PieChart
        data={data}
        width={width}
        height={160}
        chartConfig={{
          color: () => colors.textPrimary,
          labelColor: () => colors.textSecondary,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute={false}
      />
      <View style={styles.percRow}>
        {data.map((d) => (
          <View key={d.name} style={styles.percItem}>
            <View style={[styles.dot, { backgroundColor: d.color }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {d.name} {Math.round((d.population / total) * 100)}%
            </Text>
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
  percRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  percItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default MacroChart;
