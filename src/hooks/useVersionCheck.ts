import { useState, useEffect } from 'react';

const CURRENT_VERSION = '1.1.1'; // This should match package.json version
const VERSION_STORAGE_KEY = 'offer-tracker-last-seen-version';

export interface UpdateInfo {
  version: string;
  title: string;
  features: string[];
  improvements: string[];
  fixes: string[];
}

// Define what's new for each version
const VERSION_UPDATES: Record<string, UpdateInfo> = {
  '1.1.1': {
    version: '1.1.1',
    title: 'Local Timezone Update',
    features: [
      'Offers and follow-ups now record dates using your local timezone'
    ],
    improvements: [
      'Today filters and reminders match your computer\'s time'
    ],
    fixes: [
      'Fixed late-night offers counting toward the next day'
    ]
  },
  '1.1.0': {
    version: '1.1.0',
    title: 'Smart Follow-ups & Update System',
    features: [
      'Smart update notification system with beautiful "What\'s New" dialogs',
      'PWA-enhanced update notifications with service worker integration',
      'Automatic version tracking and one-time display system',
      'Enhanced PWA support with auto-refresh capabilities',
      'Update notification system works seamlessly in both Electron and PWA modes'
    ],
    improvements: [
      'Follow-up prioritization now correctly handles multiple active follow-ups',
      'When completing follow-ups, the most urgent (earliest) date is now marked complete',
      'Improved follow-up workflow ensures logical progression through dates',
      'Enhanced app stability with better component structure',
      'Streamlined development workflow with better error handling'
    ],
    fixes: [
      'Fixed critical bug where latest follow-up was marked complete instead of earliest',
      'Resolved OfferDetails component import issues causing app crashes',
      'Fixed JSX syntax errors preventing proper compilation',
      'Corrected follow-up completion logic to respect date priority',
      'Resolved module import conflicts in OfferDialog and OfferItem components'
    ]
  },
  '1.0.0': {
    version: '1.0.0',
    title: 'Welcome to Offer Tracker!',
    features: [
      'Complete offer management system',
      'Smart follow-up prioritization',
      'Interactive dashboard with drag & drop',
      'Advanced filtering and search',
      'PDF and Excel export capabilities',
      'Conversion tracking with dates',
      'Customizable notifications'
    ],
    improvements: [
      'Clean, modern interface design',
      'Responsive layout for all screen sizes',
      'Fast performance with optimized data handling'
    ],
    fixes: [
      'Initial stable release'
    ]
  }
};

export const useVersionCheck = () => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    // Small delay to ensure app is fully loaded
    const timer = setTimeout(() => {
      const lastSeenVersion = localStorage.getItem(VERSION_STORAGE_KEY);
      
      if (lastSeenVersion !== CURRENT_VERSION) {
        const currentUpdateInfo = VERSION_UPDATES[CURRENT_VERSION];
        if (currentUpdateInfo) {
          setUpdateInfo(currentUpdateInfo);
          setShowUpdateDialog(true);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const dismissUpdate = () => {
    setShowUpdateDialog(false);
    localStorage.setItem(VERSION_STORAGE_KEY, CURRENT_VERSION);
  };

  return {
    showUpdateDialog,
    updateInfo,
    dismissUpdate
  };
}; 