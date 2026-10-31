import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { ExerciseList } from '@/features/exercises/components/exercise-list';
import { PlanList } from '@/features/workouts/components/plan-list';
import { makeStyles } from '@/hooks/use-styles';

type LibraryView = 'plans' | 'exercises';

/** The library: plans first (levels of the path), then every exercise. */
export default function LibraryScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  // Kept in the URL, so Home can open the plans directly.
  const { view: viewParam } = useLocalSearchParams<{ view?: LibraryView }>();
  const view: LibraryView = viewParam === 'exercises' ? 'exercises' : 'plans';

  const header = (
    <View style={styles.header}>
      <ThemedText type="title" accessibilityRole="header" style={styles.title}>
        {t('exercises.title')}
      </ThemedText>
      <SegmentedControl
        options={[
          { value: 'plans', label: t('library.plans') },
          { value: 'exercises', label: t('library.exercises') },
        ]}
        selected={view}
        onSelect={(value) => router.setParams({ view: value })}
      />
    </View>
  );

  return (
    <Screen>
      {view === 'plans' ? <PlanList header={header} /> : <ExerciseList header={header} />}
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  header: {
    gap: Spacing.three,
    paddingBottom: Spacing.one,
  },
  title: {
    marginTop: Spacing.four,
  },
}));
