import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SectionLabel } from '@/components/section-label';
import { SettingsRow } from '@/components/settings-row';
import { SwitchRow } from '@/components/switch-row';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { useSettings } from '@/features/settings/store';
import { makeStyles } from '@/hooks/use-styles';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

const AVATAR_SIZE = 56;

const themeIcons = {
  system: icons.themeSystem,
  light: icons.themeLight,
  dark: icons.themeDark,
} as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const { t } = useTranslation();
  const name = useSettings((state) => state.name.trim());
  const themePreference = useSettings((state) => state.theme);
  const languagePreference = useSettings((state) => state.language);
  const analyticsEnabled = useSettings((state) => state.analyticsEnabled);
  const setAnalyticsEnabled = useSettings((state) => state.setAnalyticsEnabled);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
        <ThemedText type="title" accessibilityRole="header" style={styles.title}>
          {t('profile.title')}
        </ThemedText>

        <Card>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/profile/name')}
            style={({ pressed }) => [styles.identity, pressed && styles.identityPressed]}>
            <View style={styles.avatar}>
              {name ? (
                <Text style={styles.avatarText}>{initials(name)}</Text>
              ) : (
                <Icon icon={icons.user} size={AVATAR_SIZE * 0.46} color={theme.tint} />
              )}
            </View>
            <Text numberOfLines={1} style={[styles.identityName, !name && styles.identityEmpty]}>
              {name || t('profile.namePlaceholderTitle')}
            </Text>
            <Icon icon={icons.chevronRight} size={18} color={theme.textSecondary} />
          </Pressable>
        </Card>

        <SectionLabel>{t('profile.sectionPreferences')}</SectionLabel>
        <Card>
          <SettingsRow
            icon={icons.name}
            label={t('profile.name')}
            value={name || undefined}
            onPress={() => router.push('/profile/name')}
          />
          <SettingsRow
            icon={icons.language}
            label={t('profile.language')}
            value={t(`language.${languagePreference}`)}
            onPress={() => router.push('/profile/language')}
          />
          <SettingsRow
            icon={themeIcons[themePreference]}
            label={t('profile.theme')}
            value={t(`theme.${themePreference}`)}
            onPress={() => router.push('/profile/theme')}
            last
          />
        </Card>

        <SectionLabel>{t('profile.sectionPrivacy')}</SectionLabel>
        <Card>
          <SwitchRow
            icon={icons.analytics}
            label={t('profile.analytics')}
            subtitle={t('profile.analyticsSubtitle')}
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            last
          />
        </Card>

        <SectionLabel>{t('profile.sectionInfo')}</SectionLabel>
        <Card>
          <SettingsRow
            icon={icons.feedback}
            label={t('profile.feedback')}
            onPress={() => router.push('/profile/feedback')}
          />
          <SettingsRow
            icon={icons.version}
            label={t('profile.version')}
            value={Constants.expoConfig?.version}
            last
          />
        </Card>

        <SectionLabel>{t('profile.sectionLegal')}</SectionLabel>
        <Card>
          <SettingsRow
            icon={icons.terms}
            label={t('profile.terms')}
            accessibilityRole="link"
            onPress={() => router.push('/profile/legal/terms')}
          />
          <SettingsRow
            icon={icons.privacy}
            label={t('profile.privacy')}
            accessibilityRole="link"
            onPress={() => router.push('/profile/legal/privacy')}
            last
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    gap: Spacing.four,
  },
  title: {
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
  },
  identityPressed: {
    backgroundColor: theme.background,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: theme.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: AVATAR_SIZE * 0.36,
    fontWeight: 700,
    color: theme.tint,
  },
  identityName: {
    flex: 1,
    fontSize: 17,
    fontWeight: 600,
    color: theme.text,
  },
  identityEmpty: {
    fontWeight: 500,
    color: theme.textSecondary,
  },
}));
