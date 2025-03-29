
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

export function getFollowupEffectivenessData(offers: Offer[]) {
  // Get all offers with a decision (converted=true/false)
  const decidedOffers = offers.filter(o => o.converted !== undefined);
  
  // Split by followup status
  const withFollowup = decidedOffers.filter(o => !!o.followupDate);
  const withoutFollowup = decidedOffers.filter(o => !o.followupDate);
  
  // Calculate conversion rates
  const withFollowupConversionRate = withFollowup.length > 0 
    ? (withFollowup.filter(o => o.converted === true).length / withFollowup.length) * 100 
    : 0;
    
  const withoutFollowupConversionRate = withoutFollowup.length > 0 
    ? (withoutFollowup.filter(o => o.converted === true).length / withoutFollowup.length) * 100 
    : 0;
  
  return [
    {
      name: "With Follow-up",
      value: withFollowupConversionRate
    },
    {
      name: "Without Follow-up",
      value: withoutFollowupConversionRate
    }
  ];
}

export function getConversionFunnelData(offers: Offer[]) {
  // Count total offers
  const total = offers.length;
  
  // Count offers with follow-up
  const withFollowup = offers.filter(o => !!o.followupDate).length;
  
  // Count offers with positive CSAT
  const withPositiveCsat = offers.filter(o => o.csat === 'positive').length;
  
  // Count converted offers
  const converted = offers.filter(o => o.converted === true).length;
  
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
