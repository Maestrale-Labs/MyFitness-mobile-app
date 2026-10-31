import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';

import { Chip } from '@/components/chip';
import { SearchField } from '@/components/search-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

import { useExercises } from '../queries';
import { matchesQuery } from '../search';
import { muscleGroups, type MuscleGroup } from '../types';
import { ExerciseRow } from './exercise-row';

/** The exercise catalog with search and muscle-group filter, under a header that scrolls. */
export function ExerciseList({ header }: { header: ReactNode }) {
  const styles = useStyles();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const { t } = useTranslation();
  const { data: exercises = [], isPending, isError, refetch } = useExercises();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | null>(null);

  // Only offer the groups that have at least one exercise, in their fixed order.
  const groups = useMemo(
    () =>
      muscleGroups.filter((item) => exercises.some((exercise) => exercise.muscleGroup === item)),
    [exercises],
  );

  const results = exercises.filter(
    (exercise) =>
      (group === null || exercise.muscleGroup === group) && matchesQuery(exercise, query),
  );

  if (isPending || isError) {
    return (
      <View style={styles.list}>
        <View style={styles.content}>{header}</View>
        {isPending ? (
          <ActivityIndicator color={theme.tint} style={styles.loader} />
        ) : (
          <View style={styles.message}>
            <ThemedText type="headline">{t('exercises.errorTitle')}</ThemedText>
            <Pressable onPress={() => refetch()} accessibilityRole="button" hitSlop={8}>
              <ThemedText type="headline" themeColor="tint">
                {t('exercises.retry')}
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
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
          {header}
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
              selected={group === null}
              onPress={() => setGroup(null)}
            />
            {groups.map((item) => (
              <Chip
                key={item}
                label={t(`muscleGroup.${item}`)}
                selected={group === item}
                onPress={() => setGroup(group === item ? null : item)}
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
  );
}

const useStyles = makeStyles(() => ({
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
