import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import type { Exercise } from '@/features/exercises/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import type { LoggedExercise } from '../types';

type ExerciseCardProps = {
  number: number;
  logged: LoggedExercise;
  exercise: Exercise | undefined;
  /** E.g. "3 × 10–12 · 90 s rest". */
  target: string;
  expanded: boolean;
  onToggle: () => void;
  /** The sets and hints, shown when expanded. */
  children: ReactNode;
};

/**
 * One exercise of the workout, as an accordion: the header shows progress at a glance,
 * the body the sets to fill in. The animation plays only while it's open.
 */
export function ExerciseCard({
  number,
  logged,
  exercise,
  target,
  expanded,
  onToggle,
  children,
}: ExerciseCardProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  const name = exercise?.name[locale] ?? '';
  const done = logged.status === 'done';
  const setsDone = logged.sets.filter((set) => set.done).length;

  return (
    <Card style={expanded && styles.cardExpanded}>
      <Pressable
        accessibilityRole="button"
        aria-expanded={expanded}
        accessibilityLabel={done ? t('session.exerciseDone', { name }) : name}
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
        {/* The media has a white background, so it sits on white in dark mode too. */}
        <View style={[styles.mediaFrame, expanded && styles.mediaExpanded]}>
          {exercise ? (
            <Image
              source={expanded ? exercise.media.gif : exercise.media.thumbnail}
              placeholder={exercise.media.thumbnail}
              style={styles.media}
              contentFit="contain"
              autoplay
              accessibilityIgnoresInvertColors
            />
          ) : null}
        </View>
        <View style={styles.text}>
          <Text numberOfLines={expanded ? 3 : 1} style={[styles.name, done && styles.nameDone]}>
            {number}. {name}
          </Text>
          <Text style={styles.meta}>
            {expanded
              ? target
              : t('session.setsDone', { done: setsDone, total: logged.sets.length })}
          </Text>
        </View>
        {done ? (
          <View style={styles.doneBadge}>
            <Icon icon={icons.setDone} size={16} strokeWidth={2.8} color={theme.onTint} />
          </View>
        ) : (
          <View style={expanded && styles.chevronUp}>
            <Icon icon={icons.chevronDown} size={20} color={theme.textSecondary} />
          </View>
        )}
      </Pressable>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </Card>
  );
}

const THUMB = 52;
const EXPANDED = 96;
const BADGE = 28;

const useStyles = makeStyles((theme) => ({
  cardExpanded: {
    borderWidth: 2,
    borderColor: theme.tint,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  pressed: {
    backgroundColor: theme.background,
  },
  mediaFrame: {
    width: THUMB,
    height: THUMB,
    borderRadius: Radius.small,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mediaExpanded: {
    width: EXPANDED,
    height: EXPANDED,
    borderRadius: Radius.medium,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: 600,
    color: theme.text,
  },
  nameDone: {
    color: theme.tint,
  },
  meta: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.textSecondary,
  },
  doneBadge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.tint,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
}));
