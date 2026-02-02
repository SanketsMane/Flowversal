export type Locale = 'en' | 'es';

export type Messages = Record<string, string>;

export interface I18nContextValue {
  language: Locale;
  availableLocales: Locale[];
  setLanguage: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

