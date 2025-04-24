
import { createContext, useContext, useState, useEffect } from 'react';
import { de } from '../locales/de';
import { en } from '../locales/en';

type Language = 'de' | 'en';
type TranslationKey = keyof typeof de;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const translations = {
  de,
  en
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('bookradar-language');
    return (savedLang === 'de' || savedLang === 'en') ? savedLang : 'de';
  });

  useEffect(() => {
    localStorage.setItem('bookradar-language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
