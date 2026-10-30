import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';

export default function NameScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const name = useSettings((state) => state.name);
  const setName = useSettings((state) => state.setName);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <View style={[styles.field, { backgroundColor: theme.surface }]}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('profile.nameInputPlaceholder')}
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.tint}
          style={[styles.input, { color: theme.text }]}
          autoFocus
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={40}
          returnKeyType="done"
          clearButtonMode="while-editing"
          accessibilityLabel={t('profile.name')}
        />
      </View>
      <ThemedText type="footnote" themeColor="textSecondary" style={styles.footer}>
        {t('profile.nameFooter')}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  field: {
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.four,
  },
  input: {
    fontSize: 17,
    minHeight: 48,
  },
  footer: {
    paddingHorizontal: Spacing.four,
  },
});
