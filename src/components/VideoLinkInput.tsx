import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Link2, Plus, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { hapticLight } from '../utils/haptics';

interface VideoLinkInputProps {
  urls: string[];
  onAddUrl: (url: string) => void;
  onRemoveUrl: (url: string) => void;
  placeholder?: string;
}

const VideoLinkInput: React.FC<VideoLinkInputProps> = ({
  urls,
  onAddUrl,
  onRemoveUrl,
  placeholder = 'Paste a recipe video or page URL...',
}) => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const [inputValue, setInputValue] = useState('');

  const cardBg = isDarkMode ? colors.cardDark : colors.cardLight;
  const inputBg = isDarkMode ? colors.cardDarkElevated : '#F1F5F9';
  const textColor = isDarkMode ? colors.textPrimary : colors.textDark;

  const isValidUrl = (text: string) => {
    return text.startsWith('http://') || text.startsWith('https://');
  };

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!isValidUrl(trimmed)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (urls.includes(trimmed)) {
      Alert.alert('Duplicate', 'This URL has already been added.');
      return;
    }

    hapticLight();
    onAddUrl(trimmed);
    setInputValue('');
  };

  return (
    <View style={styles.container}>
      {/* Input row */}
      <View style={[styles.inputRow, { backgroundColor: inputBg }]}>
        <Link2 size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.textInput, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={inputValue}
          onChangeText={setInputValue}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: inputValue.trim()
                ? colors.primary
                : colors.textMuted + '40',
            },
          ]}
          onPress={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Plus size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* URL chips */}
      {urls.length > 0 && (
        <View style={styles.chipContainer}>
          {urls.map((url, index) => {
            // Extract readable name from URL
            let displayName = '';
            try {
              const host = new URL(url).hostname.replace('www.', '');
              const path = new URL(url).pathname.split('/').filter(Boolean);
              displayName =
                path.length > 0
                  ? `${host}/${path.slice(-1)[0].substring(0, 20)}`
                  : host;
            } catch {
              displayName = url.substring(0, 30);
            }

            return (
              <View
                key={index}
                style={[styles.chip, { backgroundColor: colors.primary + '15' }]}
              >
                <Link2 size={12} color={colors.primary} />
                <Text
                  style={[styles.chipText, { color: colors.primary }]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    hapticLight();
                    onRemoveUrl(url);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    maxWidth: '100%',
  },
  chipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    maxWidth: 180,
  },
});

export default VideoLinkInput;
