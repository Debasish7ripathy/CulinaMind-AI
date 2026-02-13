import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, User } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface HeaderProps {
  title?: string;
  showNotification?: boolean;
  showProfile?: boolean;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = 'CulinaMind',
  showNotification = true,
  showProfile = true,
  onNotificationPress,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor: isDarkMode
            ? colors.backgroundDark
            : colors.backgroundLight,
        },
      ]}
    >
      <Text
        style={[
          typography.h2,
          { color: isDarkMode ? colors.textPrimary : colors.textDark },
        ]}
      >
        {title}
      </Text>
      <View style={styles.actions}>
        {showNotification && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <Bell
              size={22}
              color={isDarkMode ? colors.textSecondary : colors.textMuted}
            />
          </TouchableOpacity>
        )}
        {showProfile && (
          <TouchableOpacity
            style={[
              styles.profileButton,
              {
                backgroundColor: isDarkMode
                  ? colors.cardDark
                  : colors.borderLight,
              },
            ]}
            onPress={onProfilePress}
            activeOpacity={0.7}
          >
            <User
              size={18}
              color={isDarkMode ? colors.textPrimary : colors.textDark}
            />
          </TouchableOpacity>
        )}
      </View>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.sm,
    borderRadius: 12,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
