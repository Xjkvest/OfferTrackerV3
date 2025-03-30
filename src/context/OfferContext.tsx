import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { toast } from "@/hooks/use-toast";
import { useUser } from './UserContext';
import { storageService } from '@/utils/storageService';
import { parseISO, isWithinInterval, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { calculateEnhancedStreak, StreakInfo } from '@/utils/streakCalculation';

export interface Offer {
  id: string;
  caseNumber: string;
  channel: string;
  offerType: string;
  notes: string;
  date: string;
  csat?: 'positive' | 'neutral' | 'negative';
  csatComment?: string;
  converted?: boolean;
  conversionDate?: string;
  followupDate?: string;
  followups?: FollowupItem[];
  isConverted?: boolean;
  csatScore?: number;
}

export interface FollowupItem {
  id: string;
  date: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
}

type NewOffer = Omit<Offer, 'id' | 'date'>;

interface OfferContextType {
  offers: Offer[];
  addOffer: (offer: NewOffer) => Promise<void>;
  updateOffer: (id: string, updates: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  todaysOffers: Offer[];
  getFilteredOffers: (
    filters: {
      dateRange?: { start: string; end: string };
      channel?: string;
      offerType?: string;
      csat?: 'positive' | 'neutral' | 'negative';
      converted?: boolean;
    }
  ) => Offer[];
  checkFollowups: () => void;
  streak: number;
  streakInfo: StreakInfo;
  isLoading: boolean;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

interface OfferProviderProps {
  children: ReactNode;
}

export const OfferProvider: React.FC<OfferProviderProps> = ({ children }) => {
  const { addNotification, userName, settings } = useUser();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if an offer should be marked as not converted based on 30-day rule
  const checkConversionStatus = (offer: Offer): Partial<Offer> => {
    if (offer.converted === undefined) {
      const offerDate = parseISO(offer.date);
      const today = new Date();
      const daysSinceOffer = differenceInDays(today, offerDate);
      
      if (daysSinceOffer > 30) {
        return {
          converted: false,
          conversionDate: undefined
        };
      }
    }
    return {};
  };

  // Function to update offers with automatic conversion status
  const updateOffersWithConversionStatus = (offers: Offer[]): Offer[] => {
    return offers.map(offer => {
      const updates = checkConversionStatus(offer);
      return updates.converted !== undefined ? { ...offer, ...updates } : offer;
    });
  };

  // Load offers from IndexedDB on initial render
  useEffect(() => {
    const loadOffers = async () => {
      setIsLoading(true);
      try {
        const storedOffers = await storageService.getOffers();
        if (storedOffers) {
          // Check conversion status when loading offers
          const updatedOffers = updateOffersWithConversionStatus(storedOffers);
          
          // Migrate legacy followup dates to the new structure
          const migratedOffers = migrateFollowupDates(updatedOffers);
          
          setOffers(migratedOffers);
          
          // Save any automatic updates back to storage
          if (JSON.stringify(storedOffers) !== JSON.stringify(migratedOffers)) {
            await storageService.saveOffers(migratedOffers);
          }
        }
      } catch (error) {
        console.error('Error loading offers:', error);
        toast({
          title: "Error loading offers",
          description: "There was a problem loading your offers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOffers();
  }, []);

  // Save offers to IndexedDB whenever they change
  useEffect(() => {
    if (offers.length > 0 && !isLoading) {
      storageService.saveOffers(offers);
    }
  }, [offers, isLoading]);

  const todaysOffers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return offers.filter(offer => offer.date.startsWith(today));
  }, [offers]);

  const checkFollowups = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    offers.forEach(offer => {
      // Check active followups in the new structure
      if (offer.followups?.length > 0) {
        // Find incomplete followups
        const activeFollowups = offer.followups.filter(f => !f.completed);
        
        // For each active followup that is due today or overdue
        activeFollowups.forEach(followup => {
          const isOverdue = followup.date < today;
          const isDueToday = followup.date === today;
          
          if (isOverdue || isDueToday) {
            const currentHour = new Date().getHours();
            const notificationId = `followup-${offer.id}-${followup.id}-hour-${currentHour}`;
            
            addNotification({
              id: notificationId,
              title: isOverdue 
                ? `Overdue Followup: ${offer.offerType}`
                : `Followup Reminder: ${offer.offerType}`,
              message: `Case #${offer.caseNumber}: ${followup.notes || offer.notes?.substring(0, 100) || 'No notes'}`,
              offerId: offer.id,
              timestamp: new Date().getTime(),
              read: false,
              isOverdue: isOverdue,
              isUrgent: true,
            });
          }
        });
      }
      // Fallback to legacy followupDate field if no followups array or empty array
      else if (offer.followupDate) {
        const isOverdue = offer.followupDate < today;
        const isDueToday = offer.followupDate === today;
        
        if (isOverdue || isDueToday) {
          const currentHour = new Date().getHours();
          const notificationId = `followup-${offer.id}-${offer.followupDate}-hour-${currentHour}`;
          
          addNotification({
            id: notificationId,
            title: isOverdue 
              ? `Overdue Followup: ${offer.offerType}`
              : `Followup Reminder: ${offer.offerType}`,
            message: `Case #${offer.caseNumber}: ${offer.notes?.substring(0, 100) || 'No notes'}`,
            offerId: offer.id,
            timestamp: new Date().getTime(),
            read: false,
            isOverdue: isOverdue,
            isUrgent: true,
          });
        }
      }
    });
  }, [offers, addNotification]);

  const streakInfo = useMemo(() => {
    return calculateEnhancedStreak(offers, settings.streakSettings);
  }, [offers, settings.streakSettings]);
  
  const streak = streakInfo.current;

  const addOffer = async (offer: NewOffer) => {
    const newOffer: Offer = {
      ...offer,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    setOffers(prev => [newOffer, ...prev]);
    toast({
      title: "Offer added",
      description: "Your offer has been successfully logged.",
    });
  };

  const updateOffer = async (id: string, updates: Partial<Offer>) => {
    // Make a deep copy of the updates to avoid any reference issues
    const updatesCopy = JSON.parse(JSON.stringify(updates));
    
    return new Promise<void>((resolve, reject) => {
      try {
        setOffers(prev => {
          // Create a completely new array (important for React state updates)
          const updatedOffers = prev.map(offer => {
            if (offer.id === id) {
              // Handle conversion date logic
              if (updatesCopy.converted === true && !updatesCopy.conversionDate && !offer.conversionDate) {
                updatesCopy.conversionDate = new Date().toISOString().split('T')[0];
              }
              
              if (updatesCopy.converted === false) {
                updatesCopy.conversionDate = undefined;
              }
              
              // Create a completely new object with spread
              const newOffer = { ...offer, ...updatesCopy };
              return newOffer;
            }
            return offer;
          });
          
          // Return a new array with conversion status updates
          return updateOffersWithConversionStatus(updatedOffers);
        });
        
        // Show success toast
        toast({
          title: "Offer updated",
          description: "Your offer has been successfully updated.",
        });
        
        // Resolve the promise after update
        resolve();
      } catch (error) {
        console.error('Error updating offer:', error);
        
        // Show error toast
        toast({
          title: "Update failed",
          description: "There was a problem updating your offer. Please try again.",
          variant: "destructive",
        });
        
        // Reject the promise with the error
        reject(error);
      }
    });
  };

  const deleteOffer = async (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
    toast({
      title: "Offer deleted",
      description: "Your offer has been removed.",
    });
  };

  const getFilteredOffers = (
    filters: {
      dateRange?: { start: string; end: string };
      channel?: string;
      offerType?: string;
      csat?: 'positive' | 'neutral' | 'negative';
      converted?: boolean;
    }
  ) => {
    return offers.filter(offer => {
      if (filters.dateRange) {
        const offerDate = parseISO(offer.date);
        const startDate = startOfDay(parseISO(filters.dateRange.start));
        const endDate = endOfDay(parseISO(filters.dateRange.end));
        
        if (!isWithinInterval(offerDate, { start: startDate, end: endDate })) {
          return false;
        }
      }
      
      if (filters.channel && offer.channel !== filters.channel) return false;
      
      if (filters.offerType && offer.offerType !== filters.offerType) return false;
      
      if (filters.csat && offer.csat !== filters.csat) return false;
      
      if (filters.converted !== undefined && offer.converted !== filters.converted) return false;
      
      return true;
    });
  };

  // Function to migrate legacy followupDate to the new followups array structure
  const migrateFollowupDates = (offers: Offer[]): Offer[] => {
    return offers.map(offer => {
      // Only migrate if there's a followupDate but no followups array
      if (offer.followupDate && (!offer.followups || offer.followups.length === 0)) {
        console.log(`Migrating legacy followupDate for offer ${offer.id}`);
        
        // Create a new followup item
        const followupItem: FollowupItem = {
          id: `migrated-${Date.now()}-${offer.id}`,
          date: offer.followupDate,
          notes: offer.notes,
          completed: false
        };
        
        // Return updated offer with the followups array
        return {
          ...offer,
          followups: [followupItem]
          // Keep the legacy followupDate for backward compatibility
        };
      }
      
      // If there are both followupDate and followups array, ensure they're in sync
      if (offer.followupDate && offer.followups && offer.followups.length > 0) {
        // Check if all followups are completed
        const allCompleted = offer.followups.every(f => f.completed);
        
        if (allCompleted) {
          // Clear the legacy followupDate if all followups are completed
          return {
            ...offer,
            followupDate: undefined
          };
        }
        
        // Find the earliest incomplete followup
        const incompleteFollowups = offer.followups.filter(f => !f.completed);
        if (incompleteFollowups.length > 0) {
          const earliestFollowup = [...incompleteFollowups].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0];
          
          // Update the legacy followupDate to match the earliest incomplete followup
          return {
            ...offer,
            followupDate: earliestFollowup.date
          };
        }
      }
      
      return offer;
    });
  };

  return (
    <OfferContext.Provider
      value={{
        offers,
        todaysOffers,
        addOffer,
        updateOffer,
        deleteOffer,
        getFilteredOffers,
        checkFollowups,
        streak,
        streakInfo,
        isLoading
      }}
    >
      {children}
    </OfferContext.Provider>
  );
};

// Extract the hook to a separate variable before exporting for better compatibility with Fast Refresh
const useOffersHook = () => {
  const context = useContext(OfferContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OfferProvider');
  }
  return context;
};

// Export the hook
export const useOffers = useOffersHook;