import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/chip';
import { SearchField } from '@/components/search-field';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ExerciseRow } from '@/features/exercises/components/exercise-row';
import { useExercises } from '@/features/exercises/queries';
import { matchesQuery } from '@/features/exercises/search';
import type { BodyPart } from '@/features/exercises/types';
import { useTheme } from '@/hooks/use-theme';

export default function ExercisesScreen() {
  const theme = useTheme();
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

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.tint} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <ThemedText type="headline">{t('exercises.errorTitle')}</ThemedText>
        <Pressable onPress={() => refetch()} accessibilityRole="button" hitSlop={8}>
          <ThemedText type="headline" themeColor="tint">
            {t('exercises.retry')}
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(exercise) => exercise.id}
      renderItem={({ item }) => <ExerciseRow exercise={item} />}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t('exercises.searchPlaceholder')}
            clearLabel={t('exercises.clearSearch')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
          <ThemedText type="footnote" themeColor="textSecondary">
            {t('exercises.count', { count: results.length })}
          </ThemedText>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <ThemedText type="headline">{t('exercises.emptyTitle')}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.emptyMessage}>
            {t('exercises.emptyMessage')}
          </ThemedText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  chips: {
    gap: Spacing.two,
  },
  separator: {
    height: Spacing.three,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.seven,
  },
  emptyMessage: {
    textAlign: 'center',
  },
});
