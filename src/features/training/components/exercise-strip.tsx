import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View, type ScrollViewInstance } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import type { Exercise } from '@/features/exercises/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import type { LoggedExercise } from '../types';

const ITEM_WIDTH = 84;
const THUMB = 64;

type ExerciseStripProps = {
  exercises: LoggedExercise[];
  exercisesById: Map<string, Exercise>;
  selected: number;
  onSelect: (index: number) => void;
};

/** The day's exercises in a row: done ones ticked, the selected one outlined. */
export function ExerciseStrip({
  exercises,
  exercisesById,
  selected,
  onSelect,
}: ExerciseStripProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  const scroll = useRef<ScrollViewInstance>(null);

  // Keep the selected exercise in view when the workout moves on by itself.
  useEffect(() => {
    scroll.current?.scrollTo({
      x: Math.max(0, selected * (ITEM_WIDTH + Spacing.two) - ITEM_WIDTH),
      animated: true,
    });
  }, [selected]);

  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}>
      {exercises.map((logged, index) => {
        const exercise = exercisesById.get(logged.exerciseId);
        const name = exercise?.name[locale] ?? '';
        const done = logged.status === 'done';
        const isSelected = index === selected;
        return (
          <Pressable
            key={index}
            accessibilityRole="tab"
            aria-selected={isSelected}
            accessibilityLabel={done ? t('session.exerciseDone', { name }) : name}
            onPress={() => onSelect(index)}
            style={styles.item}>
            <View style={[styles.thumbFrame, isSelected && styles.thumbSelected]}>
              {exercise ? (
                <Image
                  source={exercise.media.thumbnail}
                  style={styles.thumb}
                  contentFit="contain"
                  accessibilityIgnoresInvertColors
                />
              ) : null}
              <View style={[styles.badge, done && styles.badgeDone]}>
                {done ? (
                  <Icon icon={icons.setDone} size={12} strokeWidth={3} color={theme.onTint} />
                ) : (
                  <Text style={styles.badgeText}>{index + 1}</Text>
                )}
              </View>
            </View>
            <Text
              numberOfLines={2}
              style={[styles.name, isSelected && styles.nameSelected, done && styles.nameDone]}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const BADGE = 22;

const useStyles = makeStyles((theme) => ({
  // A horizontal ScrollView would otherwise take all the height it can.
  scroll: {
    flexGrow: 0,
  },
  content: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    gap: Spacing.one,
  },
  thumbFrame: {
    width: THUMB + 6,
    height: THUMB + 6,
    padding: 1,
    borderRadius: Radius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbSelected: {
    borderColor: theme.tint,
  },
  thumb: {
    flex: 1,
    borderRadius: Radius.small,
    // The media has a white background, so it sits on white in dark mode too.
    backgroundColor: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
    borderWidth: 2,
    borderColor: theme.background,
  },
  badgeDone: {
    backgroundColor: theme.tint,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.text,
  },
  name: {
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: theme.textSecondary,
  },
  nameSelected: {
    fontWeight: 600,
    color: theme.text,
  },
  nameDone: {
    color: theme.tint,
  },
}));
