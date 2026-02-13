import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BookOpen, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { Cookbook } from '../types/cookbook';

interface CookbookCardProps {
  cookbook: Cookbook;
  onPress?: () => void;
  onRemove?: () => void;
}

const COVER_COLORS = [
  '#E8D5B7', '#2D4A3E', '#F5E6CC', '#8B4513',
  '#B22222', '#2F4F4F', '#DAA520', '#4B0082',
  '#FF6347', '#4682B4', '#6B8E23', '#CD853F',
];

const CookbookCard: React.FC<CookbookCardProps> = ({
  cookbook,
  onPress,
  onRemove,
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const coverColor =
    cookbook.coverColor ||
    COVER_COLORS[cookbook.title.length % COVER_COLORS.length];

  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }, getShadow('small')]}
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Book spine */}
        <View style={[styles.bookCover, { backgroundColor: coverColor }]}>
          <BookOpen size={20} color="#FFFFFF" />
        </View>

        <View style={styles.content}>
          <Text
            style={[typography.subtitle, { color: textColor }]}
            numberOfLines={2}
          >
            {cookbook.title}
          </Text>
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {cookbook.author}
          </Text>
          {cookbook.recipeCount && (
            <Text
              style={[
                typography.caption,
                { color: colors.textMuted, marginTop: 4, fontSize: 11 },
              ]}
            >
              ~{cookbook.recipeCount} recipes
            </Text>
          )}
        </View>

        {onRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  bookCover: {
    width: 48,
    height: 64,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default CookbookCard;
