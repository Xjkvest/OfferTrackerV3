import { useState, useEffect } from 'react';
import { useVersionCheck } from './useVersionCheck';

export const usePWAVersionCheck = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [swUpdateAvailable, setSWUpdateAvailable] = useState(false);
  const standardVersionCheck = useVersionCheck();

  useEffect(() => {
    // Detect if running as PWA
    const isInPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone ||
                    document.referrer.includes('android-app://');
    setIsPWA(isInPWA);

    // Register service worker update listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
          setSWUpdateAvailable(true);
        }
      });

      // Check for updates
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          setSWUpdateAvailable(true);
        });
      });
    }
  }, []);

  const refreshPWA = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update().then(() => {
          window.location.reload();
        });
      });
    }
  };

  return {
    ...standardVersionCheck,
    isPWA,
    swUpdateAvailable,
    refreshPWA,
    // Show update dialog if either version changed or SW update available
    showUpdateDialog: standardVersionCheck.showUpdateDialog || swUpdateAvailable
  };
}; 