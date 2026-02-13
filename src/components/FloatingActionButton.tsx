import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { getShadow } from '../theme/shadows';
import { hapticMedium } from '../utils/haptics';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  color?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  style,
  color = colors.primary,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle, style]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: color }, getShadow('glow')]}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          hapticMedium();
          onPress();
        }}
      >
        {icon || <Plus size={28} color={colors.white} strokeWidth={2.5} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionButton;
