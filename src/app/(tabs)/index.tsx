import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';

import { Chip } from '@/components/chip';
import { Screen } from '@/components/screen';
import { SearchField } from '@/components/search-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ExerciseRow } from '@/features/exercises/components/exercise-row';
import { useExercises } from '@/features/exercises/queries';
import { matchesQuery } from '@/features/exercises/search';
import type { BodyPart } from '@/features/exercises/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

export default function ExercisesScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const { t } = useTranslation();
  const { data: exercises = [], isPending, isError, refetch } = useExercises();
  const [query, setQuery] = useState('');
  const [bodyPart, setBodyPart] = useState<BodyPart | null>(null);

  // Only offer filters that match at least one exercise.
  const bodyParts = useMemo(
    () => [...new Set(exercises.map((exercise) => exercise.bodyPart))],
    [exercises],
  );

  const results = exercises.filter(
    (exercise) =>
      (bodyPart === null || exercise.bodyPart === bodyPart) && matchesQuery(exercise, query),
  );

  const title = (
    <ThemedText type="title" accessibilityRole="header" style={styles.title}>
      {t('exercises.title')}
    </ThemedText>
  );

  if (isPending) {
    return (
      <Screen>
        {title}
        <ActivityIndicator color={theme.tint} style={styles.loader} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        {title}
        <View style={styles.message}>
          <ThemedText type="headline">{t('exercises.errorTitle')}</ThemedText>
          <Pressable onPress={() => refetch()} accessibilityRole="button" hitSlop={8}>
            <ThemedText type="headline" themeColor="tint">
              {t('exercises.retry')}
            </ThemedText>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={results}
        keyExtractor={(exercise) => exercise.id}
        renderItem={({ item }) => <ExerciseRow exercise={item} />}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // Room for the card shadows, which the list would otherwise clip at its edges.
        style={styles.list}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            {title}
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={t('exercises.searchPlaceholder')}
              clearLabel={t('exercises.clearSearch')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chips}>
              <Chip
                label={t('exercises.filterAll')}
                selected={bodyPart === null}
                onPress={() => setBodyPart(null)}
              />
              {bodyParts.map((part) => (
                <Chip
                  key={part}
                  label={t(`bodyPart.${part}`)}
                  selected={bodyPart === part}
                  onPress={() => setBodyPart(bodyPart === part ? null : part)}
                />
              ))}
            </ScrollView>
            <ThemedText type="footnote" themeColor="textSecondary" style={styles.count}>
              {t('exercises.count', { count: results.length })}
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.message}>
            <ThemedText type="headline">{t('exercises.emptyTitle')}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centeredText}>
              {t('exercises.emptyMessage')}
            </ThemedText>
          </View>
        }
      />
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  title: {
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  loader: {
    marginTop: Spacing.six,
  },
  list: {
    marginHorizontal: -Spacing.four,
  },
  content: {
    paddingHorizontal: Spacing.four,
  },
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  // Chips run to the screen edges while scrolling, and keep room for their shadows.
  chipsScroll: {
    marginHorizontal: -Spacing.four,
  },
  chips: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
  },
  count: {
    paddingHorizontal: Spacing.one,
  },
  separator: {
    height: Spacing.two,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.seven,
  },
  centeredText: {
    textAlign: 'center',
  },
}));
