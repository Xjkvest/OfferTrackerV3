import { Offer } from "@/context/OfferContext";
import { format, addDays, isWithinInterval, parseISO, startOfWeek, endOfWeek, getDaysInMonth, setDate, subDays, getDay, isSameDay, subWeeks, subMonths, startOfQuarter, endOfQuarter, subQuarters, differenceInDays } from "date-fns";

// Define the interface for chart data points
export interface ChartDataPoint {
  date: string;
  count: number;
  goal: number;
}

export interface PieDataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

// Generate last 7 days data
export const getLast7DaysData = (offers: Offer[], dailyGoal: number): ChartDataPoint[] => {
  // End date is today
  const endDate = new Date();
  // Start date is 7 days ago
  const startDate = subDays(endDate, 6);
  
  // Generate array of 7 days
  const result: ChartDataPoint[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const formattedDate = format(currentDate, "d");
    const dayOffers = offers.filter(offer => {
      const offerDate = parseISO(offer.date);
      return isSameDay(offerDate, currentDate);
    });
    
    result.push({
      date: formattedDate,
      count: dayOffers.length,
      goal: dailyGoal
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return result;
};

// Generate week data (current week)
export const getWeekData = (offers: Offer[], dailyGoal: number, weekOffset: number = 0): ChartDataPoint[] => {
  const now = new Date();
  const weekStart = startOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 1 }); // End on Sunday
  
  // Generate array for days of the week
  const result: ChartDataPoint[] = [];
  let currentDate = new Date(weekStart);
  
  while (currentDate <= weekEnd) {
    const formattedDate = format(currentDate, "EEE");
    const dayOffers = offers.filter(offer => {
      const offerDate = parseISO(offer.date);
      return isSameDay(offerDate, currentDate);
    });
    
    result.push({
      date: formattedDate,
      count: dayOffers.length,
      goal: dailyGoal
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return result;
};

// Generate month data (days 1-30/31)
export const getMonthData = (offers: Offer[], dailyGoal: number, monthOffset: number = 0): ChartDataPoint[] => {
  const now = new Date();
  const targetDate = subMonths(now, monthOffset);
  const daysInMonth = getDaysInMonth(targetDate);
  
  // Generate array for days of the month
  const result: ChartDataPoint[] = [];
  
  // Generate all days in the month
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = setDate(new Date(targetDate), i);
    const formattedDate = format(currentDate, "d");
    const dayOffers = offers.filter(offer => {
      const offerDate = parseISO(offer.date);
      return isSameDay(offerDate, currentDate);
    });
    
    result.push({
      date: formattedDate,
      count: dayOffers.length,
      goal: dailyGoal
    });
  }
  
  return result;
};

// Generate quarter data
export const getQuarterData = (offers: Offer[], dailyGoal: number, quarterOffset: number = 0): ChartDataPoint[] => {
  const now = new Date();
  const targetDate = subQuarters(now, quarterOffset);
  
  // Get the date range for the target period
  const startDate = startOfQuarter(targetDate);
  const endDate = endOfQuarter(targetDate);
  
  // Generate array for weeks of the quarter
  const result: ChartDataPoint[] = [];
  let currentDate = new Date(startDate);
  let weekNumber = 1;
  
  while (currentDate <= endDate) {
    const weekEnd = addDays(currentDate, 6);
    const weekEndDate = weekEnd > endDate ? endDate : weekEnd;
    
    const weekOffers = offers.filter(offer => {
      const offerDate = parseISO(offer.date);
      return offerDate >= currentDate && offerDate <= weekEndDate;
    });
    
    result.push({
      date: `W${weekNumber}`,
      count: weekOffers.length,
      goal: dailyGoal * 7 // Weekly goal
    });
    
    currentDate = addDays(currentDate, 7);
    weekNumber++;
  }
  
  return result;
};

// Generate channel data for pie chart
export const getChannelData = (offers: Offer[], availableChannels: string[]): PieDataPoint[] => {
  const channelCounts: { [key: string]: number } = {};
  
  // Initialize with 0 for all available channels
  availableChannels.forEach(channel => {
    channelCounts[channel] = 0;
  });
  
  // Count offers per channel
  offers.forEach(offer => {
    if (offer.channel) {
      channelCounts[offer.channel] = (channelCounts[offer.channel] || 0) + 1;
    }
  });
  
  // Convert to array of objects
  const data = Object.keys(channelCounts)
    .filter(channel => channelCounts[channel] > 0)
    .map(channel => ({
      id: channel,
      label: channel,
      value: channelCounts[channel],
      color: undefined // This will be assigned by the chart component
    }));
  
  // Ensure we always return at least one item even if there's no channel data
  if (data.length === 0) {
    return [{
      id: "No Data",
      label: "No Channel Data",
      value: 1,
      color: "#e2e8f0" // Light gray
    }];
  }
  
  return data;
};

// Generate offer type data for pie chart
export const getOfferTypeData = (offers: Offer[], availableTypes: string[]): PieDataPoint[] => {
  const typeCounts: { [key: string]: number } = {};
  
  // Initialize with 0 for all available types
  availableTypes.forEach(type => {
    typeCounts[type] = 0;
  });
  
  // Count offers per type
  offers.forEach(offer => {
    if (offer.offerType) {
      typeCounts[offer.offerType] = (typeCounts[offer.offerType] || 0) + 1;
    }
  });
  
  // Convert to array of objects
  const data = Object.keys(typeCounts)
    .filter(type => typeCounts[type] > 0)
    .map(type => ({
      id: type,
      label: type,
      value: typeCounts[type],
      color: undefined // This will be assigned by the chart component
    }));
  
  // Ensure we always return at least one item even if there's no offer type data
  if (data.length === 0) {
    return [{
      id: "No Data",
      label: "No Offer Type Data",
      value: 1,
      color: "#e2e8f0" // Light gray
    }];
  }
  
  return data;
};

// Generate CSAT data for pie chart
export const getCsatData = (offers: Offer[]): PieDataPoint[] => {
  const positive = offers.filter(offer => offer.csat === 'positive').length;
  const neutral = offers.filter(offer => offer.csat === 'neutral').length;
  const negative = offers.filter(offer => offer.csat === 'negative').length;
  const noFeedback = offers.filter(offer => !offer.csat).length;
  
  const data = [
    {
      id: "Positive",
      label: "Positive",
      value: positive,
      color: "#10b981" // Green
    },
    {
      id: "Neutral",
      label: "Neutral",
      value: neutral,
      color: "#f59e0b" // Amber
    },
    {
      id: "Negative",
      label: "Negative",
      value: negative,
      color: "#ef4444" // Red
    },
    {
      id: "No Feedback",
      label: "No Feedback",
      value: noFeedback,
      color: "#94a3b8" // Gray
    }
  ].filter(item => item.value > 0);
  
  // Ensure we always return at least one item even if there's no CSAT data
  if (data.length === 0) {
    return [{
      id: "No Data",
      label: "No CSAT Data",
      value: 1,
      color: "#e2e8f0" // Light gray
    }];
  }

  return data;
};

// Generate conversion data for pie chart
export const getConversionData = (offers: Offer[]): PieDataPoint[] => {
  const converted = offers.filter(offer => offer.converted === true).length;
  const notConverted = offers.filter(offer => {
    if (offer.converted === false) return true;
    
    if (offer.converted === undefined) {
      const offerDate = parseISO(offer.date);
      const today = new Date();
      const daysSinceOffer = differenceInDays(today, offerDate);
      return daysSinceOffer > 30;
    }
    
    return false;
  }).length;
  const pending = offers.filter(offer => {
    if (offer.converted === undefined) {
      const offerDate = parseISO(offer.date);
      const today = new Date();
      const daysSinceOffer = differenceInDays(today, offerDate);
      return daysSinceOffer <= 30;
    }
    return false;
  }).length;
  
  const data = [
    {
      id: "Converted",
      label: "Converted",
      value: converted,
      color: "#10b981" // Green
    },
    {
      id: "Not Converted",
      label: "Not Converted",
      value: notConverted,
      color: "#ef4444" // Red
    },
    {
      id: "Pending",
      label: "Pending",
      value: pending,
      color: "#f59e0b" // Amber
    }
  ].filter(item => item.value > 0);
  
  // Ensure we always return at least one item even if there's no conversion data
  if (data.length === 0) {
    return [{
      id: "No Data",
      label: "No Conversion Data",
      value: 1,
      color: "#e2e8f0" // Light gray
    }];
  }
  
  return data;
};
