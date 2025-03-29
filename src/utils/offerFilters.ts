
import { Offer } from "@/context/OfferContext";
import { parseISO, isWithinInterval } from "date-fns";

export function getFilteredOffers(
  offers: Offer[],
  dateRange: { start: Date | null; end: Date | null } | null,
  channels: string[] | null,
  offerTypes: string[] | null,
  csat: ('positive' | 'neutral' | 'negative')[] | null,
  converted: boolean | null,
  hasFollowup: boolean | null
) {
  return offers.filter(offer => {
    // Date range filter
    if (dateRange?.start && dateRange?.end) {
      const offerDate = parseISO(offer.date);
      if (!isWithinInterval(offerDate, { start: dateRange.start, end: dateRange.end })) {
        return false;
      }
    }
    
    // Channel filter
    if (channels && channels.length > 0) {
      if (!channels.includes(offer.channel)) {
        return false;
      }
    }
    
    // Offer type filter
    if (offerTypes && offerTypes.length > 0) {
      if (!offerTypes.includes(offer.offerType)) {
        return false;
      }
    }
    
    // CSAT filter
    if (csat && csat.length > 0) {
      if (!offer.csat || !csat.includes(offer.csat)) {
        return false;
      }
    }
    
    // Converted filter
    if (converted !== null) {
      if (offer.converted !== converted) {
        return false;
      }
    }
    
    // Follow-up filter
    if (hasFollowup !== null) {
      const hasFollowupDate = !!offer.followupDate;
      if (hasFollowupDate !== hasFollowup) {
        return false;
      }
    }
    
    return true;
  });
}
