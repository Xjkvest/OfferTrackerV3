import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showKeyboardShortcutsDialog } from '@/components/SimpleKeyboardShortcutsDialog';

interface KeyCombination {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

interface ShortcutHandlers {
  onNewOffer?: () => void;
  onPreferences?: () => void;
  onHelp?: () => void;
}

/**
 * Simple keyboard shortcuts hook that handles global shortcuts
 * without complex context dependencies
 */
export function useSimpleKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input elements
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName || ''
      );
      
      if (isTyping) return;

      const { key, metaKey, shiftKey, ctrlKey, altKey } = event;

      // Define shortcuts
      const shortcuts = [
        // Offer Management
        {
          combo: { key: 'n', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => handlers.onNewOffer?.(),
          description: 'Create new offer (⌘ Shift N)'
        },
        {
          combo: { key: 'o', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => handlers.onNewOffer?.(),
          description: 'Quick log offer (⌘ Shift O)'
        },
        
        // Navigation
        {
          combo: { key: 'd', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => navigate('/'),
          description: 'Go to dashboard (⌘ Shift D)'
        },
        {
          combo: { key: 'l', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => navigate('/offers'),
          description: 'Go to offers list (⌘ Shift L)'
        },
        {
          combo: { key: 'a', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => navigate('/analytics'),
          description: 'Go to analytics (⌘ Shift A)'
        },
        {
          combo: { key: 's', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => navigate('/settings'),
          description: 'Go to settings (⌘ Shift S)'
        },
        {
          combo: { key: 'h', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => navigate('/help'),
          description: 'Go to help page (⌘ Shift H)'
        },
        {
          combo: { key: 'b', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => navigate('/notifications'),
          description: 'Go to notifications (⌘ Shift B)'
        },
        
        // Dialogs
        {
          combo: { key: ',', metaKey: true, shiftKey: false, ctrlKey: false, altKey: false },
          action: () => handlers.onPreferences?.(),
          description: 'Open preferences (⌘ ,)'
        },
        {
          combo: { key: '/', metaKey: true, shiftKey: true, ctrlKey: false, altKey: false },
          action: () => showKeyboardShortcutsDialog(),
          description: 'Show help (⌘ Shift /)'
        },
      ];

      // Check if any shortcut matches
      for (const shortcut of shortcuts) {
        const { combo, action } = shortcut;
        
        const keyMatches = key.toLowerCase() === combo.key.toLowerCase();
        const metaMatches = combo.metaKey === metaKey;
        const shiftMatches = combo.shiftKey === shiftKey;
        const ctrlMatches = combo.ctrlKey === ctrlKey;
        const altMatches = combo.altKey === altKey;

        if (keyMatches && metaMatches && shiftMatches && ctrlMatches && altMatches) {
          event.preventDefault();
          action();
          break;
        }
      }
    };

    // Add global event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, handlers]);

  // Return available shortcuts for documentation
  return {
    shortcuts: [
      { keys: '⌘ Shift N', description: 'Create new offer' },
      { keys: '⌘ Shift O', description: 'Quick log offer' },
      { keys: '⌘ Shift D', description: 'Go to dashboard' },
      { keys: '⌘ Shift L', description: 'Go to offers list' },
      { keys: '⌘ Shift A', description: 'Go to analytics' },
      { keys: '⌘ Shift S', description: 'Go to settings' },
      { keys: '⌘ Shift H', description: 'Go to help page' },
      { keys: '⌘ Shift B', description: 'Go to notifications' },
      { keys: '⌘ ,', description: 'Open preferences' },
      { keys: '⌘ Shift /', description: 'Show help' },
    ]
  };
} 