import { useTranslation } from 'react-i18next';

import type { IconData } from '@/components/icon';
import { OptionListScreen } from '@/components/option-list-screen';
import { icons } from '@/constants/icons';
import { useSettings, type ThemePreference } from '@/features/settings/store';

const OPTIONS: { value: ThemePreference; icon: IconData }[] = [
  { value: 'system', icon: icons.themeSystem },
  { value: 'light', icon: icons.themeLight },
  { value: 'dark', icon: icons.themeDark },
];

export default function ThemeScreen() {
  const { t } = useTranslation();
  const theme = useSettings((state) => state.theme);
  const setTheme = useSettings((state) => state.setTheme);

  return (
    <OptionListScreen
      title={t('profile.theme')}
      options={OPTIONS.map(({ value, icon }) => ({ value, icon, label: t(`theme.${value}`) }))}
      selected={theme}
      onSelect={setTheme}
      footer={t('theme.footer')}
    />
  );
}
