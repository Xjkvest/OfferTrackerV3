import { useEffect, useCallback } from 'react';

type KeyCombination = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
};

type ShortcutHandler = () => void;

type KeyboardShortcuts = Record<string, {
  combo: KeyCombination;
  handler: ShortcutHandler;
  description: string;
}>;

/**
 * Hook to handle global keyboard shortcuts
 * @param shortcuts Object with shortcut definitions
 * @param isEnabled Whether shortcuts are enabled (defaults to true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcuts,
  isEnabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Don't trigger shortcuts when typing in input elements
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        return;
      }

      Object.values(shortcuts).forEach(({ combo, handler }) => {
        const keyMatches = event.key.toLowerCase() === combo.key.toLowerCase();
        const ctrlMatches = combo.ctrlKey === undefined || event.ctrlKey === combo.ctrlKey;
        const shiftMatches = combo.shiftKey === undefined || event.shiftKey === combo.shiftKey;
        const altMatches = combo.altKey === undefined || event.altKey === combo.altKey;
        const metaMatches = combo.metaKey === undefined || event.metaKey === combo.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          handler();
        }
      });
    },
    [isEnabled, shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return all shortcuts for potential display in UI
  const getShortcutsList = useCallback(() => {
    return Object.entries(shortcuts).map(([id, { combo, description }]) => {
      const parts = [];
      if (combo.metaKey) parts.push('⌘');
      if (combo.ctrlKey) parts.push('Ctrl');
      if (combo.altKey) parts.push('Alt');
      if (combo.shiftKey) parts.push('Shift');
      parts.push(combo.key.toUpperCase());

      return {
        id,
        keys: parts.join(' + '),
        description
      };
    });
  }, [shortcuts]);

  return { getShortcutsList };
} 