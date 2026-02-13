import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  User,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  ChevronDown,
  Scale,
  Ruler,
  Calendar,
  Target,
  Flame,
  AlertTriangle,
  X,
  Plus,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Save,
  Crown,
  CreditCard,
  Star,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { useUserStore } from '../store/useUserStore';
import { useProfileStore, DietPreference, FitnessGoal } from '../store/useProfileStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { TabScreenProps } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import Badge from '../components/Badge';
import { hapticLight, hapticMedium, hapticSuccess } from '../utils/haptics';
import { restorePurchases } from '../services/revenueCat';

const DIET_OPTIONS: DietPreference[] = [
  'No Preference', 'Vegetarian', 'Vegan', 'Keto', 'Paleo',
  'Mediterranean', 'Gluten-Free', 'High-Protein', 'Low-Carb',
];

const FITNESS_OPTIONS: FitnessGoal[] = [
  'Lose Weight', 'Maintain Weight', 'Build Muscle', 'Improve Health', 'Athletic Performance',
];

const fitnessLabels: Record<FitnessGoal, string> = {
  'Lose Weight': '🏃 Lose Weight',
  'Maintain Weight': '⚖️ Maintain Weight',
  'Build Muscle': '💪 Build Muscle',
  'Improve Health': '❤️ Improve Health',
  'Athletic Performance': '🏆 Athletic Performance',
};

const dietLabels: Record<DietPreference, string> = {
  'No Preference': '🍽️ No Preference',
  'Vegetarian': '🥕 Vegetarian',
  'Vegan': '🌱 Vegan',
  'Keto': '🥑 Keto',
  'Paleo': '🦴 Paleo',
  'Mediterranean': '🫒 Mediterranean',
  'Gluten-Free': '🌾 Gluten Free',
  'High-Protein': '💪 High Protein',
  'Low-Carb': '📉 Low Carb',
};

const ProfileScreen = ({ navigation }: TabScreenProps<'Profile'>) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, logout } = useUserStore();
  const profile = useProfileStore();

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;
  const isPro = useSubscriptionStore((s) => s.isPro);

  const [showDietPicker, setShowDietPicker] = useState(false);
  const [showFitnessPicker, setShowFitnessPicker] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  const handleAddAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !profile.profile.allergies.includes(trimmed)) {
      profile.addAllergy(trimmed);
      setNewAllergy('');
      hapticSuccess();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppHeader title="Profile" subtitle="Manage your preferences" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar & Name */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <User size={40} color={colors.primary} />
          </View>
          <Text style={[typography.h2, { color: textColor, marginTop: spacing.md }]}>
            {profile.profile.name}
          </Text>
          {isPro && (
            <View style={styles.proBadge}>
              <Crown size={12} color={colors.white} />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
            {user.email}
          </Text>
        </Animated.View>

        {/* Body Metrics */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[typography.subtitle, { color: textColor, marginHorizontal: spacing.md, marginBottom: spacing.sm }]}>
            Body Metrics
          </Text>
          <View style={[styles.metricsCard, { backgroundColor: cardBg }, getShadow('small')]}>
            <View style={styles.metricRow}>
              <Scale size={18} color={colors.info} />
              <Text style={[typography.body, { color: textColor, flex: 1, marginLeft: 10 }]}>Weight</Text>
              <TextInput
                style={[styles.metricInput, { color: textColor, backgroundColor: isDarkMode ? colors.backgroundDark : colors.borderLight }]}
                value={String(profile.profile.weight)}
                onChangeText={(v) => profile.updateProfile({ weight: Number(v) || 0 })}
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>kg</Text>
            </View>
            <View style={[styles.metricRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <Ruler size={18} color={colors.secondary} />
              <Text style={[typography.body, { color: textColor, flex: 1, marginLeft: 10 }]}>Height</Text>
              <TextInput
                style={[styles.metricInput, { color: textColor, backgroundColor: isDarkMode ? colors.backgroundDark : colors.borderLight }]}
                value={String(profile.profile.height)}
                onChangeText={(v) => profile.updateProfile({ height: Number(v) || 0 })}
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>cm</Text>
            </View>
            <View style={[styles.metricRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <Calendar size={18} color={colors.warning} />
              <Text style={[typography.body, { color: textColor, flex: 1, marginLeft: 10 }]}>Age</Text>
              <TextInput
                style={[styles.metricInput, { color: textColor, backgroundColor: isDarkMode ? colors.backgroundDark : colors.borderLight }]}
                value={String(profile.profile.age)}
                onChangeText={(v) => profile.updateProfile({ age: Number(v) || 0 })}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>yrs</Text>
            </View>
          </View>
        </Animated.View>

        {/* Calorie Target */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginTop: spacing.md }}>
          <View style={[styles.metricsCard, { backgroundColor: cardBg, marginHorizontal: spacing.md }, getShadow('small')]}>
            <View style={styles.metricRow}>
              <Flame size={18} color={colors.primary} />
              <Text style={[typography.body, { color: textColor, flex: 1, marginLeft: 10 }]}>Daily Calorie Target</Text>
              <TextInput
                style={[styles.metricInput, { color: textColor, backgroundColor: isDarkMode ? colors.backgroundDark : colors.borderLight, width: 64 }]}
                value={String(profile.profile.dailyCalorieTarget)}
                onChangeText={(v) => profile.updateProfile({ dailyCalorieTarget: Number(v) || 0 })}
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>kcal</Text>
            </View>
          </View>
        </Animated.View>

        {/* Diet Preference */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.subtitle, { color: textColor, marginHorizontal: spacing.md, marginBottom: spacing.sm }]}>
            Diet Preference
          </Text>
          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: cardBg }, getShadow('small')]}
            onPress={() => { hapticLight(); setShowDietPicker(!showDietPicker); }}
            activeOpacity={0.85}
          >
            <Text style={[typography.body, { color: textColor }]}>
              {dietLabels[profile.profile.dietPreference]}
            </Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {showDietPicker && (
            <View style={[styles.pickerList, { backgroundColor: cardBg }, getShadow('medium')]}>
              {DIET_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.pickerOption,
                    profile.profile.dietPreference === opt && { backgroundColor: colors.primary + '12' },
                  ]}
                  onPress={() => {
                    hapticLight();
                    profile.updateProfile({ dietPreference: opt });
                    setShowDietPicker(false);
                  }}
                >
                  <Text style={[typography.body, { color: profile.profile.dietPreference === opt ? colors.primary : textColor }]}>
                    {dietLabels[opt]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Fitness Goal */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.subtitle, { color: textColor, marginHorizontal: spacing.md, marginBottom: spacing.sm }]}>
            Fitness Goal
          </Text>
          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: cardBg }, getShadow('small')]}
            onPress={() => { hapticLight(); setShowFitnessPicker(!showFitnessPicker); }}
            activeOpacity={0.85}
          >
            <Text style={[typography.body, { color: textColor }]}>
              {fitnessLabels[profile.profile.fitnessGoal]}
            </Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {showFitnessPicker && (
            <View style={[styles.pickerList, { backgroundColor: cardBg }, getShadow('medium')]}>
              {FITNESS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.pickerOption,
                    profile.profile.fitnessGoal === opt && { backgroundColor: colors.primary + '12' },
                  ]}
                  onPress={() => {
                    hapticLight();
                    profile.updateProfile({ fitnessGoal: opt });
                    setShowFitnessPicker(false);
                  }}
                >
                  <Text style={[typography.body, { color: profile.profile.fitnessGoal === opt ? colors.primary : textColor }]}>
                    {fitnessLabels[opt]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Allergies */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.subtitle, { color: textColor, marginHorizontal: spacing.md, marginBottom: spacing.sm }]}>
            Allergies & Restrictions
          </Text>
          <View style={[styles.allergiesCard, { backgroundColor: cardBg }, getShadow('small')]}>
            <View style={styles.allergyTags}>
              {profile.profile.allergies.map((a) => (
                <View key={a} style={styles.allergyTag}>
                  <AlertTriangle size={12} color={colors.danger} />
                  <Text style={[typography.bodySmall, { color: colors.danger, marginLeft: 4 }]}>{a}</Text>
                  <TouchableOpacity onPress={() => { hapticLight(); profile.removeAllergy(a); }}>
                    <X size={14} color={colors.danger} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addAllergyRow}>
              <TextInput
                style={[styles.allergyInput, { color: textColor, backgroundColor: isDarkMode ? colors.backgroundDark : colors.borderLight }]}
                placeholder="Add allergy..."
                placeholderTextColor={colors.textSecondary}
                value={newAllergy}
                onChangeText={setNewAllergy}
                onSubmitEditing={handleAddAllergy}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addAllergyBtn} onPress={handleAddAllergy}>
                <Plus size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Dark Mode Toggle */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={{ marginTop: spacing.md }}>
          <View style={[styles.toggleCard, { backgroundColor: cardBg }, getShadow('small')]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                {isDarkMode ? <Moon size={20} color={colors.info} /> : <Sun size={20} color={colors.warning} />}
                <Text style={[typography.body, { color: textColor, marginLeft: spacing.sm }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={() => { hapticMedium(); toggleTheme(); }}
                trackColor={{ false: colors.borderLight, true: colors.primary + '60' }}
                thumbColor={isDarkMode ? colors.primary : colors.white}
              />
            </View>
          </View>
        </Animated.View>

        {/* Subscription / Pro */}
        <Animated.View entering={FadeInDown.delay(480).duration(400)} style={{ marginTop: spacing.md }}>
          {isPro ? (
            <View style={[styles.proCard, getShadow('small')]}>
              <View style={styles.proCardHeader}>
                <Crown size={22} color="#FFD700" />
                <Text style={[typography.subtitle, { color: colors.white, marginLeft: 8 }]}>AIF Pro Active</Text>
              </View>
              <Text style={[typography.bodySmall, { color: colors.white + '99', marginTop: 4 }]}>
                You have full access to all premium features.
              </Text>
              <TouchableOpacity
                style={styles.manageSubBtn}
                onPress={() => {
                  hapticLight();
                  navigation.getParent()?.navigate('Paywall');
                }}
                activeOpacity={0.8}
              >
                <CreditCard size={16} color={colors.white} />
                <Text style={[typography.buttonSmall, { color: colors.white, marginLeft: 6 }]}>Manage Subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.upgradeCard, getShadow('glow')]}
              onPress={() => {
                hapticMedium();
                navigation.getParent()?.navigate('Paywall');
              }}
              activeOpacity={0.85}
            >
              <View style={styles.upgradeCardLeft}>
                <View style={styles.upgradeIcon}>
                  <Star size={22} color="#FFD700" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.subtitle, { color: colors.white }]}>Upgrade to Pro</Text>
                  <Text style={[typography.caption, { color: colors.white + '90', marginTop: 2 }]}>
                    Unlock all premium features & nutrition insights
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.white + '80'} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Quick Menu */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginTop: spacing.md }}>
          <View style={[styles.menuCard, { backgroundColor: cardBg }, getShadow('small')]}>
            {[
              { icon: <Bell size={20} color={colors.textSecondary} />, label: 'Notifications', onPress: () => hapticLight() },
              { icon: <Shield size={20} color={colors.textSecondary} />, label: 'Privacy', onPress: () => hapticLight() },
              { icon: <CreditCard size={20} color={colors.textSecondary} />, label: 'Restore Purchases', onPress: async () => { hapticLight(); await restorePurchases(); } },
              { icon: <HelpCircle size={20} color={colors.textSecondary} />, label: 'Help & Support', onPress: () => hapticLight() },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                {item.icon}
                <Text style={[typography.body, { color: textColor, flex: 1, marginLeft: spacing.sm }]}>{item.label}</Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              hapticMedium();
              logout();
              navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Splash' }] });
            }}
            activeOpacity={0.7}
          >
            <LogOut size={18} color={colors.danger} />
            <Text style={[typography.button, { color: colors.danger, marginLeft: spacing.sm }]}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[typography.caption, { color: colors.textSecondary + '80', textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.xl }]}>
          CulinaMind AI v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  profileHeader: { alignItems: 'center', paddingVertical: spacing.lg },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  metricsCard: { marginHorizontal: spacing.md, borderRadius: borderRadius.xxl, overflow: 'hidden' },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  metricInput: {
    width: 52,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  pickerList: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  allergiesCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  allergyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '12',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addAllergyRow: { flexDirection: 'row', gap: 8 },
  allergyInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addAllergyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xxl,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center' },
  menuCard: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.danger + '30',
    backgroundColor: colors.danger + '08',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  proBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#1a1a2e',
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  proCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.primary + '18',
    borderWidth: 1,
    borderColor: '#FFD700' + '40',
  },
  proCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageSubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.primary,
  },
  upgradeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  upgradeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;
