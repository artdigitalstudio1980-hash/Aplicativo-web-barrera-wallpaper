
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Locale, type TranslationKey } from '@/lib/translations';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en'); // Default to English for Miami-based company

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || translations.es[key] || key;
  };

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale') as Locale;
      const validLocale = savedLocale === 'es' || savedLocale === 'en' ? savedLocale : 'en';
      setLocale(validLocale);
      document.documentElement.lang = validLocale;
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
