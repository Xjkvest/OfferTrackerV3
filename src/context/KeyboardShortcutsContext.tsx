import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsContextType {
  openOfferDialog: () => void;
  openPreferencesDialog: () => void;
  openHelpDialog: () => void;
  setOfferDialogHandler: (handler: () => void) => void;
  setPreferencesDialogHandler: (handler: () => void) => void;
  setHelpDialogHandler: (handler: () => void) => void;
  getShortcutsList: () => Array<{ id: string; keys: string; description: string }>;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const useGlobalKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (context === undefined) {
    throw new Error('useGlobalKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // Handlers that can be set by components
  const [offerDialogHandler, setOfferDialogHandler] = useState<(() => void) | null>(null);
  const [preferencesDialogHandler, setPreferencesDialogHandler] = useState<(() => void) | null>(null);
  const [helpDialogHandler, setHelpDialogHandler] = useState<(() => void) | null>(null);

  // Navigation shortcuts
  const handleGoToDashboard = () => {
    navigate('/');
  };

  const handleGoToOffers = () => {
    navigate('/offers');
  };

  const handleGoToAnalytics = () => {
    navigate('/analytics');
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  const handleGoToNotifications = () => {
    navigate('/notifications');
  };

  const handleGoToHelp = () => {
    navigate('/help');
  };

  // Dialog shortcuts
  const openOfferDialog = () => {
    if (offerDialogHandler) {
      offerDialogHandler();
    }
  };

  const openPreferencesDialog = () => {
    if (preferencesDialogHandler) {
      preferencesDialogHandler();
    }
  };

  const openHelpDialog = () => {
    if (helpDialogHandler) {
      helpDialogHandler();
    }
  };

  // Global keyboard shortcuts configuration
  const shortcuts = {
    // Offer management
    newOffer: {
      combo: { key: 'n', shiftKey: true, metaKey: true },
      handler: openOfferDialog,
      description: 'Create a new offer',
    },
    quickOffer: {
      combo: { key: 'o', shiftKey: true, metaKey: true },
      handler: openOfferDialog,
      description: 'Quick log offer',
    },
    
    // Navigation
    goToDashboard: {
      combo: { key: 'd', shiftKey: true, metaKey: true },
      handler: handleGoToDashboard,
      description: 'Go to dashboard',
    },
    goToOffers: {
      combo: { key: 'l', shiftKey: true, metaKey: true }, // L for List
      handler: handleGoToOffers,
      description: 'Go to offers list',
    },
    goToAnalytics: {
      combo: { key: 'a', shiftKey: true, metaKey: true },
      handler: handleGoToAnalytics,
      description: 'Go to analytics',
    },
    goToSettings: {
      combo: { key: 's', shiftKey: true, metaKey: true },
      handler: handleGoToSettings,
      description: 'Go to settings',
    },
    goToNotifications: {
      combo: { key: 'b', shiftKey: true, metaKey: true }, // B for Bell
      handler: handleGoToNotifications,
      description: 'Go to notifications',
    },
    goToHelp: {
      combo: { key: 'h', shiftKey: true, metaKey: true },
      handler: handleGoToHelp,
      description: 'Go to help page',
    },
    
    // Dialogs and preferences
    preferences: {
      combo: { key: ',', metaKey: true },
      handler: openPreferencesDialog,
      description: 'Open preferences',
    },
    help: {
      combo: { key: '/', shiftKey: true, metaKey: true },
      handler: openHelpDialog,
      description: 'Show keyboard shortcuts help',
    },
  };

  const { getShortcutsList } = useKeyboardShortcuts(shortcuts);

  const contextValue = {
    openOfferDialog,
    openPreferencesDialog,
    openHelpDialog,
    setOfferDialogHandler: (handler: () => void) => setOfferDialogHandler(() => handler),
    setPreferencesDialogHandler: (handler: () => void) => setPreferencesDialogHandler(() => handler),
    setHelpDialogHandler: (handler: () => void) => setHelpDialogHandler(() => handler),
    getShortcutsList,
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}; 