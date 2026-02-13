import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';

interface AIRecommendationPanelProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  title,
  description,
  actionLabel = 'View Details',
  onAction,
}) => {
  const isDark = useThemeStore((s) => s.isDarkMode);

  return (
    <View style={[styles.container, getShadow('glow')]}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Sparkles size={18} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.label, { color: colors.white + 'B0', marginBottom: 2 }]}>
            AI RECOMMENDATION
          </Text>
          <Text style={[typography.bodySmall, { color: colors.white }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.white + '99', marginTop: 2 }]} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </View>
      {onAction && (
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={[typography.buttonSmall, { color: colors.white }]}>{actionLabel}</Text>
          <ArrowRight size={14} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: 4,
  },
});

export default AIRecommendationPanel;
