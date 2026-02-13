import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChefHat, Settings } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onSettingsPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'CulinaMind',
  subtitle,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDarkMode);
  const textColor = isDark ? colors.textPrimary : colors.textDark;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.left}>
        <View style={styles.logo}>
          <ChefHat size={22} color={colors.primary} />
        </View>
        <View>
          <Text style={[typography.h3, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {onSettingsPress && (
        <TouchableOpacity onPress={onSettingsPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Settings size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppHeader;
