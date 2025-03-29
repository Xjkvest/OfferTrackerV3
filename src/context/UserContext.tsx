import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  offerId?: string;
  timestamp: number;
  read: boolean;
  isOverdue?: boolean;
  isUrgent?: boolean;
}

// Settings related interfaces
export interface UserSettings {
  greetingStyle: "auto" | "fixed" | "none";
  offersConvertedByDefault: boolean;
  defaultFollowupTime: "24" | "48" | "72" | "168";
  enableFollowupNudges: boolean;
  showQuickLogOffer: boolean;
  showOfferStreaks: boolean;
  showMotivationalMessages: boolean;
  fontSizePreference: "small" | "medium" | "large";
  dashboardDensity: "cozy" | "comfortable" | "compact";
}

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  channels: string[];
  setChannels: (channels: string[]) => void;
  offerTypes: string[];
  setOfferTypes: (types: string[]) => void;
  resetAppData: () => void;
  baseOfferLink: string;
  setBaseOfferLink: (url: string) => void;
  dailyGoal: number;
  setDailyGoal: (goal: number) => void;
  dashboardElements: string[];
  setDashboardElements: (elements: string[]) => void;
  dashboardElementsOrder: string[];
  setDashboardElementsOrder: (order: string[]) => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const initialChannels = ['Follow-up', 'Email', 'Chat'];
const initialOfferTypes = ['Email Campaigns', 'Google Workspace', 'Website Upgrade', 'Second Domain', 'Payments'];
const initialDashboardElements = ['progress', 'newOfferForm', 'metrics', 'followups', 'recentOffers', 'analytics'];
const initialDashboardOrder = ['followups', 'progress', 'metrics', 'recentOffers', 'analytics'];
const initialSettings: UserSettings = {
  greetingStyle: "auto",
  offersConvertedByDefault: false,
  defaultFollowupTime: "72", // Changed from "24" to "72" (3 days)
  enableFollowupNudges: true,
  showQuickLogOffer: true,
  showOfferStreaks: true,
  showMotivationalMessages: true,
  fontSizePreference: "medium",
  dashboardDensity: "comfortable"
};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userName, setUserName] = useState<string>('');
  const [channels, setChannels] = useState<string[]>(initialChannels);
  const [offerTypes, setOfferTypes] = useState<string[]>(initialOfferTypes);
  const [baseOfferLink, setBaseOfferLink] = useState<string>('');
  const [dailyGoal, setDailyGoal] = useState<number>(5);
  const [dashboardElements, setDashboardElements] = useState<string[]>(initialDashboardElements);
  const [dashboardElementsOrder, setDashboardElementsOrder] = useState<string[]>(initialDashboardOrder);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<UserSettings>(initialSettings);

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedChannels = localStorage.getItem('channels');
    const storedOfferTypes = localStorage.getItem('offerTypes');
    const storedBaseOfferLink = localStorage.getItem('baseOfferLink');
    const storedDailyGoal = localStorage.getItem('dailyGoal');
    const storedDashboardElements = localStorage.getItem('dashboardElements');
    const storedDashboardOrder = localStorage.getItem('dashboardElementsOrder');
    const storedNotifications = localStorage.getItem('notifications');
    const storedSettings = localStorage.getItem('userSettings');

    if (storedUserName) setUserName(storedUserName);
    if (storedChannels) setChannels(JSON.parse(storedChannels));
    if (storedOfferTypes) setOfferTypes(JSON.parse(storedOfferTypes));
    if (storedBaseOfferLink) setBaseOfferLink(storedBaseOfferLink);
    if (storedDailyGoal) setDailyGoal(Number(storedDailyGoal));
    if (storedDashboardElements) setDashboardElements(JSON.parse(storedDashboardElements));
    if (storedDashboardOrder) setDashboardElementsOrder(JSON.parse(storedDashboardOrder));
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
    if (storedSettings) setSettings(JSON.parse(storedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('offerTypes', JSON.stringify(offerTypes));
  }, [offerTypes]);
  
  useEffect(() => {
    localStorage.setItem('baseOfferLink', baseOfferLink);
  }, [baseOfferLink]);

  useEffect(() => {
    localStorage.setItem('dailyGoal', dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('dashboardElements', JSON.stringify(dashboardElements));
  }, [dashboardElements]);

  useEffect(() => {
    localStorage.setItem('dashboardElementsOrder', JSON.stringify(dashboardElementsOrder));
  }, [dashboardElementsOrder]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...updates
    }));
  };

  const addNotification = (notification: Notification) => {
    const exists = notifications.some(n => n.id === notification.id);
    if (!exists) {
      setNotifications(prev => [notification, ...prev]);
      
      if ('Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetAppData = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('channels');
    localStorage.removeItem('offerTypes');
    localStorage.removeItem('offers');
    localStorage.removeItem('baseOfferLink');
    localStorage.removeItem('dailyGoal');
    localStorage.removeItem('dashboardElements');
    localStorage.removeItem('dashboardElementsOrder');
    localStorage.removeItem('notifications');
    localStorage.removeItem('userSettings');
    
    setUserName('');
    setChannels(initialChannels);
    setOfferTypes(initialOfferTypes);
    setBaseOfferLink('');
    setDailyGoal(5);
    setDashboardElements(initialDashboardElements);
    setDashboardElementsOrder(initialDashboardOrder);
    setNotifications([]);
    setSettings(initialSettings);
    
    window.location.reload();
  };

  return (
    <UserContext.Provider 
      value={{ 
        userName, 
        setUserName, 
        channels, 
        setChannels, 
        offerTypes, 
        setOfferTypes, 
        resetAppData,
        baseOfferLink,
        setBaseOfferLink,
        dailyGoal,
        setDailyGoal,
        dashboardElements,
        setDashboardElements,
        dashboardElementsOrder,
        setDashboardElementsOrder,
        notifications,
        addNotification,
        clearNotification,
        markNotificationAsRead,
        clearAllNotifications,
        settings,
        updateSettings
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
