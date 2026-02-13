import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Mic, MicOff, X, ArrowLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getShadow } from '../theme/shadows';
import { useThemeStore } from '../store/useThemeStore';
import { RootStackScreenProps } from '../navigation/types';
import VoiceWaveAnimation from '../components/VoiceWaveAnimation';
import { hapticMedium, hapticLight } from '../utils/haptics';

const mockRecentCommands = [
  { id: '1', text: 'What can I cook with chicken and rice?', time: '2m ago' },
  { id: '2', text: 'Add 2 kg tomatoes to pantry', time: '1h ago' },
  { id: '3', text: 'Create a meal plan for this week', time: '3h ago' },
  { id: '4', text: 'Show me vegetarian recipes', time: 'Yesterday' },
];

const VoiceAssistantScreen = ({
  navigation,
}: RootStackScreenProps<'VoiceAssistant'>) => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const bg = isDarkMode ? colors.backgroundDark : colors.backgroundLight;
  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  const toggleListening = () => {
    hapticMedium();
    if (!isListening) {
      setTranscript('');
      setIsListening(true);
      // Simulate transcript
      setTimeout(() => setTranscript('What can I...'), 1000);
      setTimeout(() => setTranscript('What can I cook with...'), 2000);
      setTimeout(
        () => setTranscript('What can I cook with chicken and rice?'),
        3000
      );
      setTimeout(() => setIsListening(false), 4000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticLight();
            navigation.goBack();
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft
            size={24}
            color={isDarkMode ? colors.textPrimary : colors.textDark}
          />
        </TouchableOpacity>
        <Text style={[typography.subtitle, { color: textColor }]}>
          Voice Assistant
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Main Area */}
      <View style={styles.mainArea}>
        {/* Wave Animation */}
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.waveContainer}
        >
          <VoiceWaveAnimation isActive={isListening} size={140} />
        </Animated.View>

        {/* Mic Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <TouchableOpacity
            style={[
              styles.micButton,
              {
                backgroundColor: isListening
                  ? colors.danger
                  : colors.primary,
              },
              getShadow('glow'),
            ]}
            activeOpacity={0.8}
            onPress={toggleListening}
          >
            {isListening ? (
              <MicOff size={32} color={colors.white} />
            ) : (
              <Mic size={32} color={colors.white} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Status Text */}
        <Text
          style={[
            typography.body,
            {
              color: isListening ? colors.primary : colors.textSecondary,
              marginTop: spacing.md,
              fontFamily: 'Inter-SemiBold',
            },
          ]}
        >
          {isListening ? 'Listening...' : 'Tap to speak'}
        </Text>

        {/* Transcript */}
        {transcript ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[
              styles.transcriptContainer,
              { backgroundColor: cardBg },
            ]}
          >
            <Text style={[typography.body, { color: textColor, textAlign: 'center' }]}>
              "{transcript}"
            </Text>
          </Animated.View>
        ) : null}
      </View>

      {/* Recent Commands */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={styles.recentSection}
      >
        <Text
          style={[
            typography.subtitle,
            {
              color: textColor,
              marginBottom: spacing.md,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          Recent Commands
        </Text>
        <FlatList
          data={mockRecentCommands}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.commandItem, { backgroundColor: cardBg }]}
              activeOpacity={0.7}
              onPress={() => {
                hapticLight();
                setTranscript(item.text);
              }}
            >
              <Mic size={16} color={colors.textSecondary} />
              <View style={styles.commandContent}>
                <Text
                  style={[
                    typography.bodySmall,
                    { color: textColor },
                  ]}
                  numberOfLines={1}
                >
                  {item.text}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.time}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
        />
      </Animated.View>

      {/* Cancel Button */}
      {isListening && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.cancelButton]}
        >
          <TouchableOpacity
            style={styles.cancelTouchable}
            onPress={() => {
              hapticLight();
              setIsListening(false);
              setTranscript('');
            }}
            activeOpacity={0.7}
          >
            <X size={18} color={colors.danger} />
            <Text
              style={[
                typography.button,
                { color: colors.danger, marginLeft: 6 },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  mainArea: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  waveContainer: {
    marginBottom: spacing.lg,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptContainer: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    minWidth: 200,
  },
  recentSection: {
    flex: 1,
    paddingTop: spacing.md,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  commandContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  cancelTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.danger + '40',
    backgroundColor: colors.danger + '10',
  },
});

export default VoiceAssistantScreen;
