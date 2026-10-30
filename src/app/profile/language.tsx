import { useTranslation } from 'react-i18next';

import { OptionListScreen } from '@/components/option-list-screen';
import { useSettings, type LanguagePreference } from '@/features/settings/store';

const OPTIONS: LanguagePreference[] = ['system', 'it', 'en'];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const language = useSettings((state) => state.language);
  const setLanguage = useSettings((state) => state.setLanguage);

  return (
    <OptionListScreen
      options={OPTIONS.map((value) => ({ value, label: t(`language.${value}`) }))}
      selected={language}
      onSelect={setLanguage}
      footer={t('language.footer')}
    />
  );
}
