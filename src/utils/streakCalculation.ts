import { Offer } from "@/context/OfferContext";

export interface StreakInfo {
  current: number;
  preservationTokens: number;
  badges: string[];
  hasActiveVacation: boolean;
  vacationDaysRemaining?: number;
}

export interface StreakSettings {
  /**
   * Whether to only count work days for streaks (based on user's custom schedule)
   */
  countWorkdaysOnly: boolean;
  
  /**
   * User's configured work days (numbers 0-6 where 0 is Sunday)
   * Default is Monday-Friday (1-5)
   */
  workdays: number[];
  
  /**
   * Number of missed workdays allowed after achieving these streak levels
   * This enables "vacation mode" for long streaks
   */
  missedDaysAllowances: {
    /** Allow 5 workdays off after 10-day streak */
    tier1: { requiredStreak: 10, allowedMissedDays: 5 },
    /** Allow 10 workdays off after 20-day streak */
    tier2: { requiredStreak: 20, allowedMissedDays: 10 },
  },
  
  /**
   * Whether to enable streak preservation tokens
   */
  enablePreservationTokens: boolean;
  
  /**
   * How many days of streak required to earn one preservation token
   */
  daysPerPreservationToken: number;
  
  /**
   * Whether user is on vacation (manually set)
   */
  vacationMode: {
    active: boolean;
    startDate?: string;
    endDate?: string;
  }
}

// Default streak settings
export const defaultStreakSettings: StreakSettings = {
  countWorkdaysOnly: true,
  workdays: [1, 2, 3, 4, 5], // Default to Monday-Friday
  missedDaysAllowances: {
    tier1: { requiredStreak: 10, allowedMissedDays: 5 },
    tier2: { requiredStreak: 20, allowedMissedDays: 10 },
  },
  enablePreservationTokens: true,
  daysPerPreservationToken: 10,
  vacationMode: {
    active: false
  }
};

/**
 * Calculates user's streak with the enhanced workday logic and vacation options
 */
export function calculateEnhancedStreak(
  offers: Offer[], 
  settings: StreakSettings = defaultStreakSettings
): StreakInfo {
  if (!offers.length) {
    return { 
      current: 0, 
      preservationTokens: 0, 
      badges: [],
      hasActiveVacation: false
    };
  }
  
  const sortedOffers = [...offers].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if vacation mode is active
  const hasActiveVacation = settings.vacationMode.active && 
    (!settings.vacationMode.endDate || new Date(settings.vacationMode.endDate) >= today);
  
  let vacationDaysRemaining: number | undefined;
  if (hasActiveVacation && settings.vacationMode.endDate) {
    vacationDaysRemaining = Math.ceil(
      (new Date(settings.vacationMode.endDate).getTime() - today.getTime()) / 
      (1000 * 60 * 60 * 24)
    );
  }
  
  // Check if today is a work day based on user's custom schedule
  const isTodayWorkday = !settings.countWorkdaysOnly || 
    settings.workdays.includes(today.getDay());
  
  // Only check for today's offer if it's a work day and user is not on vacation
  const hasOfferToday = sortedOffers.some(offer => {
    const offerDate = new Date(offer.date);
    offerDate.setHours(0, 0, 0, 0);
    return offerDate.getTime() === today.getTime();
  });
  
  // End streak if no offer on a work day and it's past 8 PM (unless vacation mode is active)
  if (isTodayWorkday && !hasOfferToday && new Date().getHours() >= 20 && !hasActiveVacation) {
    return { 
      current: 0, 
      preservationTokens: 0, 
      badges: [],
      hasActiveVacation 
    };
  }
  
  let currentStreak = hasOfferToday && isTodayWorkday ? 1 : 0;
  let previousDate = new Date(today);
  previousDate.setDate(previousDate.getDate() - 1);
  
  let missedWorkdays = 0;
  let earnedTokens = 0;
  let perfectWeeks = 0;
  let workdayCounter = 0;
  let nonWorkdayOffers = 0;
  
  // Track last 7 days for a full week
  const last7Days = new Array(7).fill(false);
  
  for (let i = 0; i < 90; i++) { // Check up to 90 days back
    // Check if this day is a work day based on user's settings
    const isWorkday = !settings.countWorkdaysOnly || 
      settings.workdays.includes(previousDate.getDay());
    
    if (!isWorkday) {
      // Check for non-work day offers (beyond expectations)
      const hasNonWorkdayOffer = sortedOffers.some(offer => {
        const offerDate = new Date(offer.date);
        offerDate.setHours(0, 0, 0, 0);
        return offerDate.getTime() === previousDate.getTime();
      });
      
      if (hasNonWorkdayOffer) {
        nonWorkdayOffers++;
      }
      
      // Update the last 7 days tracker
      last7Days[6 - (i % 7)] = hasNonWorkdayOffer;
      
      // Skip non-work days without penalty for streak
      previousDate.setDate(previousDate.getDate() - 1);
      continue;
    }
    
    // It's a work day - count it
    workdayCounter++;
    
    // Check if there was an offer on this day
    const hasOfferOnDay = sortedOffers.some(offer => {
      const offerDate = new Date(offer.date);
      offerDate.setHours(0, 0, 0, 0);
      return offerDate.getTime() === previousDate.getTime();
    });
    
    // Update the last 7 days tracker
    last7Days[6 - (i % 7)] = hasOfferOnDay;
    
    // Check for vacation period
    const isInVacationPeriod = settings.vacationMode.active && 
      settings.vacationMode.startDate && 
      new Date(settings.vacationMode.startDate) <= previousDate &&
      (!settings.vacationMode.endDate || new Date(settings.vacationMode.endDate) >= previousDate);
    
    if (hasOfferOnDay) {
      currentStreak++;
      missedWorkdays = 0; // Reset missed workdays counter
      
      // Award tokens at milestones
      if (settings.enablePreservationTokens && 
          currentStreak % settings.daysPerPreservationToken === 0) {
        earnedTokens++;
      }
      
      // Check for perfect week (5 workdays in a row)
      if (workdayCounter % 5 === 0 && missedWorkdays === 0) {
        perfectWeeks++;
      }
    } else if (isInVacationPeriod) {
      // Days in vacation period don't break the streak
      // but don't increment it either
    } else {
      missedWorkdays++;
      
      // Check allowances based on streak tier
      const tier2Allowance = settings.missedDaysAllowances.tier2;
      const tier1Allowance = settings.missedDaysAllowances.tier1;
      
      if (currentStreak >= tier2Allowance.requiredStreak && 
          missedWorkdays <= tier2Allowance.allowedMissedDays) {
        // Tier 2: Long streak (20+) allows up to 10 workdays missed (2-week vacation)
      } else if (currentStreak >= tier1Allowance.requiredStreak && 
                missedWorkdays <= tier1Allowance.allowedMissedDays) {
        // Tier 1: Medium streak (10+) allows up to 5 workdays missed (1-week vacation)
      } else {
        // Streak is broken
        break;
      }
    }
    
    previousDate.setDate(previousDate.getDate() - 1);
  }
  
  // Calculate badges
  const badges: string[] = [];
  
  if (currentStreak >= 5) badges.push("Consistent");
  if (currentStreak >= 10) badges.push("Dedicated");
  if (currentStreak >= 20) badges.push("Professional");
  if (currentStreak >= 30) badges.push("Master");
  if (currentStreak >= 50) badges.push("Legend");
  
  if (nonWorkdayOffers >= 5) badges.push("Off-Day Hustler");
  if (perfectWeeks >= 4) badges.push("Perfect Month");
  
  // Check if all 7 days have offers (full week coverage)
  if (last7Days.every(day => day)) {
    badges.push("Seven Day Streak");
  }
  
  return {
    current: currentStreak,
    preservationTokens: earnedTokens,
    badges,
    hasActiveVacation,
    vacationDaysRemaining
  };
}

/**
 * Use a streak preservation token to recover from a broken streak
 */
export function usePreservationToken(
  currentTokens: number, 
  brokenStreakValue: number
): { success: boolean; remainingTokens: number; newStreakValue: number } {
  if (currentTokens <= 0 || brokenStreakValue === 0) {
    return {
      success: false,
      remainingTokens: currentTokens,
      newStreakValue: brokenStreakValue
    };
  }
  
  return {
    success: true,
    remainingTokens: currentTokens - 1,
    newStreakValue: brokenStreakValue
  };
}

/**
 * Enable vacation mode for a user's streak
 */
export function enableVacationMode(
  startDate: Date = new Date(),
  endDate?: Date
): StreakSettings['vacationMode'] {
  return {
    active: true,
    startDate: startDate.toISOString(),
    endDate: endDate?.toISOString()
  };
}

/**
 * Disable vacation mode
 */
export function disableVacationMode(): StreakSettings['vacationMode'] {
  return {
    active: false
  };
}

/**
 * Get day name for a given day number
 * @param dayNumber Day number (0 = Sunday, 1 = Monday, etc.)
 * @param format 'short' for abbreviated, 'long' for full name
 */
export function getDayName(dayNumber: number, format: 'short' | 'long' = 'long'): string {
  const days = {
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  
  return days[format][dayNumber];
} 