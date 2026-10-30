import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SectionLabel } from '@/components/section-label';
import { SettingsRow } from '@/components/settings-row';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import {
  FEEDBACK_MAX_LENGTH,
  FEEDBACK_MIN_LENGTH,
  feedbackCategories,
  sendFeedback,
  type FeedbackCategory,
} from '@/features/feedback/api';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

const categoryIcons = {
  bug: icons.feedbackBug,
  feature: icons.feedbackFeature,
  idea: icons.feedbackIdea,
  other: icons.feedbackOther,
} as const;

export default function FeedbackScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState('');
  const send = useMutation({
    mutationFn: () => sendFeedback(category!, message),
  });

  const length = message.trim().length;
  const canSend = category !== null && length >= FEEDBACK_MIN_LENGTH && !send.isPending;

  if (send.isSuccess) {
    return (
      <Screen withBottomInset>
        <SubScreenHeader title={t('feedback.title')} />
        <View style={styles.thanks}>
          <View style={styles.thanksIcon}>
            <Icon icon={icons.checked} size={36} color={theme.tint} strokeWidth={2} />
          </View>
          <ThemedText type="title" style={styles.centered}>
            {t('feedback.thanksTitle')}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centered}>
            {t('feedback.thanksMessage')}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>{t('feedback.done')}</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen withBottomInset>
      <SubScreenHeader title={t('feedback.title')} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <SectionLabel>{t('feedback.categoryLabel')}</SectionLabel>
        <Card>
          {feedbackCategories.map((item, index) => (
            <SettingsRow
              key={item}
              icon={categoryIcons[item]}
              label={t(`feedbackCategory.${item}`)}
              selected={item === category}
              onPress={() => setCategory(item)}
              last={index === feedbackCategories.length - 1}
            />
          ))}
        </Card>

        <SectionLabel>{t('feedback.messageLabel')}</SectionLabel>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={t('feedback.messagePlaceholder')}
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.tint}
          style={styles.input}
          multiline
          textAlignVertical="top"
          maxLength={FEEDBACK_MAX_LENGTH}
          accessibilityLabel={t('feedback.messageLabel')}
        />
        <View style={styles.hints}>
          <ThemedText
            type="footnote"
            themeColor={length >= FEEDBACK_MIN_LENGTH ? 'textSecondary' : 'tint'}>
            {t('feedback.minLength', { count: FEEDBACK_MIN_LENGTH })}
          </ThemedText>
          <ThemedText type="footnote" themeColor="textSecondary">
            {length}/{FEEDBACK_MAX_LENGTH}
          </ThemedText>
        </View>

        {send.isError ? (
          <ThemedText type="subhead" themeColor="tint" style={styles.hintText}>
            {t('feedback.error')}
          </ThemedText>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSend}
          aria-disabled={!canSend}
          onPress={() => send.mutate()}
          style={({ pressed }) => [
            styles.button,
            !canSend && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}>
          {send.isPending ? <ActivityIndicator color={theme.onTint} /> : null}
          <Text style={styles.buttonText}>
            {send.isPending ? t('feedback.sending') : t('feedback.send')}
          </Text>
        </Pressable>

        <ThemedText type="footnote" themeColor="textSecondary" style={styles.hintText}>
          {t('feedback.footer')}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  input: {
    minHeight: 150,
    borderRadius: Radius.large,
    backgroundColor: theme.surface,
    padding: Spacing.four,
    fontSize: 16,
    lineHeight: 22,
    color: theme.text,
    ...Shadows.card,
  },
  hints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.one,
    marginTop: -Spacing.two,
  },
  hintText: {
    paddingHorizontal: Spacing.one,
  },
  button: {
    height: 52,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: theme.tint,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 600,
    color: theme.onTint,
  },
  thanks: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: Spacing.three,
    paddingBottom: Spacing.seven,
  },
  thanksIcon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  centered: {
    textAlign: 'center',
  },
}));
