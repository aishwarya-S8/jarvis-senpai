import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppLanguage, SUPPORTED_LANGUAGES, speakText } from '../services/speechService';
import { Translations, getTranslations } from '../services/i18n';

interface LanguageContextType {
  currentLang: AppLanguage;
  setLanguage: (lang: AppLanguage, speakFeedback?: boolean) => void;
  t: Translations;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jarvis_senpai_language');
        if (saved === 'HI' || saved === 'KN' || saved === 'EN') {
          return saved;
        }
      } catch (e) {
        // ignore
      }
    }
    return 'EN';
  });

  const setLanguage = useCallback((lang: AppLanguage, speakFeedback: boolean = true) => {
    setCurrentLangState(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jarvis_senpai_language', lang);
      } catch (e) {
        // ignore
      }
    }

    if (speakFeedback) {
      const langNames: Record<AppLanguage, string> = {
        EN: 'English',
        HI: 'हिंदी',
        KN: 'ಕನ್ನಡ',
      };
      const textToSpeak =
        lang === 'KN'
          ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ'
          : lang === 'HI'
          ? 'भाषा बदलकर हिंदी की गई'
          : `Language switched to ${langNames[lang]}`;
      speakText(textToSpeak, lang);
    }
  }, []);

  const t = getTranslations(currentLang);

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { AppLanguage, Translations };
