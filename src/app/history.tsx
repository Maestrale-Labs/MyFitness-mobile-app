import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { WorkoutDetails } from '@/features/training/components/workout-details';
import { sessionTotals } from '@/features/training/format';
import { useTraining } from '@/features/training/store';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

/** Every finished workout, newest first; each opens to its details and can be deleted. */
export default function HistoryScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  const history = useTraining((state) => state.history);
  const [open, setOpen] = useState<string | null>(null);
  const sessions = [...history].reverse();

  return (
    <Screen withBottomInset>
      <SubScreenHeader title={t('history.title')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sessions.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {t('history.empty')}
          </ThemedText>
        ) : null}
        {sessions.map((session) => {
          const totals = sessionTotals(session);
          const isOpen = open === session.id;
          return (
            <Card key={session.id}>
              <Pressable
                accessibilityRole="button"
                aria-expanded={isOpen}
                onPress={() => setOpen(isOpen ? null : session.id)}
                style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
                <View style={styles.flex}>
                  <Text style={styles.date}>
                    {new Date(session.finishedAt ?? session.startedAt).toLocaleDateString(locale, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.meta}>
                    {t('session.summaryExercises', { count: totals.exercises })} ·{' '}
                    {t('session.summarySets', { count: totals.sets })}
                  </Text>
                </View>
                <View style={isOpen && styles.chevronUp}>
                  <Icon icon={icons.chevronDown} size={20} color={theme.textSecondary} />
                </View>
              </Pressable>
              {isOpen ? (
                <View style={styles.body}>
                  <WorkoutDetails session={session} />
                </View>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  pressed: {
    backgroundColor: theme.background,
  },
  date: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.text,
  },
  meta: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
}));
