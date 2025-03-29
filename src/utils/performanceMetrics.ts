
import { Offer } from "@/context/OfferContext";
import { format, startOfMonth, endOfMonth, differenceInDays, isSameMonth } from "date-fns";

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
  const notConverted = offers.filter(o => o.converted === false).length;
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
