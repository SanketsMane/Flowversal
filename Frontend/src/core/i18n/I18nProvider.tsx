import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { en } from './messages/en';
import { es } from './messages/es';
import { I18nContextValue, Locale, Messages } from './types';

const DICTIONARIES: Record<Locale, Messages> = {
  en,
  es,
};

const DEFAULT_LOCALE: Locale = 'en';
const STORAGE_KEY = 'flowversal_language';

const I18nContext = createContext<I18nContextValue>({
  language: DEFAULT_LOCALE,
  availableLocales: Object.keys(DICTIONARIES) as Locale[],
  setLanguage: () => {},
  t: (key: string) => key,
});

function resolveInitialLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && DICTIONARIES[stored]) return stored;

    const navigatorLang = window.navigator.language?.slice(0, 2) as Locale;
    if (navigatorLang && DICTIONARIES[navigatorLang]) return navigatorLang;
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLanguageState(resolveInitialLocale());
  }, []);

  const setLanguage = (locale: Locale) => {
    if (DICTIONARIES[locale]) {
      setLanguageState(locale);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, locale);
      }
    }
  };

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = DICTIONARIES[language] || DICTIONARIES[DEFAULT_LOCALE];
      const template = dict[key] || key;
      if (!vars) return template;
      return Object.keys(vars).reduce((acc, varKey) => {
        return acc.replace(new RegExp(`{{${varKey}}}`, 'g'), String(vars[varKey]));
      }, template);
    };
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      availableLocales: Object.keys(DICTIONARIES) as Locale[],
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

