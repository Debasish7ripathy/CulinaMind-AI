import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  WithSpringConfig,
  WithTimingConfig,
  Easing,
} from 'react-native-reanimated';

// Spring presets
export const springConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export const bouncySpring: WithSpringConfig = {
  damping: 8,
  stiffness: 180,
  mass: 0.4,
};

export const gentleSpring: WithSpringConfig = {
  damping: 20,
  stiffness: 100,
  mass: 0.8,
};

// Timing presets
export const fastTiming: WithTimingConfig = {
  duration: 200,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const mediumTiming: WithTimingConfig = {
  duration: 350,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const slowTiming: WithTimingConfig = {
  duration: 500,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

// Animation creators
export const pressAnimation = (scale: { value: number }) => {
  'worklet';
  scale.value = withSequence(
    withSpring(0.95, springConfig),
    withSpring(1, springConfig)
  );
};

export const fadeIn = (opacity: { value: number }, delay: number = 0) => {
  'worklet';
  opacity.value = withDelay(delay, withTiming(1, mediumTiming));
};

export const fadeOut = (opacity: { value: number }) => {
  'worklet';
  opacity.value = withTiming(0, fastTiming);
};

export const slideUp = (translateY: { value: number }, delay: number = 0) => {
  'worklet';
  translateY.value = withDelay(delay, withSpring(0, springConfig));
};
