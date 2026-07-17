'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('light');

  // Load initial theme from localStorage on client render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      setThemeState(savedTheme);
    }
  }, []);

  // Sync theme when user details load/change
  useEffect(() => {
    if (user?.user_metadata?.theme_mode) {
      const userTheme = user.user_metadata.theme_mode as Theme;
      if (userTheme === 'light' || userTheme === 'dark' || userTheme === 'system') {
        setThemeState(userTheme);
        localStorage.setItem('theme', userTheme);
      }
    }
  }, [user]);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen to system changes if system mode is active
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
