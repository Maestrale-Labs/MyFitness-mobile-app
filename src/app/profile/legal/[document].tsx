import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Screen } from '@/components/screen';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { isLegalDocumentId, legalDocuments } from '@/features/legal/documents';
import { makeStyles } from '@/hooks/use-styles';
import { useLocale } from '@/i18n';

export default function LegalDocumentScreen() {
  const { document } = useLocalSearchParams<{ document: string }>();
  const styles = useStyles();
  const locale = useLocale();
  const { t } = useTranslation();

  if (!isLegalDocumentId(document)) {
    return null;
  }

  const { updatedAt, sections } = legalDocuments[document];
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(updatedAt));

  return (
    <Screen withBottomInset>
      <SubScreenHeader title={t(`profile.${document}`)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <ThemedText type="footnote" themeColor="tint">
            {t('legal.draftNotice')}
          </ThemedText>
        </View>

        {sections.map((section) => (
          <View key={section.heading.en} style={styles.section}>
            <ThemedText type="headline" accessibilityRole="header">
              {section.heading[locale]}
            </ThemedText>
            <ThemedText type="callout" themeColor="textSecondary" style={styles.paragraph}>
              {section.body[locale]}
            </ThemedText>
          </View>
        ))}

        <ThemedText type="footnote" themeColor="textSecondary">
          {t('legal.lastUpdated', { date })}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    gap: Spacing.five,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingBottom: Spacing.six,
  },
  notice: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: theme.brandSoft,
  },
  section: {
    gap: Spacing.two,
  },
  paragraph: {
    lineHeight: 22,
  },
}));
