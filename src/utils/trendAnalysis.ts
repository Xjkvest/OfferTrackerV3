import { Offer } from "@/context/OfferContext";
import { parseISO } from "date-fns";
import { differenceInDays } from "date-fns";

export function getFilteredOffers(
  offers: Offer[],
  dateRange: { start: string; end: string } | null,
  channels: string[] | null,
  offerTypes: string[] | null,
  csat: 'positive' | 'neutral' | 'negative' | null,
  converted: boolean | null,
  hasFollowup: boolean | null
): Offer[] {
  return offers.filter(offer => {
    // Filter by date range
    if (dateRange) {
      const offerDate = new Date(offer.date).setHours(0, 0, 0, 0);
      const startDate = new Date(dateRange.start).setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.end).setHours(23, 59, 59, 999);
      
      if (offerDate < startDate || offerDate > endDate) return false;
    }
    
    // Filter by channels
    if (channels && channels.length > 0) {
      if (!channels.includes(offer.channel)) return false;
    }
    
    // Filter by offer types
    if (offerTypes && offerTypes.length > 0) {
      if (!offerTypes.includes(offer.offerType)) return false;
    }
    
    // Filter by CSAT
    if (csat !== null) {
      if (offer.csat !== csat) return false;
    }
    
    // Filter by conversion status
    if (converted !== null) {
      if (offer.converted !== converted) return false;
    }
    
    // Filter by follow-up status
    if (hasFollowup !== null) {
      if (hasFollowup && !offer.followupDate) return false;
      if (!hasFollowup && offer.followupDate) return false;
    }
    
    return true;
  });
}

export function getConversionByTypeData(offers: Offer[], offerTypes: string[]) {
  // Get all offers with a decision (converted=true/false) or over 30 days old
  const decidedOffers = offers.filter(o => {
    if (o.converted !== undefined) return true;
    
    const offerDate = parseISO(o.date);
    const today = new Date();
    const daysSinceOffer = differenceInDays(today, offerDate);
    return daysSinceOffer > 30;
  });
  
  // Group by offer type
  const offerTypeGroups: Record<string, Offer[]> = {};
  
  // Initialize with all offer types
  offerTypes.forEach(type => {
    offerTypeGroups[type] = [];
  });
  
  // Group offers by type
  decidedOffers.forEach(offer => {
    if (offerTypeGroups[offer.offerType]) {
      offerTypeGroups[offer.offerType].push(offer);
    }
  });
  
  // Calculate conversion rates for each offer type
  return Object.entries(offerTypeGroups)
    .map(([type, offers]) => {
      const total = offers.length;
      const converted = offers.filter(o => o.converted === true).length;
      const conversionRate = total > 0 ? (converted / total) * 100 : 0;
      
      return {
        name: type,
        value: conversionRate,
        total: total,
        converted: converted
      };
    })
    .filter(item => item.value > 0) // Only include types with data
    .sort((a, b) => b.value - a.value); // Sort by conversion rate (descending)
}

export function getCsatByChannelData(offers: Offer[], channels: string[]) {
  // Get all offers with CSAT ratings
  const ratedOffers = offers.filter(o => o.csat);
  
  // Group by channel
  const channelGroups: Record<string, Offer[]> = {};
  
  // Initialize with all channels
  channels.forEach(channel => {
    channelGroups[channel] = [];
  });
  
  // Group offers by channel
  ratedOffers.forEach(offer => {
    if (channelGroups[offer.channel]) {
      channelGroups[offer.channel].push(offer);
    }
  });
  
  // Calculate positive CSAT percentage for each channel
  return Object.entries(channelGroups)
    .map(([channel, offers]) => {
      const total = offers.length;
      const positive = offers.filter(o => o.csat === 'positive').length;
      const csatPercentage = total > 0 ? (positive / total) * 100 : 0;
      
      return {
        name: channel,
        value: csatPercentage,
        total: total,
        positive: positive
      };
    })
    .filter(item => item.value > 0) // Only include channels with data
    .sort((a, b) => b.value - a.value); // Sort by CSAT percentage (descending)
}

export function getConversionsByChannelData(offers: Offer[], channels: string[]) {
  // Get all offers with a conversion decision or over 30 days old
  const decidedOffers = offers.filter(o => {
    if (o.converted !== undefined) return true;
    
    const offerDate = parseISO(o.date);
    const today = new Date();
    const daysSinceOffer = differenceInDays(today, offerDate);
    return daysSinceOffer > 30;
  });
  
  // Group by channel
  const channelGroups: Record<string, Offer[]> = {};
  
  // Initialize with all channels
  channels.forEach(channel => {
    channelGroups[channel] = [];
  });
  
  // Group offers by channel
  decidedOffers.forEach(offer => {
    if (channelGroups[offer.channel]) {
      channelGroups[offer.channel].push(offer);
    }
  });
  
  // Calculate conversion counts and rates for each channel
  return Object.entries(channelGroups)
    .map(([channel, offers]) => {
      const total = offers.length;
      const converted = offers.filter(o => o.converted === true).length;
      const conversionRate = total > 0 ? (converted / total) * 100 : 0;
      
      return {
        name: channel,
        value: conversionRate,
        total: total,
        converted: converted
      };
    })
    .filter(item => item.total > 0) // Only include channels with data
    .sort((a, b) => b.converted - a.converted); // Sort by number of conversions (descending)
}

export function getConversionCountByTypeData(offers: Offer[], offerTypes: string[]) {
  // Get all offers that were converted
  const convertedOffers = offers.filter(o => o.converted === true);
  
  // Group by offer type
  const offerTypeGroups: Record<string, Offer[]> = {};
  
  // Initialize with all offer types
  offerTypes.forEach(type => {
    offerTypeGroups[type] = [];
  });
  
  // Group offers by type
  convertedOffers.forEach(offer => {
    if (offerTypeGroups[offer.offerType]) {
      offerTypeGroups[offer.offerType].push(offer);
    }
  });
  
  // Calculate counts for each offer type
  return Object.entries(offerTypeGroups)
    .map(([type, offers]) => {
      return {
        name: type,
        value: offers.length,
        label: type
      };
    })
    .filter(item => item.value > 0) // Only include types with data
    .sort((a, b) => b.value - a.value); // Sort by conversion count (descending)
}

export function getConversionCountByChannelData(offers: Offer[], channels: string[]) {
  // Get all offers that were converted
  const convertedOffers = offers.filter(o => o.converted === true);
  
  // Group by channel
  const channelGroups: Record<string, Offer[]> = {};
  
  // Initialize with all channels
  channels.forEach(channel => {
    channelGroups[channel] = [];
  });
  
  // Group offers by channel
  convertedOffers.forEach(offer => {
    if (channelGroups[offer.channel]) {
      channelGroups[offer.channel].push(offer);
    }
  });
  
  // Calculate counts for each channel
  return Object.entries(channelGroups)
    .map(([channel, offers]) => {
      return {
        name: channel,
        value: offers.length,
        label: channel
      };
    })
    .filter(item => item.value > 0) // Only include channels with data
    .sort((a, b) => b.value - a.value); // Sort by conversion count (descending)
}
