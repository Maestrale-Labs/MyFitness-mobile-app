import Constants from 'expo-constants';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ListRow, ListSection } from '@/components/list';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const name = useSettings((state) => state.name.trim());
  const themePreference = useSettings((state) => state.theme);
  const languagePreference = useSettings((state) => state.language);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}>
      <Link href="/profile/name" asChild>
        <Pressable accessibilityRole="button">
          {({ pressed }) => (
            // Styles go on an inner view: `Link asChild` doesn't forward a style function on web.
            <View
              style={[
                styles.header,
                { backgroundColor: pressed ? theme.surfaceMuted : theme.surface },
              ]}>
              <View style={[styles.avatar, { backgroundColor: theme.brand }]}>
                {name ? (
                  <ThemedText type="title2" style={styles.avatarText}>
                    {initials(name)}
                  </ThemedText>
                ) : (
                  <Icon
                    name={{ ios: 'person.fill', android: 'person' }}
                    size={30}
                    color="#FFFFFF"
                  />
                )}
              </View>
              <ThemedText
                type={name ? 'title2' : 'headline'}
                themeColor={name ? 'text' : 'tint'}
                numberOfLines={1}
                style={styles.headerName}>
                {name || t('profile.namePlaceholderTitle')}
              </ThemedText>
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

      <ListSection title={t('profile.sectionPreferences')}>
        <ListRow
          icon={{ ios: 'circle.lefthalf.filled', android: 'contrast' }}
          title={t('profile.theme')}
          value={t(`theme.${themePreference}`)}
          accessory="chevron"
          onPress={() => router.push('/profile/theme')}
        />
        <ListRow
          icon={{ ios: 'globe', android: 'language' }}
          title={t('profile.language')}
          value={t(`language.${languagePreference}`)}
          accessory="chevron"
          onPress={() => router.push('/profile/language')}
        />
      </ListSection>

      <ListSection title={t('profile.sectionInfo')}>
        <ListRow
          icon={{ ios: 'doc.text', android: 'description' }}
          title={t('profile.terms')}
          accessory="chevron"
          accessibilityRole="link"
          onPress={() => router.push('/profile/legal/terms')}
        />
        <ListRow
          icon={{ ios: 'hand.raised', android: 'privacy_tip' }}
          title={t('profile.privacy')}
          accessory="chevron"
          accessibilityRole="link"
          onPress={() => router.push('/profile/legal/privacy')}
        />
        <ListRow
          icon={{ ios: 'info.circle', android: 'info' }}
          title={t('profile.version')}
          value={Constants.expoConfig?.version}
        />
      </ListSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.seven,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radius.large,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
  },
  headerName: {
    flex: 1,
  },
});
