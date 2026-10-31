import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import type { Exercise } from '@/features/exercises/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

type SwapSheetProps = {
  visible: boolean;
  /** Exercises of the same muscle group, the current one excluded. */
  options: Exercise[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
};

/** Sheet to replace the current exercise, e.g. when the machine is busy. */
export function SwapSheet({ visible, options, onSelect, onClose }: SwapSheetProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <ThemedText type="headline" accessibilityRole="header" style={styles.title}>
            {t('session.swapTitle')}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            onPress={onClose}
            hitSlop={12}
            style={styles.close}>
            <Icon icon={icons.close} size={20} strokeWidth={2} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
          <ThemedText type="subhead" themeColor="textSecondary" style={styles.message}>
            {t('session.swapMessage')}
          </ThemedText>
          <Card>
            {options.map((exercise, index) => (
              <Pressable
                key={exercise.id}
                accessibilityRole="button"
                onPress={() => onSelect(exercise.id)}
                style={({ pressed }) => [
                  styles.row,
                  index < options.length - 1 && styles.divider,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.thumbnailFrame}>
                  <Image
                    source={exercise.media.thumbnail}
                    style={styles.thumbnail}
                    contentFit="contain"
                    accessibilityIgnoresInvertColors
                  />
                </View>
                <View style={styles.text}>
                  <Text style={styles.name}>{exercise.name[locale]}</Text>
                  <Text style={styles.meta}>{t(`equipment.${exercise.equipment}`)}</Text>
                </View>
                <Icon icon={icons.swap} size={20} color={theme.tint} />
              </Pressable>
            ))}
          </Card>
        </ScrollView>
      </View>
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
    justifyContent: 'center',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  close: {
    position: 'absolute',
    right: Spacing.four,
    top: Spacing.three,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  message: {
    paddingHorizontal: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    paddingRight: Spacing.four,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  pressed: {
    backgroundColor: theme.background,
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
  meta: {
    fontSize: 13,
    color: theme.textSecondary,
  },
}));
