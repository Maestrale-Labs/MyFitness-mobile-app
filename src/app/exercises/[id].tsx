import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SectionLabel } from '@/components/section-label';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useExercise } from '@/features/exercises/queries';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: exercise, isPending } = useExercise(id);
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

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
      icon: icons.muscleGroup,
      label: t('exerciseDetail.muscleGroup'),
      value: t(`muscleGroup.${exercise.muscleGroup}`),
    },
  ];
  const steps = exercise.steps[locale];

  return (
    <Screen withBottomInset>
      <SubScreenHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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

        <View style={styles.heading}>
          <ThemedText type="title" accessibilityRole="header">
            {exercise.name[locale]}
          </ThemedText>
          <ThemedText type="subhead" themeColor="textSecondary">
            {t(`muscleGroup.${exercise.muscleGroup}`)} · {t(`equipment.${exercise.equipment}`)}
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

        <ThemedText type="footnote" themeColor="textSecondary" style={styles.credit}>
          {t('exerciseDetail.mediaCredit', { credit: exercise.media.credit })}
        </ThemedText>
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
  mediaCard: {
    backgroundColor: '#FFFFFF',
  },
  mediaFrame: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.four,
  },
  // The source animations are 180×180 px; larger sizes get blurry.
  media: {
    width: 260,
    height: 260,
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
