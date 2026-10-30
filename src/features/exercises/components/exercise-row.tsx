import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import type { Exercise } from '../types';

export function ExerciseRow({ exercise }: { exercise: Exercise }) {
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  return (
    <Link href={{ pathname: '/exercises/[id]', params: { id: exercise.id } }} asChild>
      <Pressable accessibilityRole="link">
        {({ pressed }) => (
          // Styles go on an inner view: `Link asChild` doesn't forward a style function on web.
          <View
            style={[styles.row, { backgroundColor: pressed ? theme.surfaceMuted : theme.surface }]}>
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
              <ThemedText type="headline" numberOfLines={2}>
                {exercise.name[locale]}
              </ThemedText>
              <ThemedText type="subhead" themeColor="textSecondary" numberOfLines={1}>
                {t(`bodyPart.${exercise.bodyPart}`)} · {t(`equipment.${exercise.equipment}`)}
              </ThemedText>
              <View style={[styles.tag, { backgroundColor: theme.brandSoft }]}>
                <ThemedText type="caption" themeColor="tint" style={styles.tagText}>
                  {t(`muscle.${exercise.targetMuscle}`)}
                </ThemedText>
              </View>
            </View>
            <Icon
              name={{ ios: 'chevron.right', android: 'chevron_right' }}
              size={14}
              weight="semibold"
              color={theme.textSecondary}
            />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.three,
    paddingRight: Spacing.four,
    borderRadius: Radius.large,
  },
  thumbnailFrame: {
    width: 76,
    height: 76,
    borderRadius: Radius.medium,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  text: {
    flex: 1,
    gap: Spacing.half,
    alignItems: 'flex-start',
  },
  tag: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  tagText: {
    fontWeight: 600,
  },
});
