import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leaf, Droplets, Cloud, Heart } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { EcoImpactStats } from '../types/user';

interface EcoImpactCardProps {
  stats: EcoImpactStats;
}

const EcoImpactCard: React.FC<EcoImpactCardProps> = ({ stats }) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  const statItems = [
    {
      icon: <Leaf size={20} color={colors.secondary} />,
      label: 'Food Saved',
      value: `${stats.foodSaved} kg`,
      color: colors.secondary,
    },
    {
      icon: <Cloud size={20} color={colors.info} />,
      label: 'CO₂ Reduced',
      value: `${stats.co2Reduced} kg`,
      color: colors.info,
    },
    {
      icon: <Droplets size={20} color={'#06B6D4'} />,
      label: 'Water Saved',
      value: `${stats.waterSaved} L`,
      color: '#06B6D4',
    },
    {
      icon: <Heart size={20} color={colors.danger} />,
      label: 'Meals Shared',
      value: `${stats.mealsShared}`,
      color: colors.danger,
    },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
        },
        getShadow('medium'),
      ]}
    >
      <Text
        style={[
          typography.subtitle,
          {
            color: isDarkMode ? colors.textPrimary : colors.textDark,
            marginBottom: spacing.md,
          },
        ]}
      >
        🌍 Your Eco Impact
      </Text>
      <View style={styles.grid}>
        {statItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.statItem,
              {
                backgroundColor: isDarkMode
                  ? colors.cardDarkElevated
                  : colors.backgroundLight,
              },
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color + '20' },
              ]}
            >
              {item.icon}
            </View>
            <Text
              style={[
                typography.subtitle,
                {
                  color: isDarkMode ? colors.textPrimary : colors.textDark,
                  marginTop: spacing.xs,
                },
              ]}
            >
              {item.value}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    width: '47%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EcoImpactCard;
