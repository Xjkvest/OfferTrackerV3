import { Offer } from "@/context/OfferContext";
import { parseISO, isWithinInterval, startOfDay, endOfDay, isSameDay } from "date-fns";

// Helper function to check if an offer has active followups
const hasActiveFollowup = (offer: Offer): boolean => {
  // Check followups array
  if (offer.followups && offer.followups.length > 0) {
    return offer.followups.some(followup => !followup.completed);
  }
  // Check legacy followupDate
  return !!offer.followupDate;
};

// Helper function to get the most recent active followup date
export const getActiveFollowupDate = (offer: Offer): string | null => {
  // If using new structure
  if (offer.followups?.length) {
    const activeFollowups = offer.followups.filter(f => !f.completed);
    if (activeFollowups.length > 0) {
      // Sort by date (earliest first) and return the first one
      const sortedFollowups = [...activeFollowups].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return sortedFollowups[0].date;
    }
    return null;
  }
  // Fall back to legacy field
  return offer.followupDate || null;
};

// Check if a followup is overdue
export const isFollowupOverdue = (offer: Offer): boolean => {
  const activeFollowupDate = getActiveFollowupDate(offer);
  if (!activeFollowupDate) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return activeFollowupDate < today;
};

// Check if a followup is due today
export const isFollowupDueToday = (offer: Offer): boolean => {
  const activeFollowupDate = getActiveFollowupDate(offer);
  if (!activeFollowupDate) return false;
  
  const today = new Date().toISOString().split('T')[0];
  return activeFollowupDate === today;
};

// Optimized function for getting filtered offers with memoization support
export const filterOffers = (
  offers: Offer[],
  {
    dateRange,
    channel,
    offerType,
    csat,
    converted,
    hasFollowup,
    searchTerm,
    statusFilter,
    limit
  }: {
    dateRange?: { start: Date | string; end: Date | string };
    channel?: string;
    offerType?: string;
    csat?: 'positive' | 'neutral' | 'negative' | 'rated';
    converted?: 'converted' | 'not-converted' | boolean;
    hasFollowup?: boolean;
    searchTerm?: string;
    statusFilter?: string;
    limit?: number;
  } = {}
): Offer[] => {
  // First pass - apply fast filters
  let filteredOffers = offers.filter(offer => {
    // Search filter (slower operation - do early to reduce items for other filters)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesCase = offer.caseNumber.toLowerCase().includes(term);
      const matchesChannel = offer.channel.toLowerCase().includes(term);
      const matchesType = offer.offerType.toLowerCase().includes(term);
      const matchesNotes = offer.notes?.toLowerCase().includes(term) || false;
      
      if (!(matchesCase || matchesChannel || matchesType || matchesNotes)) {
        return false;
      }
    }
    
    // Filter by date
    if (dateRange) {
      const offerDate = parseISO(offer.date);
      const startDateObj = typeof dateRange.start === 'string' ? parseISO(dateRange.start) : dateRange.start;
      const endDateObj = typeof dateRange.end === 'string' ? parseISO(dateRange.end) : dateRange.end;
      
      if (!isWithinInterval(offerDate, {
        start: startOfDay(startDateObj),
        end: endOfDay(endDateObj)
      })) {
        return false;
      }
    }
    
    // Filter by channel
    if (channel && offer.channel !== channel) {
      return false;
    }
    
    // Filter by offer type
    if (offerType && offer.offerType !== offerType) {
      return false;
    }
    
    // Filter by CSAT
    if (csat) {
      if (csat === 'rated' && !offer.csat) {
        return false;
      } else if (csat !== 'rated' && offer.csat !== csat) {
        return false;
      }
    }
    
    // Filter by conversion status
    if (converted !== undefined) {
      if (converted === 'converted' && offer.converted !== true) {
        return false;
      } else if (converted === 'not-converted' && offer.converted !== false) {
        return false;
      } else if (typeof converted === 'boolean' && offer.converted !== converted) {
        return false;
      }
    }
    
    // Filter by followup status
    if (hasFollowup !== undefined) {
      // Check if offer has an active followup
      const hasActiveFollowupStatus = hasActiveFollowup(offer);
      if (hasActiveFollowupStatus !== hasFollowup) {
        return false;
      }
    }
    
    // Filter by status (more complex status filters)
    if (statusFilter) {
      switch (statusFilter) {
        case 'overdue-followup':
          return isFollowupOverdue(offer);
        case 'due-today':
          return isFollowupDueToday(offer);
        case 'completed-followup':
          return offer.followups?.some(f => f.completed) || false;
        case 'today': {
          const today = new Date();
          return isSameDay(parseISO(offer.date), today);
        }
      }
    }
    
    return true;
  });
  
  // Apply limit if needed (useful for recent offers)
  if (limit && filteredOffers.length > limit) {
    filteredOffers = filteredOffers.slice(0, limit);
  }
  
  return filteredOffers;
};

// Helper function to get recent offers (optimized for dashboard)
export const getRecentOffers = (offers: Offer[], limit: number = 30): Offer[] => {
  return [...offers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

// Helper function to get today's offers
export const getTodaysOffers = (offers: Offer[]): Offer[] => {
  const today = new Date();
  return offers.filter(offer => {
    const offerDate = parseISO(offer.date);
    return isSameDay(offerDate, today);
  });
};
