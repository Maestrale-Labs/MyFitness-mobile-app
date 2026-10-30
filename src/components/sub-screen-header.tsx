import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Shadows, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

/** Header of the pushed pages: round white back button and a centered title. */
export function SubScreenHeader({ title }: { title?: string }) {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
        hitSlop={12}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
        <Icon icon={icons.back} size={22} strokeWidth={2} />
      </Pressable>
      {title ? (
        <View pointerEvents="none" style={styles.titleWrap}>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...Shadows.card,
  },
  backButtonPressed: {
    backgroundColor: theme.surfaceMuted,
  },
  titleWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 56,
    right: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 600,
    color: theme.text,
  },
}));
