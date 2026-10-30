import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { stackScreenOptions } from '@/components/stack-screen-options';
import { useTheme } from '@/hooks/use-theme';

export default function ExercisesLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack screenOptions={stackScreenOptions(theme)}>
      <Stack.Screen name="index" options={{ title: t('exercises.title') }} />
      <Stack.Screen name="exercises/[id]" options={{ headerLargeTitleEnabled: false, title: '' }} />
    </Stack>
  );
}
