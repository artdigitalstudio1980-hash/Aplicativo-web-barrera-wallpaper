
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
  const [locale, setLocale] = useState<Locale>('en'); // Default to English

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  };

  const changeLocale = (newLocale: Locale) => {
    console.log('Changing locale to:', newLocale);
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('preferred-locale') as Locale;
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
        setLocale(savedLocale);
      }
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
