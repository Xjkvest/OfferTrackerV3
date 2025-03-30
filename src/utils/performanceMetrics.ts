import { Offer } from "@/context/OfferContext";
import { format, startOfMonth, endOfMonth, differenceInDays, isSameMonth, parseISO } from "date-fns";

export interface PerformanceMetrics {
  total: number;
  csatPositive: number;
  csatNeutral: number;
  csatNegative: number;
  csatTotal: number;
  csatPercentage: number;
  converted: number;
  notConverted: number;
  conversionRate: number;
  followupSet: number;
  followupCompleted: number;
  followupCompletionRate: number;
}

export function getPerformanceMetrics(offers: Offer[]): PerformanceMetrics {
  const total = offers.length;
  
  // CSAT metrics
  const csatPositive = offers.filter(o => o.csat === 'positive').length;
  const csatNeutral = offers.filter(o => o.csat === 'neutral').length;
  const csatNegative = offers.filter(o => o.csat === 'negative').length;
  const csatTotal = csatPositive + csatNeutral + csatNegative;
  const csatPercentage = csatTotal > 0 ? (csatPositive / csatTotal) * 100 : 0;
  
  // Conversion metrics
  const converted = offers.filter(o => o.converted === true).length;
  const notConverted = offers.filter(o => {
    if (o.converted === false) return true;
    
    if (o.converted === undefined) {
      const offerDate = parseISO(o.date);
      const today = new Date();
      const daysSinceOffer = differenceInDays(today, offerDate);
      return daysSinceOffer > 30;
    }
    
    return false;
  }).length;
  const conversionTotal = converted + notConverted;
  const conversionRate = conversionTotal > 0 ? (converted / conversionTotal) * 100 : 0;
  
  // Followup metrics
  const followupSet = offers.filter(o => o.followupDate).length;
  const followupCompleted = offers.filter(o => 
    o.followupDate && o.converted === true
  ).length;
  const followupCompletionRate = followupSet > 0 ? (followupCompleted / followupSet) * 100 : 0;
  
  return {
    total,
    csatPositive,
    csatNeutral,
    csatNegative,
    csatTotal,
    csatPercentage,
    converted,
    notConverted,
    conversionRate,
    followupSet,
    followupCompleted,
    followupCompletionRate
  };
}

export function getMonthPacingMetrics(offers: Offer[], dailyGoal: number) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  // Get offers for this month only
  const thisMonthOffers = offers.filter(offer => {
    const offerDate = new Date(offer.date);
    return isSameMonth(offerDate, now);
  });
  
  const daysElapsed = differenceInDays(now, monthStart) + 1;
  const daysRemaining = differenceInDays(monthEnd, now);
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  
  const targetSoFar = daysElapsed * dailyGoal;
  const currentCount = thisMonthOffers.length;
  const behind = Math.max(0, targetSoFar - currentCount);
  const ahead = Math.max(0, currentCount - targetSoFar);
  const pacingPercentage = targetSoFar > 0 ? (currentCount / targetSoFar) * 100 : 0;
  
  const monthlyTarget = daysInMonth * dailyGoal;
  const projectedTotal = (currentCount / daysElapsed) * daysInMonth;
  const projectedCompletion = monthlyTarget > 0 ? (projectedTotal / monthlyTarget) * 100 : 0;
  
  return {
    daysElapsed,
    daysRemaining,
    daysInMonth,
    targetSoFar,
    currentCount,
    behind,
    ahead,
    pacingPercentage,
    monthlyTarget,
    projectedTotal: Math.round(projectedTotal),
    projectedCompletion
  };
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

export function calculateMetrics(offers: Offer[]): PerformanceMetrics {
  // Basic counts
  const totalOffers = offers.length;
  if (totalOffers === 0) {
    return {
      total: 0,
      csatPositive: 0,
      csatNeutral: 0,
      csatNegative: 0,
      csatTotal: 0,
      csatPercentage: 0,
      converted: 0,
      notConverted: 0,
      conversionRate: 0,
      followupSet: 0,
      followupCompleted: 0,
      followupCompletionRate: 0
    };
  }
  
  const convertedOffers = offers.filter(o => o.converted === true).length;
  const followupSet = offers.filter(o => hasActiveFollowup(o)).length;
  
  // Converted offers with followups set
  const convertedWithFollowups = offers.filter(o => 
    hasActiveFollowup(o) && o.converted === true
  ).length;
  
  // Calculate rates
  const conversionRate = (convertedOffers / totalOffers) * 100;
  const followupRate = (followupSet / totalOffers) * 100;
  const followupConversionRate = followupSet > 0 
    ? (convertedWithFollowups / followupSet) * 100 
    : 0;
  
  // CSAT metrics
  const csatPositive = offers.filter(o => o.csat === 'positive').length;
  const csatNeutral = offers.filter(o => o.csat === 'neutral').length;
  const csatNegative = offers.filter(o => o.csat === 'negative').length;
  const csatTotal = csatPositive + csatNeutral + csatNegative;
  const csatPercentage = csatTotal > 0 ? (csatPositive / csatTotal) * 100 : 0;
  
  // Conversion metrics
  const notConverted = offers.filter(o => {
    if (o.converted === false) return true;
    
    if (o.converted === undefined) {
      const offerDate = parseISO(o.date);
      const today = new Date();
      const daysSinceOffer = differenceInDays(today, offerDate);
      return daysSinceOffer > 30;
    }
    
    return false;
  }).length;
  const conversionTotal = convertedOffers + notConverted;
  
  // Followup metrics
  const followupCompleted = offers.filter(o => 
    o.followupDate && o.converted === true
  ).length;
  const followupCompletionRate = followupSet > 0 ? (followupCompleted / followupSet) * 100 : 0;
  
  return {
    total: totalOffers,
    csatPositive,
    csatNeutral,
    csatNegative,
    csatTotal,
    csatPercentage,
    converted: convertedOffers,
    notConverted,
    conversionRate,
    followupSet,
    followupCompleted,
    followupCompletionRate
  };
}
