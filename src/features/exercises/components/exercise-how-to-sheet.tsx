import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { SectionLabel } from '@/components/section-label';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useLocale } from '@/i18n';

import type { Exercise } from '../types';
import { ExerciseSteps } from './exercise-steps';

type ExerciseHowToSheetProps = {
  /** The exercise to explain; the sheet is shown while it's set. */
  exercise: Exercise | null;
  onClose: () => void;
};

/** Sheet with the animation and the steps of an exercise, opened during a workout. */
export function ExerciseHowToSheet({ exercise, onClose }: ExerciseHowToSheetProps) {
  const styles = useStyles();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal
      visible={exercise !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      {exercise ? (
        <View style={styles.root}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
              {exercise.name[locale]}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              onPress={onClose}
              hitSlop={12}
              style={styles.close}>
              <Icon icon={icons.close} size={20} strokeWidth={2} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + Spacing.five },
            ]}>
            {/* The animation has a white background, so it sits on white in dark mode too. */}
            <Card style={styles.mediaCard}>
              <View style={styles.mediaFrame}>
                <Image
                  source={exercise.media.gif}
                  placeholder={exercise.media.thumbnail}
                  style={styles.media}
                  contentFit="contain"
                  autoplay
                  accessibilityLabel={exercise.name[locale]}
                  accessibilityIgnoresInvertColors
                />
              </View>
            </Card>
            <Text style={styles.muscles}>
              {t(`muscle.${exercise.targetMuscle}`)} · {t(`equipment.${exercise.equipment}`)}
            </Text>
            <SectionLabel>{t('exerciseDetail.howTo')}</SectionLabel>
            <ExerciseSteps steps={exercise.steps[locale]} />
            <Text style={styles.credit}>
              {t('exerciseDetail.mediaCredit', { credit: exercise.media.credit })}
            </Text>
          </ScrollView>
        </View>
      ) : null}
    </Modal>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 600,
    color: theme.heading,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  mediaCard: {
    backgroundColor: '#FFFFFF',
  },
  mediaFrame: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.three,
  },
  // The source animations are 180×180 px; larger sizes get blurry.
  media: {
    width: 220,
    height: 220,
  },
  muscles: {
    paddingHorizontal: Spacing.one,
    fontSize: 15,
    fontWeight: 500,
    color: theme.textSecondary,
  },
  credit: {
    paddingHorizontal: Spacing.one,
    fontSize: 13,
    color: theme.textSecondary,
  },
}));
