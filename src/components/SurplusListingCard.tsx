import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MapPin, Clock, ArrowRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { SurplusListing } from '../types/community';
import { hapticLight } from '../utils/haptics';

interface SurplusListingCardProps {
  listing: SurplusListing;
  onPress?: (listing: SurplusListing) => void;
  onRequest?: (listingId: string) => void;
}

const SurplusListingCard: React.FC<SurplusListingCardProps> = ({
  listing,
  onPress,
  onRequest,
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now.getTime() - posted.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? colors.cardDark : colors.cardLight,
          },
          getShadow('medium'),
        ]}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          hapticLight();
          onPress?.(listing);
        }}
      >
        <View
          style={[
            styles.imagePlaceholder,
            {
              backgroundColor: isDarkMode
                ? colors.cardDarkElevated
                : colors.backgroundLight,
            },
          ]}
        >
          <Text style={styles.emoji}>🥘</Text>
          {listing.isAvailable && (
            <View style={styles.availableBadge}>
              <Text style={[typography.caption, { color: colors.white, fontFamily: 'Inter-SemiBold' }]}>
                Available
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text
            style={[
              typography.subtitle,
              {
                color: isDarkMode ? colors.textPrimary : colors.textDark,
              },
            ]}
            numberOfLines={1}
          >
            {listing.title}
          </Text>
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, marginTop: 2 },
            ]}
            numberOfLines={2}
          >
            {listing.description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginLeft: 4 },
                ]}
              >
                {listing.location}
                {listing.distance ? ` • ${listing.distance}` : ''}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.textSecondary} />
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, marginLeft: 4 },
                ]}
              >
                {getTimeAgo(listing.postedAt)}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary },
              ]}
            >
              Qty: {listing.quantity}
            </Text>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => {
                hapticLight();
                onRequest?.(listing.id);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  typography.buttonSmall,
                  { color: colors.white, marginRight: 4 },
                ]}
              >
                Request
              </Text>
              <ArrowRight size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imagePlaceholder: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 56,
  },
  availableBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  content: {
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
});

export default SurplusListingCard;
