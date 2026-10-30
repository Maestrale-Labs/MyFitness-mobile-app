import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import type { Exercise } from '../types';

export function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  return (
    <Card>
      <Link href={{ pathname: '/exercises/[id]', params: { id: exercise.id } }} asChild>
        <Pressable accessibilityRole="link">
          {({ pressed }) => (
            // Styles go on an inner view: `Link asChild` doesn't forward a style function on web.
            <View style={[styles.row, pressed && styles.rowPressed]}>
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
                <Text numberOfLines={1} style={styles.meta}>
                  {t(`muscleGroup.${exercise.muscleGroup}`)} ·{' '}
                  {t(`equipment.${exercise.equipment}`)}
                </Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{t(`muscle.${exercise.targetMuscle}`)}</Text>
                </View>
              </View>
              <Icon icon={icons.chevronRight} size={18} color={theme.textSecondary} />
            </View>
          )}
        </Pressable>
      </Link>
    </Card>
  );
}

const useStyles = makeStyles((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    paddingRight: Spacing.four,
  },
  rowPressed: {
    backgroundColor: theme.background,
  },
  thumbnailFrame: {
    width: 72,
    height: 72,
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
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: 500,
    color: theme.text,
  },
  meta: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  tag: {
    marginTop: Spacing.one,
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
