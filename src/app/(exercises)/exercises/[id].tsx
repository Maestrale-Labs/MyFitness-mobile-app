import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useExercise } from '@/features/exercises/queries';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: exercise, isPending } = useExercise(id);
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.tint} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.centered}>
        <ThemedText type="headline">{t('exercises.notFound')}</ThemedText>
      </View>
    );
  }

  const facts = [
    { label: t('exerciseDetail.bodyPart'), value: t(`bodyPart.${exercise.bodyPart}`) },
    { label: t('exerciseDetail.equipment'), value: t(`equipment.${exercise.equipment}`) },
    { label: t('exerciseDetail.targetMuscle'), value: t(`muscle.${exercise.targetMuscle}`) },
    {
      label: t('exerciseDetail.secondaryMuscles'),
      value: exercise.secondaryMuscles.map((muscle) => t(`muscle.${muscle}`)).join(', '),
    },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      {/* The animation has a white background, so it sits on white in dark mode too. */}
      <View style={styles.mediaCard}>
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

      <ThemedText type="title" accessibilityRole="header">
        {exercise.name[locale]}
      </ThemedText>

      <View style={[styles.factsCard, { backgroundColor: theme.surface }]}>
        {facts.map((fact, index) => (
          <View
            key={fact.label}
            style={[
              styles.fact,
              index > 0 && {
                borderTopColor: theme.separator,
                borderTopWidth: StyleSheet.hairlineWidth,
              },
            ]}>
            <ThemedText type="subhead" themeColor="textSecondary">
              {fact.label}
            </ThemedText>
            <ThemedText type="headline" style={styles.factValue}>
              {fact.value}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="title2" accessibilityRole="header">
          {t('exerciseDetail.howTo')}
        </ThemedText>
        {exercise.steps[locale].map((step, index) => (
          <View key={index} style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.brandSoft }]}>
              <ThemedText type="subhead" themeColor="tint" style={styles.stepNumberText}>
                {index + 1}
              </ThemedText>
            </View>
            <ThemedText style={styles.stepText}>{step}</ThemedText>
          </View>
        ))}
      </View>

      <ThemedText type="footnote" themeColor="textSecondary">
        {t('exerciseDetail.mediaCredit', { credit: exercise.media.credit })}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.seven,
  },
  mediaCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.extraLarge,
    paddingVertical: Spacing.four,
  },
  // The source animations are 180×180 px; larger sizes get blurry.
  media: {
    width: 260,
    height: 260,
  },
  factsCard: {
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.four,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
    paddingVertical: Spacing.three,
  },
  factValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  section: {
    gap: Spacing.four,
  },
  step: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontWeight: 700,
  },
  stepText: {
    flex: 1,
  },
});
