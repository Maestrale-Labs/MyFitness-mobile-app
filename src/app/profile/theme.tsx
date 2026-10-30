import { useTranslation } from 'react-i18next';

import { OptionListScreen } from '@/components/option-list-screen';
import { useSettings, type ThemePreference } from '@/features/settings/store';

const OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export default function ThemeScreen() {
  const { t } = useTranslation();
  const theme = useSettings((state) => state.theme);
  const setTheme = useSettings((state) => state.setTheme);

  return (
    <OptionListScreen
      options={OPTIONS.map((value) => ({ value, label: t(`theme.${value}`) }))}
      selected={theme}
      onSelect={setTheme}
      footer={t('theme.footer')}
    />
  );
}
