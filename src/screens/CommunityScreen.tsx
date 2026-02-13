import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Share2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { TabScreenProps } from '../navigation/types';
import Header from '../components/Header';
import SurplusListingCard from '../components/SurplusListingCard';
import FloatingActionButton from '../components/FloatingActionButton';
import { SurplusListing } from '../types/community';
import { hapticLight } from '../utils/haptics';

const mockListings: SurplusListing[] = [
  {
    id: '1',
    title: 'Fresh Organic Vegetables',
    description:
      'Assorted vegetables from my garden — tomatoes, peppers, and zucchini. All freshly picked today!',
    quantity: '2 kg',
    location: 'Downtown Market',
    distance: '0.5 km',
    postedBy: 'Sarah K.',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
  },
  {
    id: '2',
    title: 'Homemade Sourdough Bread',
    description:
      'Two extra loaves of sourdough bread baked this morning. Made with organic flour.',
    quantity: '2 loaves',
    location: 'Oak Street',
    distance: '1.2 km',
    postedBy: 'Mike R.',
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
  },
  {
    id: '3',
    title: 'Rice & Pasta Surplus',
    description:
      'Moving out and have extra rice (5kg) and pasta (3 packs). All sealed and within date.',
    quantity: '5 kg + 3 packs',
    location: 'University Area',
    distance: '2.1 km',
    postedBy: 'Priya M.',
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
  },
  {
    id: '4',
    title: 'Farm Fresh Eggs',
    description: 'Free-range eggs from our backyard chickens. 2 dozen available.',
    quantity: '2 dozen',
    location: 'Meadow Lane',
    distance: '3.5 km',
    postedBy: 'Tom B.',
    postedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isAvailable: false,
  },
];

const CommunityScreen = ({ navigation }: any) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header title="Community" showProfile={false} showNotification />

      {/* Stats Bar */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(300)}
        style={styles.statsBar}
      >
        <View style={styles.statItem}>
          <Text style={[typography.subtitle, { color: colors.secondary }]}>
            12
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Near You
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[typography.subtitle, { color: colors.primary }]}>
            48
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Shared Today
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[typography.subtitle, { color: colors.info }]}>
            156
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            This Week
          </Text>
        </View>
      </Animated.View>

      {/* Listings Feed */}
      <FlatList
        data={mockListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(200 + index * 100).duration(300)}
          >
            <SurplusListingCard
              listing={item}
              onRequest={(id) => {
                hapticLight();
                // placeholder — would send request
              }}
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Share FAB */}
      <FloatingActionButton
        onPress={() => {
          hapticLight();
          // placeholder — would open share surplus flow
        }}
        icon={<Share2 size={24} color={colors.white} />}
        color={colors.secondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
});

export default CommunityScreen;
