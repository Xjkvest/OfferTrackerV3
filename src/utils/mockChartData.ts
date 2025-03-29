/**
 * Mock data utilities for charts when real data is unavailable
 */

// Mock data for donut charts with consistent format
export const mockChannelData = [
  { id: 'Website', name: 'Website', value: 120 },
  { id: 'Email', name: 'Email', value: 80 },
  { id: 'Direct', name: 'Direct', value: 70 },
  { id: 'Social', name: 'Social', value: 50 },
  { id: 'Partner', name: 'Partner', value: 30 }
];

export const mockOfferTypeData = [
  { id: 'Discount', name: 'Discount', value: 150 },
  { id: 'Bundle', name: 'Bundle', value: 90 },
  { id: 'Free Trial', name: 'Free Trial', value: 70 },
  { id: 'Upgrade', name: 'Upgrade', value: 40 }
];

export const mockCsatData = [
  { id: '5 Stars', name: '5 Stars', value: 85, rating: 5 },
  { id: '4 Stars', name: '4 Stars', value: 45, rating: 4 },
  { id: '3 Stars', name: '3 Stars', value: 25, rating: 3 },
  { id: '2 Stars', name: '2 Stars', value: 10, rating: 2 },
  { id: '1 Star', name: '1 Star', value: 5, rating: 1 }
];

export const mockConversionData = [
  { id: 'Converted', name: 'Converted', value: 180 },
  { id: 'Not Converted', name: 'Not Converted', value: 170 }
];

/**
 * Get mock data for a specific chart type
 */
export const getMockChartData = (chartType: 'channel' | 'offerType' | 'csat' | 'conversion') => {
  switch (chartType) {
    case 'channel':
      return mockChannelData;
    case 'offerType':
      return mockOfferTypeData;
    case 'csat':
      return mockCsatData;
    case 'conversion':
      return mockConversionData;
    default:
      return [];
  }
};

/**
 * Helper to safely handle chart data
 * Returns mock data if provided data is invalid
 */
export const ensureValidChartData = (data: any[] | null | undefined, chartType: 'channel' | 'offerType' | 'csat' | 'conversion') => {
  // Check if data is valid
  const isValid = data && 
    Array.isArray(data) && 
    data.length > 0 && 
    data.some(item => item && typeof item === 'object' && 'value' in item && item.value > 0);
  
  // Return mock data if invalid
  return isValid ? data : getMockChartData(chartType);
}; 