import { createStore, get, set, del, clear } from 'idb-keyval';

// Create stores for different data types
const offerStore = createStore('offer-db', 'offers');
const userStore = createStore('user-db', 'user-settings');
const preferenceStore = createStore('preferences-db', 'app-preferences');

/**
 * Enhanced storage service that uses IndexedDB with localStorage fallback
 */
export const storageService = {
  // Offers data
  async getOffers() {
    try {
      const offers = await get('offers', offerStore);
      return offers || JSON.parse(localStorage.getItem('offers') || '[]');
    } catch (error) {
      console.error('Error getting offers from IndexedDB:', error);
      return JSON.parse(localStorage.getItem('offers') || '[]');
    }
  },

  async saveOffers(offers: any[]) {
    try {
      await set('offers', offers, offerStore);
      // Keep localStorage in sync as a fallback
      localStorage.setItem('offers', JSON.stringify(offers));
      return true;
    } catch (error) {
      console.error('Error saving offers to IndexedDB:', error);
      localStorage.setItem('offers', JSON.stringify(offers));
      return false;
    }
  },

  // User settings
  async getUserSettings() {
    try {
      const settings = await get('userSettings', userStore);
      if (settings) return settings;
      
      // Fallback to localStorage for individual settings
      const userName = localStorage.getItem('userName');
      const dailyGoal = localStorage.getItem('dailyGoal');
      const channels = localStorage.getItem('channels');
      const offerTypes = localStorage.getItem('offerTypes');
      
      return {
        userName: userName || '',
        dailyGoal: dailyGoal ? Number(dailyGoal) : 5,
        channels: channels ? JSON.parse(channels) : [],
        offerTypes: offerTypes ? JSON.parse(offerTypes) : [],
      };
    } catch (error) {
      console.error('Error getting user settings from IndexedDB:', error);
      // Fallback to default values
      return {
        userName: localStorage.getItem('userName') || '',
        dailyGoal: Number(localStorage.getItem('dailyGoal') || '5'),
        channels: JSON.parse(localStorage.getItem('channels') || '[]'),
        offerTypes: JSON.parse(localStorage.getItem('offerTypes') || '[]'),
      };
    }
  },

  async saveUserSettings(settings: any) {
    try {
      await set('userSettings', settings, userStore);
      
      // Keep localStorage in sync as a fallback
      if (settings.userName) localStorage.setItem('userName', settings.userName);
      if (settings.dailyGoal) localStorage.setItem('dailyGoal', String(settings.dailyGoal));
      if (settings.channels) localStorage.setItem('channels', JSON.stringify(settings.channels));
      if (settings.offerTypes) localStorage.setItem('offerTypes', JSON.stringify(settings.offerTypes));
      
      return true;
    } catch (error) {
      console.error('Error saving user settings to IndexedDB:', error);
      
      // Fallback to localStorage
      if (settings.userName) localStorage.setItem('userName', settings.userName);
      if (settings.dailyGoal) localStorage.setItem('dailyGoal', String(settings.dailyGoal));
      if (settings.channels) localStorage.setItem('channels', JSON.stringify(settings.channels));
      if (settings.offerTypes) localStorage.setItem('offerTypes', JSON.stringify(settings.offerTypes));
      
      return false;
    }
  },

  // App preferences
  async getThemePreference() {
    try {
      return await get('theme', preferenceStore) || localStorage.getItem('theme') || 'system';
    } catch (error) {
      console.error('Error getting theme from IndexedDB:', error);
      return localStorage.getItem('theme') || 'system';
    }
  },

  async saveThemePreference(theme: string) {
    try {
      await set('theme', theme, preferenceStore);
      localStorage.setItem('theme', theme); // Fallback
      return true;
    } catch (error) {
      console.error('Error saving theme to IndexedDB:', error);
      localStorage.setItem('theme', theme);
      return false;
    }
  },

  // Dashboard preferences
  async getDashboardPreferences() {
    try {
      const prefs = await get('dashboardPreferences', preferenceStore);
      return prefs || JSON.parse(localStorage.getItem('dashboardPreferences') || '{}');
    } catch (error) {
      console.error('Error getting dashboard preferences from IndexedDB:', error);
      return JSON.parse(localStorage.getItem('dashboardPreferences') || '{}');
    }
  },

  async saveDashboardPreferences(prefs: any) {
    try {
      await set('dashboardPreferences', prefs, preferenceStore);
      localStorage.setItem('dashboardPreferences', JSON.stringify(prefs));
      return true;
    } catch (error) {
      console.error('Error saving dashboard preferences to IndexedDB:', error);
      localStorage.setItem('dashboardPreferences', JSON.stringify(prefs));
      return false;
    }
  },

  // Clear all data (for logout or reset)
  async clearAllData() {
    try {
      await clear(offerStore);
      await clear(userStore);
      await clear(preferenceStore);
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data from IndexedDB:', error);
      localStorage.clear();
      return false;
    }
  }
}; 