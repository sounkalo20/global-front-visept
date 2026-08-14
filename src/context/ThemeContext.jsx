'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => null,
  toggleTheme: () => null,
});

const STORAGE_KEY = 'visept_theme';

export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Helper pour obtenir la préférence système actuelle
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Applique la classe sur <html>
  const applyTheme = useCallback((activeTheme) => {
    const root = document.documentElement;
    const isDark = activeTheme === 'dark';
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, []);

  // Initialisation côté client
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) || defaultTheme;
    setThemeState(savedTheme);

    const active = savedTheme === 'system' ? getSystemTheme() : savedTheme;
    setResolvedTheme(active);
    applyTheme(active);
    setMounted(true);
  }, [defaultTheme, getSystemTheme, applyTheme]);

  // Changement de thème explicite par l'utilisateur
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);

    const active = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(active);
    applyTheme(active);
  }, [getSystemTheme, applyTheme]);

  // Bascule rapide entre Light et Dark
  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  // Écoute des changements de préférence du système d'exploitation
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const active = getSystemTheme();
        setResolvedTheme(active);
        applyTheme(active);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getSystemTheme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
