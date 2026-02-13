import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'small' | 'medium';
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.primary,
  bgColor,
  size = 'small',
}) => {
  const bg = bgColor || color + '15';
  const py = size === 'small' ? 2 : 5;
  const px = size === 'small' ? 8 : 12;

  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingVertical: py, paddingHorizontal: px }]}>
      <Text style={[size === 'small' ? typography.caption : typography.label, { color }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
});

export default Badge;
