import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, Calendar, ChevronDown } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { usePantryStore } from '../store/usePantryStore';
import { RootStackScreenProps } from '../navigation/types';
import { IngredientCategory, UnitType } from '../types/ingredient';
import { hapticSuccess, hapticLight } from '../utils/haptics';

interface FormData {
  name: string;
  quantity: string;
  unit: UnitType;
  category: IngredientCategory;
  expiryDate: string;
}

const units: UnitType[] = ['kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'pieces', 'dozen', 'bunch'];
const categories: IngredientCategory[] = [
  'Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains',
  'Spices', 'Beverages', 'Snacks', 'Frozen', 'Other',
];

const AddIngredientScreen = ({
  navigation,
}: RootStackScreenProps<'AddIngredient'>) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const addIngredient = usePantryStore((s) => s.addIngredient);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;
  const inputBg = isDarkMode ? colors.cardDarkElevated : colors.borderLight;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      quantity: '',
      unit: 'pieces',
      category: 'Vegetables',
      expiryDate: '',
    },
  });

  const selectedUnit = watch('unit');
  const selectedCategory = watch('category');

  const onSubmit = (data: FormData) => {
    hapticSuccess();
    addIngredient({
      id: Date.now().toString(),
      name: data.name,
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      expiryDate: data.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: data.category,
      isSurplus: false,
      addedAt: new Date().toISOString().split('T')[0],
    });
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticLight();
            navigation.goBack();
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[typography.subtitle, { color: textColor }]}>
          Add Ingredient
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name Input */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={[typography.label, styles.label, { color: colors.textSecondary }]}>
            INGREDIENT NAME
          </Text>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: textColor,
                    borderColor: errors.name ? colors.danger : 'transparent',
                    borderWidth: errors.name ? 1 : 0,
                  },
                ]}
                placeholder="e.g., Tomatoes"
                placeholderTextColor={colors.textSecondary}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
              />
            )}
          />
          {errors.name && (
            <Text style={[typography.caption, { color: colors.danger, marginTop: 4 }]}>
              {errors.name.message}
            </Text>
          )}
        </Animated.View>

        {/* Quantity + Unit Row */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[typography.label, styles.label, { color: colors.textSecondary }]}>
              QUANTITY
            </Text>
            <Controller
              control={control}
              name="quantity"
              rules={{ required: 'Required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textColor,
                      borderColor: errors.quantity ? colors.danger : 'transparent',
                      borderWidth: errors.quantity ? 1 : 0,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={[typography.label, styles.label, { color: colors.textSecondary }]}>
              UNIT
            </Text>
            <TouchableOpacity
              style={[styles.picker, { backgroundColor: inputBg }]}
              onPress={() => setShowUnitPicker(!showUnitPicker)}
              activeOpacity={0.7}
            >
              <Text style={[typography.body, { color: textColor }]}>
                {selectedUnit}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Unit Picker Dropdown */}
        {showUnitPicker && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={[styles.dropdown, { backgroundColor: cardBg }, getShadow('medium')]}
          >
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.dropdownItem,
                    selectedUnit === unit && {
                      backgroundColor: colors.primary + '15',
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setValue('unit', unit);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color: selectedUnit === unit ? colors.primary : textColor,
                      },
                    ]}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Expiry Date */}
        <Animated.View entering={FadeInDown.delay(300).duration(300)}>
          <Text style={[typography.label, styles.label, { color: colors.textSecondary }]}>
            EXPIRY DATE
          </Text>
          <Controller
            control={control}
            name="expiryDate"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.input, styles.dateInput, { backgroundColor: inputBg }]}>
                <Calendar size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.dateTextInput, { color: textColor }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
        </Animated.View>

        {/* Category Selector */}
        <Animated.View entering={FadeInDown.delay(400).duration(300)}>
          <Text style={[typography.label, styles.label, { color: colors.textSecondary }]}>
            CATEGORY
          </Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: inputBg }]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            activeOpacity={0.7}
          >
            <Text style={[typography.body, { color: textColor }]}>
              {selectedCategory}
            </Text>
            <ChevronDown size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {showCategoryPicker && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={[styles.dropdown, { backgroundColor: cardBg }, getShadow('medium')]}
          >
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.dropdownItem,
                    selectedCategory === cat && {
                      backgroundColor: colors.primary + '15',
                    },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setValue('category', cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color:
                          selectedCategory === cat ? colors.primary : textColor,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(500).duration(300)}>
          <TouchableOpacity
            style={[styles.saveButton, getShadow('glow')]}
            activeOpacity={0.8}
            onPress={handleSubmit(onSubmit)}
          >
            <Save size={20} color={colors.white} />
            <Text style={[typography.button, { color: colors.white, marginLeft: 8 }]}>
              Save Ingredient
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  label: {
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    letterSpacing: 1,
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
  },
  dropdown: {
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 22,
    marginTop: spacing.xxl,
  },
});

export default AddIngredientScreen;
