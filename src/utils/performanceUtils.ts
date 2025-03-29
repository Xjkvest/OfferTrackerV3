
// This file now serves as a barrel file to re-export all performance utility functions
import { getPerformanceMetrics, getMonthPacingMetrics } from './performanceMetrics';
import { getFilteredOffers } from './offerFilters';
import { getConversionLagData, getFollowupEffectivenessData, getConversionFunnelData } from './conversionAnalysis';
import { getConversionByTypeData, getCsatByChannelData } from './trendAnalysis';

export { 
  getPerformanceMetrics, 
  getMonthPacingMetrics,
  getFilteredOffers,
  getConversionLagData, 
  getFollowupEffectivenessData,
  getConversionFunnelData,
  getConversionByTypeData,
  getCsatByChannelData
};

export type { PerformanceMetrics } from './performanceMetrics';
