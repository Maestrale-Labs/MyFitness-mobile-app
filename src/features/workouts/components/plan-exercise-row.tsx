import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import type { Exercise } from '@/features/exercises/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import { usePrescriptionLabel } from '../format';
import type { PlanExercise } from '../types';

type PlanExerciseRowProps = {
  index: number;
  item: PlanExercise;
  exercise: Exercise;
  last: boolean;
};

/** A row of a workout inside a card: order, thumbnail, name and prescription. */
export function PlanExerciseRow({ index, item, exercise, last }: PlanExerciseRowProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const prescriptionLabel = usePrescriptionLabel();

  return (
    <Link href={{ pathname: '/exercises/[id]', params: { id: exercise.id } }} asChild>
      <Pressable accessibilityRole="link">
        {({ pressed }) => (
          // Styles go on an inner view: `Link asChild` doesn't forward a style function on web.
          <View style={[styles.row, !last && styles.divider, pressed && styles.pressed]}>
            <Text style={styles.index}>{index + 1}</Text>
            {/* The media has a white background, so it sits on white in dark mode too. */}
            <View style={styles.thumbnailFrame}>
              <Image
                source={exercise.media.thumbnail}
                style={styles.thumbnail}
                contentFit="contain"
                transition={150}
                accessibilityIgnoresInvertColors
              />
            </View>
            <View style={styles.text}>
              <Text numberOfLines={2} style={styles.name}>
                {exercise.name[locale]}
              </Text>
              <Text style={styles.prescription}>{prescriptionLabel(item)}</Text>
            </View>
            <Icon icon={icons.chevronRight} size={18} color={theme.textSecondary} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.four,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  pressed: {
    backgroundColor: theme.background,
  },
  index: {
    width: 18,
    fontSize: 15,
    fontWeight: 700,
    color: theme.tint,
    textAlign: 'center',
  },
  thumbnailFrame: {
    width: 56,
    height: 56,
    borderRadius: Radius.small,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 500,
    color: theme.text,
  },
  prescription: {
    fontSize: 13,
    color: theme.textSecondary,
  },
}));
