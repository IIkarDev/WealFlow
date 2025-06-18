import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeMode } from '../types'; // Assuming types.ts is in src/types

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Get theme from local storage or default to system preference or 'light'
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme);
    
    // Also set on body for some Tailwind styles that target body.dark
    document.body.classList.remove(isDark ? 'light' : 'dark');
    document.body.classList.add(theme);
    if(isDark) {
        document.body.classList.add('bg-gray-900'); // Ensure dark background is applied
    } else {
        document.body.classList.remove('bg-gray-900');
        document.body.classList.add('bg-gray-50'); // Ensure light background
    }


    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
