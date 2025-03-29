
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type FontSize = 'text-sm' | 'text-base' | 'text-lg';
type AppDensity = 'density-compact' | 'density-comfortable' | 'density-cozy';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  appDensity: AppDensity;
  setAppDensity: (density: AppDensity) => void;
  showAppearancePreview: boolean;
  setShowAppearancePreview: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const savedFontSize = localStorage.getItem('fontSize') as FontSize | null;
    return savedFontSize || 'text-base';
  });

  const [appDensity, setAppDensity] = useState<AppDensity>(() => {
    const savedDensity = localStorage.getItem('appDensity') as AppDensity | null;
    return savedDensity || 'density-comfortable';
  });

  const [showAppearancePreview, setShowAppearancePreview] = useState<boolean>(() => {
    const savedPreview = localStorage.getItem('showAppearancePreview');
    return savedPreview ? JSON.parse(savedPreview) : true;
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', theme);
    
    // Update document class list
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    document.documentElement.classList.add(fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('appDensity', appDensity);
    document.documentElement.classList.remove('density-compact', 'density-comfortable', 'density-cozy');
    document.documentElement.classList.add(appDensity);
  }, [appDensity]);

  useEffect(() => {
    localStorage.setItem('showAppearancePreview', JSON.stringify(showAppearancePreview));
  }, [showAppearancePreview]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme,
      fontSize,
      setFontSize,
      appDensity,
      setAppDensity,
      showAppearancePreview,
      setShowAppearancePreview
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
