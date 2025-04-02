/**
 * Mock data utilities for charts when real data is unavailable
 */

// Color palettes for different chart types
const channelColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];
const offerTypeColors = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const csatColors = ['#10b981', '#f59e0b', '#fbbf24', '#f97316', '#ef4444'];
const conversionColors = ['#10b981', '#ef4444', '#f59e0b'];

// Mock data for donut charts with consistent format
export const mockChannelData = [
  { id: 'Website', name: 'Website', value: 120, color: channelColors[0] },
  { id: 'Email', name: 'Email', value: 80, color: channelColors[1] },
  { id: 'Direct', name: 'Direct', value: 70, color: channelColors[2] },
  { id: 'Social', name: 'Social', value: 50, color: channelColors[3] },
  { id: 'Partner', name: 'Partner', value: 30, color: channelColors[4] }
];

export const mockOfferTypeData = [
  { id: 'Discount', name: 'Discount', value: 150, color: offerTypeColors[0] },
  { id: 'Bundle', name: 'Bundle', value: 90, color: offerTypeColors[1] },
  { id: 'Free Trial', name: 'Free Trial', value: 70, color: offerTypeColors[2] },
  { id: 'Upgrade', name: 'Upgrade', value: 40, color: offerTypeColors[3] }
];

export const mockCsatData = [
  { id: '5 Stars', name: '5 Stars', value: 85, rating: 5, color: csatColors[0] },
  { id: '4 Stars', name: '4 Stars', value: 45, rating: 4, color: csatColors[1] },
  { id: '3 Stars', name: '3 Stars', value: 25, rating: 3, color: csatColors[2] },
  { id: '2 Stars', name: '2 Stars', value: 10, rating: 2, color: csatColors[3] },
  { id: '1 Star', name: '1 Star', value: 5, rating: 1, color: csatColors[4] }
];

export const mockConversionData = [
  { id: 'Converted', name: 'Converted', value: 180, color: conversionColors[0] },
  { id: 'Not Converted', name: 'Not Converted', value: 170, color: conversionColors[1] }
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
    
  // If data is invalid, return mock data
  if (!isValid) {
    return getMockChartData(chartType);
  }
  
  // If data is valid but missing colors, add them
  let colorPalette: string[] = [];
  switch (chartType) {
    case 'channel':
      colorPalette = channelColors;
      break;
    case 'offerType':
      colorPalette = offerTypeColors;
      break;
    case 'csat':
      colorPalette = csatColors;
      break;
    case 'conversion':
      colorPalette = conversionColors;
      break;
  }
  
  // Ensure every data item has a color
  return data.map((item, index) => ({
    ...item,
    color: item.color || colorPalette[index % colorPalette.length]
  }));
}; 