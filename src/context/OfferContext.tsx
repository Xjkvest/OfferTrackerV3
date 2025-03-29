import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useUser } from './UserContext';
import { storageService } from '@/utils/storageService';
import { parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

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
  isLoading: boolean;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

export const OfferProvider = ({ children }: { children: React.ReactNode }) => {
  const { addNotification } = useUser();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load offers from IndexedDB on initial render
  useEffect(() => {
    const loadOffers = async () => {
      setIsLoading(true);
      try {
        const savedOffers = await storageService.getOffers();
        setOffers(savedOffers);
      } catch (error) {
        console.error('Error loading offers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your offers data.',
          variant: 'destructive',
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
      if (offer.followupDate) {
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

  const streak = useMemo(() => {
    if (!offers.length) return 0;
    
    const sortedOffers = [...offers].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const hasOfferToday = sortedOffers.some(offer => {
      const offerDate = new Date(offer.date);
      offerDate.setHours(0, 0, 0, 0);
      return offerDate.getTime() === today.getTime();
    });
    
    if (!hasOfferToday && new Date().getHours() >= 20) {
      return 0;
    }
    
    let currentStreak = hasOfferToday ? 1 : 0;
    let previousDate = hasOfferToday ? yesterday : today;
    
    for (let i = 0; i < sortedOffers.length; i++) {
      const offerDate = new Date(sortedOffers[i].date);
      offerDate.setHours(0, 0, 0, 0);
      
      if (offerDate.getTime() === previousDate.getTime()) {
        if (!hasOfferToday || i > 0) currentStreak++;
        previousDate = new Date(previousDate);
        previousDate.setDate(previousDate.getDate() - 1);
      } else if (offerDate.getTime() < previousDate.getTime()) {
        previousDate = offerDate;
        if (!hasOfferToday || i > 0) currentStreak++;
        previousDate = new Date(previousDate);
        previousDate.setDate(previousDate.getDate() - 1);
      }
    }
    
    return currentStreak;
  }, [offers]);

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
    setOffers(prev => 
      prev.map(offer => {
        if (offer.id === id) {
          if (updates.converted === true && !updates.conversionDate && !offer.conversionDate) {
            updates.conversionDate = new Date().toISOString().split('T')[0];
          }
          
          if (updates.converted === false) {
            updates.conversionDate = undefined;
          }
          
          return { ...offer, ...updates };
        }
        return offer;
      })
    );
    
    toast({
      title: "Offer updated",
      description: "Your offer has been successfully updated.",
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
        isLoading
      }}
    >
      {children}
    </OfferContext.Provider>
  );
};

export function useOffers() {
  const context = useContext(OfferContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within an OfferProvider');
  }
  return context;
}
