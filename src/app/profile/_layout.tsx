import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { stackScreenOptions } from '@/components/stack-screen-options';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(theme)}>
      <Stack.Screen name="index" options={{ title: t('profile.title') }} />
      <Stack.Screen
        name="name"
        options={{ title: t('profile.name'), headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="theme"
        options={{ title: t('profile.theme'), headerLargeTitleEnabled: false }}
      />
      <Stack.Screen
        name="language"
        options={{ title: t('profile.language'), headerLargeTitleEnabled: false }}
      />
      <Stack.Screen name="legal/[document]" options={{ headerLargeTitleEnabled: false }} />
    </Stack>
  );
}
