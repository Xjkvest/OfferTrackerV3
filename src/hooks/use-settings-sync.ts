import { useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';

/**
 * Hook to sync UserContext settings with ThemeContext and DOM classes
 * This ensures settings are properly applied on app load and when they change
 */
export function useSettingsSync() {
  const { settings } = useUser();
  const { setAppDensity } = useTheme();

  useEffect(() => {
    // Sync font size with DOM classes
    const fontSizeToClass = {
      small: "text-sm",
      medium: "text-base", 
      large: "text-lg"
    } as const;

    const className = fontSizeToClass[settings.fontSizePreference];
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    document.documentElement.classList.add(className);

    // Sync density with ThemeContext and DOM classes
    const densityToClass = {
      compact: "density-compact",
      comfortable: "density-comfortable",
      cozy: "density-cozy"
    } as const;

    const densityClass = densityToClass[settings.dashboardDensity];
    document.documentElement.classList.remove('density-compact', 'density-comfortable', 'density-cozy');
    document.documentElement.classList.add(densityClass);
    setAppDensity(densityClass);

  }, [settings.fontSizePreference, settings.dashboardDensity, setAppDensity]);
} 