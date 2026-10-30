import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { isLegalDocumentId, legalDocuments } from '@/features/legal/documents';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

export default function LegalDocumentScreen() {
  const { document } = useLocalSearchParams<{ document: string }>();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  if (!isLegalDocumentId(document)) {
    return null;
  }

  const { updatedAt, sections } = legalDocuments[document];
  const title = t(`profile.${document}`);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(updatedAt));

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />

      <View style={[styles.notice, { backgroundColor: theme.brandSoft }]}>
        <ThemedText type="footnote" themeColor="tint">
          {t('legal.draftNotice')}
        </ThemedText>
      </View>

      {sections.map((section) => (
        <View key={section.heading.en} style={styles.section}>
          <ThemedText type="headline" accessibilityRole="header">
            {section.heading[locale]}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{section.body[locale]}</ThemedText>
        </View>
      ))}

      <ThemedText type="footnote" themeColor="textSecondary">
        {t('legal.lastUpdated', { date })}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.five,
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  notice: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  section: {
    gap: Spacing.two,
  },
});
