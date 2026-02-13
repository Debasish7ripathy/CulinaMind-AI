import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Crown,
  X,
  Check,
  Sparkles,
  ChefHat,
  BarChart3,
  Bot,
  ShieldCheck,
  Zap,
  RotateCcw,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { hapticLight, hapticMedium, hapticSuccess } from '../utils/haptics';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import {
  getCurrentOffering,
  purchasePackage,
  restorePurchases,
} from '../services/revenueCat';
import type { PurchasesPackage } from 'react-native-purchases';
import type { RootStackScreenProps } from '../navigation/types';

// ─── Plan config (fallback when offerings aren't loaded) ────────────

type PlanId = 'monthly' | 'yearly' | 'lifetime';

interface PlanInfo {
  id: PlanId;
  title: string;
  price: string;
  period: string;
  badge?: string;
  savings?: string;
}

const FALLBACK_PLANS: PlanInfo[] = [
  { id: 'monthly', title: 'Monthly', price: '$4.99', period: '/month' },
  { id: 'yearly', title: 'Yearly', price: '$29.99', period: '/year', badge: 'BEST VALUE', savings: 'Save 50%' },
  { id: 'lifetime', title: 'Lifetime', price: '$79.99', period: 'one-time', badge: 'FOREVER' },
];

const FEATURES = [
  { icon: ChefHat, label: 'Unlimited AI Recipe Generation' },
  { icon: BarChart3, label: 'Advanced Nutrition Analytics' },
  { icon: Bot, label: 'Premium AI Chef Assistant' },
  { icon: Sparkles, label: 'Smart Meal Planning' },
  { icon: ShieldCheck, label: 'Priority Support' },
  { icon: Zap, label: 'Early Access to New Features' },
];

// ─── Component ──────────────────────────────────────────────────────

const PaywallScreen: React.FC<RootStackScreenProps<'Paywall'>> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const updateFromCustomerInfo = useSubscriptionStore((s) => s.updateFromCustomerInfo);

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');
  const [plans, setPlans] = useState<PlanInfo[]>(FALLBACK_PLANS);
  const [packages, setPackages] = useState<Record<string, PurchasesPackage>>({});
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Load offerings from RevenueCat
  useEffect(() => {
    (async () => {
      try {
        const offering = await getCurrentOffering();
        if (offering && offering.availablePackages.length > 0) {
          const pkgMap: Record<string, PurchasesPackage> = {};
          const loadedPlans: PlanInfo[] = [];

          for (const pkg of offering.availablePackages) {
            const id = pkg.packageType === 'MONTHLY'
              ? 'monthly'
              : pkg.packageType === 'ANNUAL'
                ? 'yearly'
                : pkg.packageType === 'LIFETIME'
                  ? 'lifetime'
                  : pkg.identifier.toLowerCase();

            pkgMap[id] = pkg;

            const fallback = FALLBACK_PLANS.find((p) => p.id === id);
            loadedPlans.push({
              id: id as PlanId,
              title: fallback?.title ?? pkg.product.title,
              price: pkg.product.priceString,
              period: id === 'monthly' ? '/month' : id === 'yearly' ? '/year' : 'one-time',
              badge: fallback?.badge,
              savings: fallback?.savings,
            });
          }

          if (loadedPlans.length > 0) {
            // Sort: monthly, yearly, lifetime
            const order: PlanId[] = ['monthly', 'yearly', 'lifetime'];
            loadedPlans.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
            setPlans(loadedPlans);
            setPackages(pkgMap);
          }
        }
      } catch (e) {
        console.log('[Paywall] Could not load offerings, using fallback UI');
      }
    })();
  }, []);

  const handlePurchase = async () => {
    const pkg = packages[selectedPlan];
    if (!pkg) {
      Alert.alert(
        'Not Available',
        'This plan is not available for purchase in the current environment. Purchases will work in production builds.',
        [{ text: 'OK' }],
      );
      return;
    }

    setLoading(true);
    hapticMedium();
    try {
      const info = await purchasePackage(pkg);
      if (info) {
        updateFromCustomerInfo(info);
        hapticSuccess();
        Alert.alert('Welcome to Pro! 🎉', 'You now have access to all premium features.', [
          { text: 'Let\'s Go!', onPress: () => navigation.goBack() },
        ]);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    hapticLight();
    try {
      const info = await restorePurchases();
      if (info) {
        updateFromCustomerInfo(info);
        const hasPro = info.entitlements.active['AIF Pro'];
        if (hasPro) {
          hapticSuccess();
          Alert.alert('Restored! 🎉', 'Your Pro subscription has been restored.', [
            { text: 'Great!', onPress: () => navigation.goBack() },
          ]);
        } else {
          Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases for this account.');
        }
      }
    } catch {
      Alert.alert('Restore Failed', 'Something went wrong. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Close button */}
      <Animated.View entering={FadeIn.delay(200)} style={styles.closeBtn}>
        <TouchableOpacity
          onPress={() => { hapticLight(); navigation.goBack(); }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.hero}>
          <LinearGradient
            colors={['#F97316', '#FB923C', '#FBBF24']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.crownCircle}
          >
            <Crown size={40} color={colors.white} />
          </LinearGradient>
          <Text style={styles.heroTitle}>Upgrade to Pro</Text>
          <Text style={styles.heroSubtitle}>
            Unlock the full power of CulinaMind AI
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.featuresCard}>
          {FEATURES.map((feat, i) => (
            <Animated.View
              key={feat.label}
              entering={FadeInDown.delay(250 + i * 60).duration(400)}
              style={styles.featureRow}
            >
              <View style={styles.featureIconWrap}>
                <feat.icon size={18} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{feat.label}</Text>
              <Check size={16} color={colors.secondary} />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Plans */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansRow}>
            {plans.map((plan) => {
              const selected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => { hapticLight(); setSelectedPlan(plan.id); }}
                  activeOpacity={0.8}
                  style={[
                    styles.planCard,
                    selected && styles.planCardSelected,
                    getShadow(selected ? 'medium' : 'small'),
                  ]}
                >
                  {plan.badge && (
                    <View style={[styles.planBadge, selected && styles.planBadgeSelected]}>
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <Text style={[styles.planTitle, selected && styles.planTitleSelected]}>
                    {plan.title}
                  </Text>
                  <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>
                    {plan.price}
                  </Text>
                  <Text style={[styles.planPeriod, selected && styles.planPeriodSelected]}>
                    {plan.period}
                  </Text>
                  {plan.savings && (
                    <Text style={styles.planSavings}>{plan.savings}</Text>
                  )}
                  {/* Selection indicator */}
                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={SlideInUp.delay(600).duration(500)}>
          <TouchableOpacity
            style={[styles.ctaButton, loading && { opacity: 0.7 }]}
            onPress={handlePurchase}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Zap size={20} color={colors.white} />
                  <Text style={styles.ctaText}>Continue</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Restore */}
        <Animated.View entering={FadeInUp.delay(700).duration(400)}>
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={restoring}
            activeOpacity={0.7}
          >
            {restoring ? (
              <ActivityIndicator color={colors.textSecondary} size="small" />
            ) : (
              <>
                <RotateCcw size={14} color={colors.textSecondary} />
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Legal */}
        <Animated.View entering={FadeIn.delay(800)}>
          <Text style={styles.legalText}>
            Payment will be charged to your App Store / Google Play account.
            Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 20,
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },

  // Features
  featuresCard: {
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.xxl,
    padding: spacing.md,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.white,
  },

  // Plans
  plansSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: colors.white,
    marginBottom: 14,
    textAlign: 'center',
  },
  plansRow: {
    flexDirection: 'row',
    gap: 10,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.xl,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.cardDarkElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  planBadgeSelected: {
    backgroundColor: colors.primary,
  },
  planBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    color: colors.white,
    letterSpacing: 0.5,
  },
  planTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 4,
  },
  planTitleSelected: {
    color: colors.primary,
  },
  planPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.white,
  },
  planPriceSelected: {
    color: colors.white,
  },
  planPeriod: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  planPeriodSelected: {
    color: colors.textSecondary,
  },
  planSavings: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: colors.secondary,
    marginTop: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  // CTA
  ctaButton: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 14,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: colors.white,
  },

  // Restore
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  restoreText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Legal
  legalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 10,
  },
});

export default PaywallScreen;
