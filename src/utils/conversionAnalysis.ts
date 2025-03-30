import { Offer } from "@/context/OfferContext";
import { parseISO, differenceInDays } from "date-fns";

export function getConversionLagData(offers: Offer[]) {
  return offers
    .filter(offer => offer.converted && offer.conversionDate)
    .map(offer => {
      const offerDate = parseISO(offer.date);
      const conversionDate = parseISO(offer.conversionDate as string);
      const lagDays = differenceInDays(conversionDate, offerDate);
      
      return {
        id: offer.id,
        offerType: offer.offerType,
        lagDays,
        channel: offer.channel,
        hasFollowup: !!offer.followupDate
      };
    });
}

// Helper function to check if an offer has active followups
const hasActiveFollowup = (offer: Offer): boolean => {
  // Check followups array
  if (offer.followups && offer.followups.length > 0) {
    return offer.followups.some(followup => !followup.completed);
  }
  // Check legacy followupDate
  return !!offer.followupDate;
};

export function analyzeConversionsByFollowup(offers: Offer[]) {
  // First filter out offers that don't have a decision (converted or not converted)
  const decidedOffers = offers.filter(o => o.converted === true || o.converted === false);
  
  // Group by whether they had a followup
  const withFollowup = decidedOffers.filter(o => hasActiveFollowup(o));
  const withoutFollowup = decidedOffers.filter(o => !hasActiveFollowup(o));
  
  // Calculate conversion rates for each group
  const withFollowupConverted = withFollowup.filter(o => o.converted === true).length;
  const withoutFollowupConverted = withoutFollowup.filter(o => o.converted === true).length;
  
  const withFollowupRate = withFollowup.length ? (withFollowupConverted / withFollowup.length) * 100 : 0;
  const withoutFollowupRate = withoutFollowup.length ? (withoutFollowupConverted / withoutFollowup.length) * 100 : 0;
  
  return {
    withFollowup: {
      total: withFollowup.length,
      converted: withFollowupConverted,
      rate: withFollowupRate
    },
    withoutFollowup: {
      total: withoutFollowup.length,
      converted: withoutFollowupConverted,
      rate: withoutFollowupRate
    },
    difference: withFollowupRate - withoutFollowupRate,
    impact: withFollowupRate > withoutFollowupRate ? 'positive' : 
           withFollowupRate < withoutFollowupRate ? 'negative' : 'neutral'
  };
}

export function calculateFollowupEffectiveness(offers: Offer[]) {
  const decidedOffers = offers.filter(o => o.converted === true || o.converted === false);
  const totalDecided = decidedOffers.length;
  
  if (totalDecided === 0) return null;
  
  const withFollowup = offers.filter(o => hasActiveFollowup(o)).length;
  const followupRate = (withFollowup / offers.length) * 100;
  
  const followupConverted = decidedOffers.filter(o => hasActiveFollowup(o) && o.converted === true).length;
  const followupConversionRate = withFollowup ? (followupConverted / withFollowup) * 100 : 0;
  
  const noFollowupConverted = decidedOffers.filter(o => !hasActiveFollowup(o) && o.converted === true).length;
  const noFollowupTotal = decidedOffers.filter(o => !hasActiveFollowup(o)).length;
  const noFollowupConversionRate = noFollowupTotal ? (noFollowupConverted / noFollowupTotal) * 100 : 0;
  
  const effectiveness = followupConversionRate - noFollowupConversionRate;
  
  return {
    followupRate,
    followupConversionRate,
    noFollowupConversionRate,
    effectiveness,
    impact: effectiveness > 5 ? 'High' : 
            effectiveness > 0 ? 'Moderate' : 
            effectiveness === 0 ? 'None' : 'Negative'
  };
}

export function getConversionFunnelData(offers: Offer[]) {
  // Count total offers
  const total = offers.length;
  
  // Count offers with follow-up
  const withFollowup = offers.filter(o => hasActiveFollowup(o)).length;
  
  // Count offers with positive CSAT
  const withPositiveCsat = offers.filter(o => o.csat === 'positive').length;
  
  // Count converted offers and offers over 30 days old
  const converted = offers.filter(o => {
    if (o.converted === true) return true;
    
    if (o.converted === undefined) {
      const offerDate = parseISO(o.date);
      const today = new Date();
      const daysSinceOffer = differenceInDays(today, offerDate);
      return daysSinceOffer > 30;
    }
    
    return false;
  }).length;
  
  return [
    {
      name: "Total Offers",
      value: total
    },
    {
      name: "With Follow-up",
      value: withFollowup
    },
    {
      name: "Positive CSAT",
      value: withPositiveCsat
    },
    {
      name: "Converted",
      value: converted
    }
  ];
}
