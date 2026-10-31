import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

import type { WorkoutPlan } from '../types';

/** Level and goal of a plan, as orange pills. */
export function PlanTags({ plan }: { plan: WorkoutPlan }) {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.tags}>
      {[t('plan.level', { number: plan.level }), t(`planGoal.${plan.goal}`)].map((label) => (
        <View key={label} style={styles.tag}>
          <Text style={styles.tagText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: theme.brandSoft,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.tint,
  },
}));
