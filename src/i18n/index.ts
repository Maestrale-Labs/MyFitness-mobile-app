import { getLocales, useLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { useEffect } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';

import { useSettings, type LanguagePreference } from '@/features/settings/store';

import { en } from './locales/en';
import { it } from './locales/it';

export const SUPPORTED_LOCALES = ['it', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Content written in every supported language. */
export type Localized<T = string> = Record<Locale, T>;

const FALLBACK_LOCALE: Locale = 'en';

function isSupported(code: string | null | undefined): code is Locale {
  return SUPPORTED_LOCALES.includes(code as Locale);
}

/** First device language the app supports, in the user's order of preference. */
function deviceLocale(locales = getLocales()): Locale {
  return locales.map((locale) => locale.languageCode).find(isSupported) ?? FALLBACK_LOCALE;
}

function resolveLocale(preference: LanguagePreference, locales = getLocales()): Locale {
  return preference === 'system' ? deviceLocale(locales) : preference;
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
  },
  lng: deviceLocale(),
  fallbackLng: FALLBACK_LOCALE,
  interpolation: { escapeValue: false },
});

/** Keeps i18next in sync with the language preference and the device languages. Mount once. */
export function useSyncLanguagePreference() {
  const preference = useSettings((state) => state.language);
  const locales = useLocales();

  useEffect(() => {
    const locale = resolveLocale(preference, locales);
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [preference, locales]);
}

/** The locale currently used for UI strings, to pick localized content (e.g. exercise names). */
export function useLocale(): Locale {
  const { i18n: instance } = useTranslation();
  const language = instance.resolvedLanguage;
  return isSupported(language) ? language : FALLBACK_LOCALE;
}
