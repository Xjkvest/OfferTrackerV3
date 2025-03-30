// This file now serves as a barrel file to re-export all performance utility functions
import { getPerformanceMetrics, getMonthPacingMetrics } from './performanceMetrics';
import { filterOffers } from './offerFilters';
import { getConversionLagData, analyzeConversionsByFollowup, getConversionFunnelData, calculateFollowupEffectiveness } from './conversionAnalysis';
import { getConversionByTypeData, getCsatByChannelData } from './trendAnalysis';
import { 
  calculateEnhancedStreak, 
  usePreservationToken, 
  enableVacationMode, 
  disableVacationMode 
} from './streakCalculation';

// Define getFilteredOffers here instead of re-exporting
export const getFilteredOffers = (
  offers,
  dateRange,
  channels,
  offerTypes,
  csat,
  converted,
  hasFollowup
) => {
  // Filter offers based on all criteria
  return offers.filter(offer => {
    // Date range filter
    if (dateRange && dateRange.start && dateRange.end) {
      const offerDate = new Date(offer.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      // Set time to beginning and end of day
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (offerDate < startDate || offerDate > endDate) {
        return false;
      }
    }

    // Channel filter
    if (channels && channels.length > 0 && !channels.includes(offer.channel)) {
      return false;
    }

    // Offer type filter
    if (offerTypes && offerTypes.length > 0 && !offerTypes.includes(offer.offerType)) {
      return false;
    }

    // CSAT filter - handle both array and single value
    if (csat !== null) {
      // If csat is an array, use the first value
      const csatValue = Array.isArray(csat) ? csat[0] : csat;

      if (csatValue === 'positive' && offer.csat !== 'positive') return false;
      if (csatValue === 'neutral' && offer.csat !== 'neutral') return false;
      if (csatValue === 'negative' && offer.csat !== 'negative') return false;
      
      // For backward compatibility with numeric values
      if (csatValue === 0 && offer.csat !== null) return false;
      if (csatValue === 1 && (offer.csat === null || offer.csat < 3)) return false;
      if (csatValue === 2 && (offer.csat === null || offer.csat >= 3)) return false;
    }

    // Converted filter
    if (converted !== null) {
      if (converted === true && !offer.converted) return false;
      if (converted === false && offer.converted) return false;
    }

    // Has followup filter
    if (hasFollowup !== null) {
      if (hasFollowup === true && !offer.followupDate) return false;
      if (hasFollowup === false && offer.followupDate) return false;
    }

    return true;
  });
};

export { 
  getPerformanceMetrics, 
  getMonthPacingMetrics,
  // We've defined getFilteredOffers directly instead of aliasing filterOffers
  getConversionLagData, 
  analyzeConversionsByFollowup as getFollowupEffectivenessData,  // Export with alias for backward compatibility
  getConversionFunnelData,
  calculateFollowupEffectiveness,
  getConversionByTypeData,
  getCsatByChannelData,
  // New enhanced streak calculation
  calculateEnhancedStreak,
  usePreservationToken,
  enableVacationMode,
  disableVacationMode
};

export type { PerformanceMetrics } from './performanceMetrics';
export type { StreakInfo, StreakSettings } from './streakCalculation';
