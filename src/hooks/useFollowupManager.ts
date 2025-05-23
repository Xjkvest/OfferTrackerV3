import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Offer, FollowupItem, useOffers } from '@/context/OfferContext';

export function useFollowupManager() {
  const { updateOffer, offers } = useOffers();
  const [popoverOpen, setPopoverOpen] = useState<Record<string, boolean>>({});
  const [followupTime, setFollowupTime] = useState<Record<string, string>>({});
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // Function to trigger a refresh of components using this hook
  const refreshState = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);
  
  // Mark a followup as completed
  const markFollowupAsCompleted = useCallback(async (
    offerId: string,
    offer: Offer,
    followupId?: string
  ) => {
    try {
      console.log('Marking followup as completed:', { offerId, followupId });
      
      // Create a copy of the offer's followups array
      const updatedFollowups = [...(offer.followups || [])];
      
      if (followupId) {
        // Find and update the specific followup
        const followupIndex = updatedFollowups.findIndex(f => f.id === followupId);
        
        if (followupIndex >= 0) {
          // Update the followup
          updatedFollowups[followupIndex] = {
            ...updatedFollowups[followupIndex],
            completed: true,
            completedAt: new Date().toISOString()
          };
        } else {
          console.warn(`Followup with ID ${followupId} not found`);
          return;
        }
      } else if (updatedFollowups.length > 0) {
        // If no specific followupId is provided, find the most urgent (earliest) active followup
        const activeFollowups = updatedFollowups.filter(f => !f.completed);
        
        if (activeFollowups.length > 0) {
          // Sort by date (earliest first) to get the most urgent
          const sortedActiveFollowups = activeFollowups.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          // Get the most urgent (earliest) active followup
          const mostUrgentFollowup = sortedActiveFollowups[0];
          
          // Find and update this followup in the original array
          const followupIndex = updatedFollowups.findIndex(f => f.id === mostUrgentFollowup.id);
          
          if (followupIndex >= 0) {
            updatedFollowups[followupIndex] = {
              ...updatedFollowups[followupIndex],
              completed: true,
              completedAt: new Date().toISOString()
            };
          }
        } else {
          console.log('No active followups to mark as completed');
          return;
        }
      } else if (offer.followupDate) {
        // Handle legacy format - create a completed followup
        updatedFollowups.push({
          id: uuidv4(),
          date: offer.followupDate,
          completed: true,
          completedAt: new Date().toISOString(),
          notes: 'Automatically migrated from legacy format'
        });
      } else {
        console.log('No followups to mark as completed');
        return;
      }

      // Update the offer with the modified followups array
      await updateOffer(offerId, {
        followups: updatedFollowups,
        followupDate: undefined // Clear legacy field
      });

      // Trigger a refresh to ensure components re-render
      refreshState();

      console.log('Followup marked as completed successfully');
      toast.success('Followup marked as completed');
      return true;
    } catch (error) {
      console.error('Error marking followup as completed:', error);
      toast.error('Failed to mark followup as completed');
      return false;
    }
  }, [updateOffer, refreshState]);

  // For compatibility with existing code that only passes the offer
  const markFollowupAsCompletedLegacy = useCallback(async (offer: Offer) => {
    return markFollowupAsCompleted(offer.id, offer);
  }, [markFollowupAsCompleted]);

  // Add a new followup
  const addNewFollowup = useCallback(async (
    offerId: string,
    offer: Offer,
    followupDate: string, 
    notes?: string
  ) => {
    try {
      console.log('Adding new followup:', { offerId, followupDate, notes });
      
      // Create a copy of the offer's followups array
      const updatedFollowups = [...(offer.followups || [])];
      
      // Check if there's already an active followup with the same date
      const hasDuplicateDate = updatedFollowups.some(
        f => !f.completed && f.date === followupDate
      );
      
      if (hasDuplicateDate) {
        console.warn('An active followup with this date already exists');
        toast.error('An active followup with this date already exists');
        return false;
      }
      
      // Add the new followup
      updatedFollowups.push({
        id: uuidv4(),
        date: followupDate,
        notes: notes,
        completed: false
      });

      // Update the offer with the new followups array and sync the legacy field
      await updateOffer(offerId, {
        followups: updatedFollowups,
        followupDate: followupDate // Keep legacy field in sync
      });
      
      // Trigger a refresh to ensure components re-render
      refreshState();

      console.log('Followup added successfully');
      toast.success('Followup scheduled');
      return true;
    } catch (error) {
      console.error('Error adding followup:', error);
      toast.error('Failed to schedule followup');
      return false;
    }
  }, [updateOffer, refreshState]);

  // Force refresh all categorized followups when offers change
  useEffect(() => {
    refreshState();
  }, [offers, refreshState]);

  // For compatibility with existing code that only passes the offer and date
  const addNewFollowupLegacy = useCallback(async (offer: Offer, dateString: string, notes?: string) => {
    return addNewFollowup(offer.id, offer, dateString, notes);
  }, [addNewFollowup]);

  // Clear all followups
  const clearAllFollowups = useCallback(async (
    offerId: string,
    offer: Offer
  ) => {
    try {
      console.log('Clearing all followups for offer:', offerId);
      
      // Get the current followups
      const currentFollowups = offer.followups || [];
      
      // Check if there are any incomplete followups
      const hasActiveFollowups = currentFollowups.some(f => !f.completed);
      
      if (!hasActiveFollowups) {
        console.warn('No active followups to clear');
        toast.info('No active followups to clear');
        return false;
      }
      
      // Mark all active followups as canceled
      const updatedFollowups = currentFollowups.map(followup => {
        if (!followup.completed) {
          return {
            ...followup,
            completed: true,
            completedAt: new Date().toISOString(),
            notes: followup.notes ? `${followup.notes} (Canceled)` : 'Canceled'
          };
        }
        return followup;
      });

      // Update the offer
      await updateOffer(offerId, {
        followups: updatedFollowups,
        followupDate: undefined // Clear legacy field
      });

      console.log('All followups cleared successfully');
      toast.success('All followups cleared');
      return true;
    } catch (error) {
      console.error('Error clearing followups:', error);
      toast.error('Failed to clear followups');
      return false;
    }
  }, [updateOffer]);

  // Helper functions
  const hasActiveFollowup = useCallback((offer: Offer): boolean => {
    // Check new structure
    if (offer.followups?.length) {
      return offer.followups.some(f => !f.completed);
    }
    // Check legacy structure
    return !!offer.followupDate;
  }, []);

  const hasAnyFollowups = useCallback((offer: Offer): boolean => {
    return !!(offer.followups?.length || offer.followupDate);
  }, []);

  const hasOnlyCompletedFollowups = useCallback((offer: Offer): boolean => {
    // If using new structure
    if (offer.followups?.length) {
      // Check if there are followups, but all are completed
      return offer.followups.length > 0 && !offer.followups.some(f => !f.completed);
    }
    
    // With legacy structure, followupDate means active
    return false;
  }, []);

  const getActiveFollowupDate = useCallback((offer: Offer): string | undefined => {
    // Check the followups array first
    if (offer.followups && offer.followups.length > 0) {
      const activeFollowups = offer.followups.filter(f => !f.completed);
      if (activeFollowups.length > 0) {
        // Sort by date (earliest first) and return the most urgent one
        return activeFollowups
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date;
      }
    }
    
    // Fallback to legacy field
    return offer.followupDate;
  }, []);

  const isFollowupDueToday = useCallback((offer: Offer): boolean => {
    const followupDate = getActiveFollowupDate(offer);
    if (!followupDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return followupDate === today;
  }, [getActiveFollowupDate]);

  const isFollowupOverdue = useCallback((offer: Offer): boolean => {
    const followupDate = getActiveFollowupDate(offer);
    if (!followupDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return followupDate < today;
  }, [getActiveFollowupDate]);

  const getFollowupStatus = useCallback((offer: Offer): 'none' | 'active' | 'completed' | 'overdue' | 'due-today' => {
    if (!hasAnyFollowups(offer)) {
      return 'none';
    }
    
    if (hasOnlyCompletedFollowups(offer)) {
      return 'completed';
    }
    
    if (isFollowupOverdue(offer)) {
      return 'overdue';
    }
    
    if (isFollowupDueToday(offer)) {
      return 'due-today';
    }
    
    return 'active';
  }, [hasAnyFollowups, hasOnlyCompletedFollowups, isFollowupOverdue, isFollowupDueToday]);

  // Get all active followups for an offer, sorted by urgency (earliest first)
  const getActiveFollowupsSorted = useCallback((offer: Offer): FollowupItem[] => {
    if (offer.followups?.length) {
      const activeFollowups = offer.followups.filter(f => !f.completed);
      
      if (activeFollowups.length > 0) {
        // Sort by date (earliest first) for urgency
        return [...activeFollowups].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
    }
    
    return [];
  }, []);

  // Get the most urgent (earliest) active followup for an offer
  const getMostUrgentFollowup = useCallback((offer: Offer): FollowupItem | null => {
    const activeFollowups = getActiveFollowupsSorted(offer);
    
    if (activeFollowups.length > 0) {
      return activeFollowups[0]; // First one is most urgent
    }
    
    // Fall back to legacy field
    if (offer.followupDate) {
      return {
        id: 'legacy',
        date: offer.followupDate,
        completed: false
      };
    }
    
    return null;
  }, [getActiveFollowupsSorted]);

  // Get the most recent followup for an offer (alias for backward compatibility)
  const getMostRecentFollowup = useCallback((offer: Offer): FollowupItem | null => {
    return getMostUrgentFollowup(offer);
  }, [getMostUrgentFollowup]);

  // Categorize followups into today, overdue, and upcoming
  const getCategorizedFollowups = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const overdue: Offer[] = [];
    const todayFollowups: Offer[] = [];
    const upcoming: Offer[] = [];
    const completed: Offer[] = [];
    const all: Offer[] = [];
    
    // Check all offers with either followups array or legacy followupDate
    offers.forEach(offer => {
      let hasActiveFollowup = false;
      
      // Check if offer has any kind of followup
      if ((offer.followups && offer.followups.length > 0) || offer.followupDate) {
        // For new structure, check active followups
        if (offer.followups?.length) {
          const activeFollowups = offer.followups.filter(f => !f.completed);
          
          if (activeFollowups.length > 0) {
            // Sort by date (earliest first)
            const nextFollowup = [...activeFollowups].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];
            
            all.push(offer);
            hasActiveFollowup = true;
            
            // Categorize based on date
            if (nextFollowup.date < today) {
              overdue.push(offer);
            } else if (nextFollowup.date === today) {
              todayFollowups.push(offer);
            } else {
              upcoming.push(offer);
            }
          } else if (offer.followups.some(f => f.completed)) {
            // Has completed followups only
            completed.push(offer);
            all.push(offer);
          }
        } 
        // Check legacy format if needed
        else if (offer.followupDate) {
          all.push(offer);
          hasActiveFollowup = true;
          
          // Categorize based on date
          if (offer.followupDate < today) {
            overdue.push(offer);
          } else if (offer.followupDate === today) {
            todayFollowups.push(offer);
          } else {
            upcoming.push(offer);
          }
        }
      }
    });
    
    return {
      overdue,
      today: todayFollowups,
      upcoming,
      completed,
      all
    };
  }, [offers]);

  // Get all offers that could have followups added
  const getAllFollowableOffers = useCallback(() => {
    return offers.filter(offer => 
      // Include offers that have no followups or only completed followups
      !hasActiveFollowup(offer)
    );
  }, [offers]);

  // Popover state management
  const handlePopoverOpenChange = useCallback((offerId: string, open: boolean) => {
    setPopoverOpen(prev => ({ ...prev, [offerId]: open }));
  }, []);
  
  // Time management
  const handleTimeChange = useCallback((offerId: string, time: string) => {
    setFollowupTime(prev => ({ ...prev, [offerId]: time }));
  }, []);

  return {
    markFollowupAsCompleted,
    addNewFollowup,
    clearAllFollowups,
    getMostRecentFollowup,
    getMostUrgentFollowup,
    getActiveFollowupsSorted,
    getCategorizedFollowups,
    getAllFollowableOffers,
    hasActiveFollowup,
    hasAnyFollowups,
    hasOnlyCompletedFollowups,
    getActiveFollowupDate,
    isFollowupDueToday,
    isFollowupOverdue,
    getFollowupStatus,
    popoverOpen,
    handlePopoverOpenChange,
    followupTime,
    handleTimeChange,
    // Legacy compatibility
    markFollowupAsCompletedLegacy,
    addNewFollowupLegacy
  };
} 