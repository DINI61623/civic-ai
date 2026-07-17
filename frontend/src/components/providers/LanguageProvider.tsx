'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { translations, type SupportedLanguage } from '@/lib/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'English',
  setLanguage: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<SupportedLanguage>('English');

  // Load from localStorage on first render (instant, no flash)
  useEffect(() => {
    const saved = localStorage.getItem('civic_language') as SupportedLanguage | null;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  // Sync with user's saved profile preference when user data loads
  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata;
    const profileLang =
      meta?.farmer_profile?.language ||
      meta?.student_profile?.language ||
      meta?.language;

    if (profileLang && translations[profileLang as SupportedLanguage]) {
      const lang = profileLang as SupportedLanguage;
      setLanguageState(lang);
      localStorage.setItem('civic_language', lang);
    }
  }, [user]);

  // Apply lang attribute to <html> for accessibility / browser auto-translate hint
  useEffect(() => {
    const langMap: Record<SupportedLanguage, string> = {
      English: 'en',
      Hindi: 'hi',
      Punjabi: 'pa',
      Bengali: 'bn',
      Tamil: 'ta',
      Telugu: 'te',
      Marathi: 'mr',
    };
    document.documentElement.lang = langMap[language] || 'en';
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('civic_language', lang);
  }, []);

  /**
   * Translate a key. Falls back to the key itself if not found.
   * Usage: t('nav.home') → 'होम' (when Hindi is selected)
   */
  const t = useCallback(
    (key: string): string => {
      return translations[language]?.[key] ?? translations['English']?.[key] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
