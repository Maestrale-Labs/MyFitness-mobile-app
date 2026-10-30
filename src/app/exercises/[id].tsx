import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SectionLabel } from '@/components/section-label';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { exerciseAnimations } from '@/features/exercises/animations';
import { useExercise } from '@/features/exercises/queries';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

const MEDIA_SIZE = 260;

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: exercise, isPending } = useExercise(id);
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  const [showOriginal, setShowOriginal] = useState(false);

  if (isPending || !exercise) {
    return (
      <Screen withBottomInset>
        <SubScreenHeader />
        {isPending ? (
          <ActivityIndicator color={theme.tint} style={styles.loader} />
        ) : (
          <ThemedText type="headline" style={styles.notFound}>
            {t('exercises.notFound')}
          </ThemedText>
        )}
      </Screen>
    );
  }

  const facts = [
    {
      icon: icons.targetMuscle,
      label: t('exerciseDetail.targetMuscle'),
      value: t(`muscle.${exercise.targetMuscle}`),
    },
    {
      icon: icons.secondaryMuscles,
      label: t('exerciseDetail.secondaryMuscles'),
      value: exercise.secondaryMuscles.map((muscle) => t(`muscle.${muscle}`)).join(', '),
    },
    {
      icon: icons.equipment,
      label: t('exerciseDetail.equipment'),
      value: t(`equipment.${exercise.equipment}`),
    },
    {
      icon: icons.bodyPart,
      label: t('exerciseDetail.bodyPart'),
      value: t(`bodyPart.${exercise.bodyPart}`),
    },
  ];
  const steps = exercise.steps[locale];
  const OwnAnimation = exerciseAnimations[exercise.id];
  const showsGif = !OwnAnimation || showOriginal;

  return (
    <Screen withBottomInset>
      <SubScreenHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {showsGif ? (
          // The GIF has a white background, so it sits on white in dark mode too.
          <Card style={styles.gifCard}>
            <View style={[styles.mediaFrame, styles.gifFrame]}>
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
        ) : (
          <Card>
            <View
              style={styles.mediaFrame}
              accessible
              accessibilityRole="image"
              accessibilityLabel={exercise.name[locale]}>
              <OwnAnimation size={MEDIA_SIZE} />
            </View>
          </Card>
        )}

        {/* Prototype: compare our animation with the dataset's. */}
        {OwnAnimation ? (
          <View style={styles.mediaSwitch}>
            <Chip
              label={t('exerciseDetail.animationNew')}
              selected={!showOriginal}
              onPress={() => setShowOriginal(false)}
            />
            <Chip
              label={t('exerciseDetail.animationOriginal')}
              selected={showOriginal}
              onPress={() => setShowOriginal(true)}
            />
          </View>
        ) : null}

        <View style={styles.heading}>
          <ThemedText type="title" accessibilityRole="header">
            {exercise.name[locale]}
          </ThemedText>
          <ThemedText type="subhead" themeColor="textSecondary">
            {t(`bodyPart.${exercise.bodyPart}`)} · {t(`equipment.${exercise.equipment}`)}
          </ThemedText>
        </View>

        <SectionLabel>{t('exerciseDetail.details')}</SectionLabel>
        <Card>
          {facts.map((fact, index) => (
            <View
              key={fact.label}
              style={[styles.row, index < facts.length - 1 && styles.rowDivider]}>
              <Icon icon={fact.icon} size={22} />
              <View style={styles.rowText}>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            </View>
          ))}
        </Card>

        <SectionLabel>{t('exerciseDetail.howTo')}</SectionLabel>
        <Card>
          {steps.map((step, index) => (
            <View key={index} style={[styles.row, index < steps.length - 1 && styles.rowDivider]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.rowText, styles.stepText]}>{step}</Text>
            </View>
          ))}
        </Card>

        {showsGif ? (
          <ThemedText type="footnote" themeColor="textSecondary" style={styles.credit}>
            {t('exerciseDetail.mediaCredit', { credit: exercise.media.credit })}
          </ThemedText>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  loader: {
    marginTop: Spacing.six,
  },
  notFound: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  gifCard: {
    backgroundColor: '#FFFFFF',
  },
  mediaFrame: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  gifFrame: {
    backgroundColor: '#FFFFFF',
  },
  // The source animations are 180×180 px; larger sizes get blurry.
  media: {
    width: MEDIA_SIZE,
    height: MEDIA_SIZE,
  },
  mediaSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    marginTop: -Spacing.one,
  },
  heading: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  factLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  factValue: {
    fontSize: 16,
    color: theme.text,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.tint,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.text,
  },
  credit: {
    paddingHorizontal: Spacing.one,
  },
}));
