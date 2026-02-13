import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { colors } from '../theme/colors';

interface VoiceWaveAnimationProps {
  isActive: boolean;
  size?: number;
  color?: string;
}

const VoiceWaveAnimation: React.FC<VoiceWaveAnimationProps> = ({
  isActive,
  size = 200,
  color = colors.primary,
}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      const createPulse = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );

      createPulse(pulse1, 0).start();
      createPulse(pulse2, 400).start();
      createPulse(pulse3, 800).start();
    } else {
      pulse1.stopAnimation();
      pulse2.stopAnimation();
      pulse3.stopAnimation();
      pulse1.setValue(0);
      pulse2.setValue(0);
      pulse3.setValue(0);
    }

    return () => {
      pulse1.stopAnimation();
      pulse2.stopAnimation();
      pulse3.stopAnimation();
    };
  }, [isActive]);

  const createPulseStyle = (anim: Animated.Value) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {isActive && (
        <>
          <Animated.View style={createPulseStyle(pulse1)} />
          <Animated.View style={createPulseStyle(pulse2)} />
          <Animated.View style={createPulseStyle(pulse3)} />
        </>
      )}
      <View
        style={[
          styles.center,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.15,
  },
});

export default VoiceWaveAnimation;
