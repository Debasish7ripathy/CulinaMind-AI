import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LineChart } from 'react-native-chart-kit';
import {
  TrendingUp,
  Sparkles,
  Target,
  Beef,
  Droplets,
  Flame,
  Wheat,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertTriangle,
  Calendar,
  Zap,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { useNutritionStore, DailyNutrition } from '../store/useNutritionStore';
import { useProfileStore } from '../store/useProfileStore';
import { TabScreenProps } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import CalorieProgressBar from '../components/CalorieProgressBar';
import MacroChart from '../components/MacroChart';
import AIRecommendationPanel from '../components/AIRecommendationPanel';

const screenWidth = Dimensions.get('window').width;

type ViewMode = 'daily' | 'weekly' | 'monthly';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function fmtDate(d: Date) {
  return d.toISOString().split('T')[0];
}
function weekRange(ref: Date) {
  const s = new Date(ref);
  s.setDate(ref.getDate() - ref.getDay());
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return { start: s, end: e };
}
function monthRange(ref: Date) {
  return {
    start: new Date(ref.getFullYear(), ref.getMonth(), 1),
    end: new Date(ref.getFullYear(), ref.getMonth() + 1, 0),
  };
}

// ─── Macro Card ─────────────────────────────────────────────────────
const MacroCard = ({
  icon, label, value, unit, color, bg,
}: {
  icon: React.ReactNode; label: string; value: number; unit: string; color: string; bg: string;
}) => (
  <View style={[styles.macroCard, { backgroundColor: bg }]}>
    <View style={[styles.macroIconWrap, { backgroundColor: color + '20' }]}>{icon}</View>
    <Text style={[styles.macroValue, { color }]}>{Math.round(value)}</Text>
    <Text style={styles.macroUnit}>{unit}</Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

// ─── Progress Bar ───────────────────────────────────────────────────
const ProgressRow = ({
  label, current, goal, color, unit,
}: {
  label: string; current: number; goal: number; color: string; unit: string;
}) => {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const over = current > goal;
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressValue, over && { color: colors.danger }]}>
          {Math.round(current)}{unit} / {goal}{unit}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: over ? colors.danger : color }]} />
      </View>
      <Text style={[styles.progressPct, { color: over ? colors.danger : color }]}>{pct}%</Text>
    </View>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────
const NutritionScreen = ({ navigation }: TabScreenProps<'Nutrition'>) => {
  const insets = useSafeAreaInsets();
  const isDark = useThemeStore((s) => s.isDarkMode);
  const bg = isDark ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDark ? colors.cardDark : colors.cardLight;
  const textColor = isDark ? colors.textPrimary : colors.textDark;

  const entries = useNutritionStore((s) => s.entries);
  const weeklyGoal = useNutritionStore((s) => s.weeklyGoal);
  const profile = useProfileStore();
  const dailyCalTarget = profile.profile.dailyCalorieTarget || weeklyGoal.calories;

  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [refDate, setRefDate] = useState(new Date());

  // Navigate time
  const nav = (dir: -1 | 1) => {
    const d = new Date(refDate);
    if (viewMode === 'daily') d.setDate(d.getDate() + dir);
    else if (viewMode === 'weekly') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setRefDate(d);
  };

  // Filter entries by period
  const filtered = useMemo(() => {
    if (viewMode === 'daily') {
      const ds = fmtDate(refDate);
      return entries.filter((e) => e.date === ds);
    }
    const range = viewMode === 'weekly' ? weekRange(refDate) : monthRange(refDate);
    const s = fmtDate(range.start);
    const e = fmtDate(range.end);
    return entries.filter((x) => x.date >= s && x.date <= e);
  }, [entries, viewMode, refDate]);

  // Aggregates
  const totals = useMemo(() => {
    const t = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };
    filtered.forEach((e) => {
      t.calories += e.calories; t.protein += e.protein;
      t.carbs += e.carbs; t.fat += e.fat;
      t.fiber += e.fiber; t.sodium += e.sodium;
    });
    return t;
  }, [filtered]);

  const numDays = useMemo(() => new Set(filtered.map((e) => e.date)).size || 1, [filtered]);

  const avgDaily = useMemo(() => ({
    calories: totals.calories / numDays,
    protein: totals.protein / numDays,
    carbs: totals.carbs / numDays,
    fat: totals.fat / numDays,
    fiber: totals.fiber / numDays,
    sodium: totals.sodium / numDays,
  }), [totals, numDays]);

  // Chart data
  const chartData = useMemo(() => {
    if (viewMode === 'daily') {
      const labels: string[] = []; const pts: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(refDate); d.setDate(d.getDate() - i);
        labels.push(DAY_NAMES[d.getDay()]);
        pts.push(entries.filter((e) => e.date === fmtDate(d)).reduce((s, e) => s + e.calories, 0));
      }
      return { labels, datasets: [{ data: pts.length ? pts : [0] }] };
    } else if (viewMode === 'weekly') {
      const { start } = weekRange(refDate);
      const labels: string[] = []; const pts: number[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        labels.push(DAY_NAMES[d.getDay()]);
        pts.push(entries.filter((e) => e.date === fmtDate(d)).reduce((s, e) => s + e.calories, 0));
      }
      return { labels, datasets: [{ data: pts.length ? pts : [0] }] };
    } else {
      const { start, end } = monthRange(refDate);
      const labels: string[] = []; const pts: number[] = [];
      for (let w = 0; w < 4; w++) {
        const ws = new Date(start); ws.setDate(start.getDate() + w * 7);
        const we = new Date(ws); we.setDate(ws.getDate() + 6);
        labels.push(`W${w + 1}`);
        const wsd = fmtDate(ws); const wed = fmtDate(we > end ? end : we);
        pts.push(entries.filter((e) => e.date >= wsd && e.date <= wed).reduce((s, e) => s + e.calories, 0));
      }
      return { labels, datasets: [{ data: pts.length ? pts : [0] }] };
    }
  }, [entries, viewMode, refDate]);

  // Period label
  const periodLabel = useMemo(() => {
    if (viewMode === 'daily') {
      if (fmtDate(refDate) === fmtDate(new Date())) return 'Today';
      return refDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (viewMode === 'weekly') {
      const { start, end } = weekRange(refDate);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return `${MONTH_NAMES[refDate.getMonth()]} ${refDate.getFullYear()}`;
  }, [viewMode, refDate]);

  // Goals
  const calGoal = viewMode === 'daily' ? dailyCalTarget : viewMode === 'weekly' ? dailyCalTarget * 7 : dailyCalTarget * 30;
  const proteinGoal = viewMode === 'daily' ? weeklyGoal.protein : viewMode === 'weekly' ? weeklyGoal.protein * 7 : weeklyGoal.protein * 30;
  const sodiumGoal = viewMode === 'daily' ? weeklyGoal.sodium : viewMode === 'weekly' ? weeklyGoal.sodium * 7 : weeklyGoal.sodium * 30;

  const calStatus = totals.calories <= calGoal ? 'on-track' : 'over';
  const proteinPct = Math.round((totals.protein / proteinGoal) * 100);
  const sodiumOver = totals.sodium > sodiumGoal;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <AppHeader title="Nutrition" subtitle="Monitor your intake" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* View Mode Tabs */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <View style={styles.tabRow}>
            {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setViewMode(m); setRefDate(new Date()); }}
                style={[styles.tab, viewMode === m && styles.tabActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, viewMode === m && styles.tabTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Date Navigator */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => nav(-1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeft size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRefDate(new Date())}>
            <Text style={[typography.subtitle, { color: textColor }]}>{periodLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav(1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronRight size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Calorie Summary */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)}>
          <View style={[styles.section, { backgroundColor: cardBg }, getShadow('small')]}>
            <View style={styles.summaryTop}>
              <View style={[styles.summaryIcon, { backgroundColor: calStatus === 'on-track' ? colors.secondary + '20' : colors.danger + '20' }]}>
                <Flame size={24} color={calStatus === 'on-track' ? colors.secondary : colors.danger} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {viewMode === 'daily' ? "Today's Calories" : viewMode === 'weekly' ? 'This Week' : 'This Month'}
                </Text>
                <Text style={[typography.h2, { color: textColor }]}>
                  {Math.round(totals.calories).toLocaleString()}
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}> / {calGoal.toLocaleString()} kcal</Text>
                </Text>
              </View>
              {calStatus === 'on-track' ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.secondary + '15' }]}>
                  <Award size={14} color={colors.secondary} />
                  <Text style={[styles.statusBadgeText, { color: colors.secondary }]}>On Track</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: colors.danger + '15' }]}>
                  <AlertTriangle size={14} color={colors.danger} />
                  <Text style={[styles.statusBadgeText, { color: colors.danger }]}>Over</Text>
                </View>
              )}
            </View>
            <CalorieProgressBar consumed={totals.calories} goal={calGoal} label={`${viewMode === 'daily' ? 'Daily' : viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Calories`} />
          </View>
        </Animated.View>

        {/* Macros Grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>
            Macro Breakdown
          </Text>
          <View style={styles.macrosGrid}>
            <MacroCard icon={<Beef size={18} color="#EF4444" />} label="Protein" value={viewMode === 'daily' ? totals.protein : avgDaily.protein} unit={viewMode === 'daily' ? 'g' : 'g/day'} color="#EF4444" bg={cardBg} />
            <MacroCard icon={<Wheat size={18} color="#F59E0B" />} label="Carbs" value={viewMode === 'daily' ? totals.carbs : avgDaily.carbs} unit={viewMode === 'daily' ? 'g' : 'g/day'} color="#F59E0B" bg={cardBg} />
            <MacroCard icon={<Droplets size={18} color="#3B82F6" />} label="Fat" value={viewMode === 'daily' ? totals.fat : avgDaily.fat} unit={viewMode === 'daily' ? 'g' : 'g/day'} color="#3B82F6" bg={cardBg} />
            <MacroCard icon={<Leaf size={18} color="#22C55E" />} label="Fiber" value={viewMode === 'daily' ? totals.fiber : avgDaily.fiber} unit={viewMode === 'daily' ? 'g' : 'g/day'} color="#22C55E" bg={cardBg} />
          </View>
        </Animated.View>

        {/* Macro Pie Chart */}
        <Animated.View entering={FadeInDown.delay(250).duration(300)} style={{ marginTop: spacing.sm }}>
          <MacroChart protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
        </Animated.View>

        {/* Goals Progress */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)} style={{ marginTop: spacing.md }}>
          <View style={[styles.section, { backgroundColor: cardBg }, getShadow('small')]}>
            <View style={styles.sectionHeader}>
              <Target size={18} color={colors.primary} />
              <Text style={[typography.subtitle, { color: textColor, marginLeft: 8 }]}>
                {viewMode === 'daily' ? 'Daily' : viewMode === 'weekly' ? 'Weekly' : 'Monthly'} Goals
              </Text>
            </View>
            <ProgressRow label="Protein" current={totals.protein} goal={proteinGoal} color="#EF4444" unit="g" />
            <ProgressRow label="Sodium" current={totals.sodium} goal={sodiumGoal} color={sodiumOver ? colors.danger : '#F59E0B'} unit="mg" />
          </View>
        </Animated.View>

        {/* Calorie Trend Chart */}
        <Animated.View entering={FadeInDown.delay(350).duration(300)} style={{ marginTop: spacing.md }}>
          <View style={[styles.section, { backgroundColor: cardBg }, getShadow('small')]}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color={colors.primary} />
              <Text style={[typography.subtitle, { color: textColor, marginLeft: 8 }]}>
                Calorie Trend
              </Text>
            </View>
            {chartData.datasets[0].data.some((d) => d > 0) ? (
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  color: (opacity = 1) => `rgba(249,115,22,${opacity})`,
                  labelColor: () => colors.textSecondary,
                  propsForBackgroundLines: { stroke: colors.border, strokeWidth: 0.5 },
                  propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
                  decimalPlaces: 0,
                  style: { borderRadius: 16 },
                }}
                bezier
                withInnerLines={false}
                withOuterLines={false}
                style={styles.chart}
              />
            ) : (
              <View style={styles.emptyChart}>
                <Calendar size={32} color={colors.textMuted} />
                <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: 8 }]}>No data for this period</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Daily Average (weekly / monthly) */}
        {viewMode !== 'daily' && (
          <Animated.View entering={FadeInUp.delay(400).duration(300)} style={{ marginTop: spacing.md }}>
            <View style={[styles.section, { backgroundColor: cardBg }, getShadow('small')]}>
              <View style={styles.sectionHeader}>
                <Zap size={18} color={colors.warning} />
                <Text style={[typography.subtitle, { color: textColor, marginLeft: 8 }]}>Daily Average</Text>
              </View>
              <View style={styles.avgGrid}>
                {[
                  { label: 'Calories', value: `${Math.round(avgDaily.calories)} kcal`, color: colors.primary },
                  { label: 'Protein', value: `${Math.round(avgDaily.protein)}g`, color: '#EF4444' },
                  { label: 'Carbs', value: `${Math.round(avgDaily.carbs)}g`, color: '#F59E0B' },
                  { label: 'Fat', value: `${Math.round(avgDaily.fat)}g`, color: '#3B82F6' },
                ].map((it) => (
                  <View key={it.label} style={styles.avgItem}>
                    <Text style={[styles.avgItemValue, { color: it.color }]}>{it.value}</Text>
                    <Text style={styles.avgItemLabel}>{it.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Sodium Alert */}
        {sodiumOver && (
          <Animated.View entering={FadeInUp.delay(420).duration(300)} style={{ marginTop: spacing.md }}>
            <View style={[styles.alertCard, { backgroundColor: colors.danger + '12' }]}>
              <Droplets size={18} color={colors.danger} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={[typography.label, { color: colors.danger }]}>Sodium Alert</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Your sodium intake ({Math.round(totals.sodium)}mg) exceeds the recommended limit.
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Meal Log (daily only) */}
        {viewMode === 'daily' && filtered.length > 0 && (
          <Animated.View entering={FadeInUp.delay(450).duration(300)} style={{ marginTop: spacing.md }}>
            <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>Meal Log</Text>
            {filtered.map((entry, i) => (
              <View key={`${entry.recipeName}-${i}`} style={[styles.mealItem, { backgroundColor: cardBg }, getShadow('small')]}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.body, { color: textColor, fontFamily: 'Inter-SemiBold' }]}>{entry.recipeName}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                  </Text>
                </View>
                <View style={styles.mealCalBadge}>
                  <Flame size={14} color={colors.primary} />
                  <Text style={[typography.buttonSmall, { color: colors.primary, marginLeft: 4 }]}>{entry.calories}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* AI Insights */}
        <Animated.View entering={FadeInUp.delay(500).duration(300)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.subtitle, { color: textColor, marginBottom: spacing.sm }]}>AI Insights</Text>
          <View style={[styles.insightItem, { backgroundColor: cardBg }, getShadow('small')]}>
            <Target size={16} color={colors.secondary} />
            <Text style={[typography.bodySmall, { color: textColor, marginLeft: 8, flex: 1 }]}>
              You're {Math.abs(100 - proteinPct)}% {proteinPct >= 100 ? 'over' : 'under'} your protein target. Consider adding more lean meats or legumes.
            </Text>
          </View>
          <View style={[styles.insightItem, { backgroundColor: cardBg, marginTop: spacing.sm }, getShadow('small')]}>
            <Sparkles size={16} color={colors.info} />
            <Text style={[typography.bodySmall, { color: textColor, marginLeft: 8, flex: 1 }]}>
              Average daily intake: ~{Math.round(avgDaily.calories)} kcal. {avgDaily.calories <= dailyCalTarget ? 'Keep it up! 💪' : 'Consider lighter meals.'}
            </Text>
          </View>
        </Animated.View>

        {/* AI Recommendation */}
        <Animated.View entering={FadeInUp.delay(600).duration(300)}>
          <AIRecommendationPanel
            title="Boost your fiber intake"
            description="Add spinach smoothies or chia pudding to reach your daily fiber goal."
            actionLabel="See Recipes"
            onAction={() => navigation.navigate('AskAI')}
          />
        </Animated.View>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={40} color={colors.textMuted} />
            <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
              No nutrition data for this period.{'\n'}Log meals via recipes to track!
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: 40 },
  section: { padding: spacing.md, borderRadius: borderRadius.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  chart: { marginVertical: 4, borderRadius: 16, marginLeft: -16 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardDarkElevated,
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  // Date navigator
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  // Summary
  summaryTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  summaryIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  statusBadgeText: { fontFamily: 'Inter-SemiBold', fontSize: 11 },

  // Macros grid
  macrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.sm },
  macroCard: {
    width: (screenWidth - spacing.md * 2 - 10) / 2 - 5,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  macroIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  macroValue: { fontFamily: 'Inter-Bold', fontSize: 22 },
  macroUnit: { fontFamily: 'Inter-Regular', fontSize: 12, color: colors.textSecondary, marginTop: -2 },
  macroLabel: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: colors.textSecondary, marginTop: 4 },

  // Progress
  progressRow: { marginTop: 12 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.textSecondary },
  progressValue: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: colors.textSecondary },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.cardDarkElevated, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontFamily: 'Inter-SemiBold', fontSize: 11, textAlign: 'right', marginTop: 4 },

  // Avg
  avgGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  avgItem: { alignItems: 'center' },
  avgItemValue: { fontFamily: 'Inter-Bold', fontSize: 16 },
  avgItemLabel: { fontFamily: 'Inter-Regular', fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  // Meal log
  mealItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm },
  mealCalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },

  // Alert
  alertCard: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md, borderRadius: borderRadius.lg },

  // Insight
  insightItem: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.md, borderRadius: borderRadius.lg },

  // Empty
  emptyChart: { height: 180, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
});

export default NutritionScreen;
