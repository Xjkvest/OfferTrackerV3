import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { StreakBadges } from "@/components/StreakBadges";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Award, 
  Sparkles, 
  ArrowUp, 
  Flame, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  ArrowUpRight,
  Star
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, subMonths, getDay, addDays } from 'date-fns';
import { getDaysInMonth, getDaysPassedInCurrentMonth } from '@/utils/dateUtils';
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line
} from 'recharts';
import { getDayName } from "@/utils/streakCalculation";

// Define a type for the chart data items
interface ChartDataItem {
  date: string;
  dayNum: number;
  offers: number | undefined;
  goal: number;
  adjustedGoal: number;
  prevMonth: number | null;
  isToday: boolean;
  forecast?: number;
  metGoal: boolean;
  isExceptional: boolean;
  isRecord: boolean;
  dayOfWeek: number;
  isWorkday: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    // Determine if this day met the goal
    const goalValue = payload.find((p: any) => p.name === 'Goal')?.value || 0;
    const offersValue = payload.find((p: any) => p.name === 'Offers')?.value || 0;
    const prevMonthValue = payload.find((p: any) => p.name === 'Last Month')?.value;
    const forecastValue = payload.find((p: any) => p.name === 'Forecast')?.value;
    
    const metGoal = offersValue >= goalValue;
    const goalExceeded = offersValue >= goalValue * 1.5;

    return (
      <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
        <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
          Day {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            if (entry.name === 'Offers') {
              return (
                <div key={`tooltip-${index}`} className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {entry.name}: {entry.value} 
                    {goalValue > 0 && (
                      <span className={`ml-1 ${metGoal ? 
                        (goalExceeded ? 'text-purple-500' : 'text-green-500') : 
                        'text-amber-500'}`}>
                        ({Math.round((entry.value / goalValue) * 100)}% of goal)
                        {goalExceeded && ' 🔥'}
                      </span>
                    )}
                  </span>
                </div>
              );
            }
            
            if (entry.dataKey === 'forecast' && forecastValue) {
              return (
                <div key={`tooltip-${index}`} className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Forecast: {Math.round(entry.value)}
                  </span>
                </div>
              );
            }
            
            if (entry.name === 'Last Month' && prevMonthValue !== undefined) {
              const diff = offersValue - prevMonthValue;
              const diffPercent = prevMonthValue > 0 ? Math.round((diff / prevMonthValue) * 100) : 0;
              
              return (
                <div key={`tooltip-${index}`} className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Last Month: {entry.value}
                    <span className={`ml-1 ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ({diff >= 0 ? '+' : ''}{diff} / {diffPercent}%)
                    </span>
                  </span>
                </div>
              );
            }
            
            if (entry.name === 'Goal') {
              return (
                <div key={`tooltip-${index}`} className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {entry.name}: {entry.value}
                  </span>
                </div>
              );
            }
            
            return null;
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyGoalSummary = () => {
  const { offers, streak, streakInfo } = useOffers();
  const { dailyGoal, settings } = useUser();
  const [showPrevMonth, setShowPrevMonth] = useState(false);
  const [adjustedGoal, setAdjustedGoal] = useState(dailyGoal);
  
  // Calculate monthly metrics
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get the date range for the current month
  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);
  const startOfMonthStr = startOfCurrentMonth.toISOString().split('T')[0];
  const currentDateStr = currentDate.toISOString().split('T')[0];
  
  // Previous month data
  const prevMonth = subMonths(currentDate, 1);
  const startOfPrevMonth = startOfMonth(prevMonth);
  const endOfPrevMonth = endOfMonth(prevMonth);
  const startOfPrevMonthStr = startOfPrevMonth.toISOString().split('T')[0];
  const endOfPrevMonthStr = endOfPrevMonth.toISOString().split('T')[0];
  
  // Filter offers for current month
  const offersThisMonth = offers.filter(offer => {
    const offerDate = offer.date.split('T')[0];
    return offerDate >= startOfMonthStr && offerDate <= currentDateStr;
  });
  
  // Filter offers for previous month
  const offersPrevMonth = offers.filter(offer => {
    const offerDate = offer.date.split('T')[0];
    return offerDate >= startOfPrevMonthStr && offerDate <= endOfPrevMonthStr;
  });
  
  const offerCount = offersThisMonth.length;
  
  // Calculate goal metrics with workday awareness
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const totalDaysPassedInMonth = getDaysPassedInCurrentMonth();

  // Apply workday settings if enabled
  const useWorkdaySettings = settings?.streakSettings?.countWorkdaysOnly;
  const workdays = settings?.streakSettings?.workdays || [1, 2, 3, 4, 5]; // Default to weekdays if not specified
  
  // Calculate workdays in month and workdays passed
  const workdaysInMonth = useWorkdaySettings ? 
    Array.from({length: daysInMonth}, (_, i) => (new Date(currentYear, currentMonth, i + 1).getDay()))
      .filter(day => workdays.includes(day)).length : 
    daysInMonth;
  
  const workdaysPassedInMonth = useWorkdaySettings ?
    Array.from({length: totalDaysPassedInMonth}, (_, i) => (new Date(currentYear, currentMonth, i + 1).getDay()))
      .filter(day => workdays.includes(day)).length :
    totalDaysPassedInMonth;
  
  // Use appropriate day count based on settings
  const daysPassedInMonth = useWorkdaySettings ? workdaysPassedInMonth : totalDaysPassedInMonth;
  const effectiveDaysInMonth = useWorkdaySettings ? workdaysInMonth : daysInMonth;
  
  // Calculate goals based on effective days
  const monthlyGoal = dailyGoal * effectiveDaysInMonth;
  const currentExpectedGoal = dailyGoal * daysPassedInMonth;
  const adjustedMonthlyGoal = adjustedGoal * effectiveDaysInMonth;
  
  // Calculate progress percentage (allow exceeding 100% for display purposes)
  const rawGoalProgress = currentExpectedGoal > 0 ? (offerCount / currentExpectedGoal) * 100 : 0;
  const goalProgress = Math.round(rawGoalProgress || 0);
  
  // Calculate adjusted progress percentage for comparison
  const adjustedRawGoalProgress = (adjustedGoal * daysPassedInMonth) > 0 
    ? (offerCount / (adjustedGoal * daysPassedInMonth)) * 100 
    : 0;
  const adjustedGoalProgress = Math.round(adjustedRawGoalProgress || 0);
  
  // Calculate how many more offers are needed to catch up
  const isAhead = offerCount >= currentExpectedGoal;
  const difference = Math.abs(offerCount - currentExpectedGoal);
  
  // Calculate how many more offers are needed to catch up to adjusted goal
  const isAheadAdjusted = offerCount >= (adjustedGoal * daysPassedInMonth);
  const differenceAdjusted = Math.abs(offerCount - (adjustedGoal * daysPassedInMonth));
  
  // Function to determine if a value is an outlier (more than 2 standard deviations from mean)
  const isOutlier = (value: number, mean: number, stdDev: number): boolean => {
    return Math.abs(value - mean) > stdDev * 2;
  };
  
  // Get day-of-week performance for better forecasting
  const dayOfWeekPerformance = useMemo(() => {
    // Create a Map to store performance by day of week
    const performanceByDay = new Map(
      [0, 1, 2, 3, 4, 5, 6].map(day => [day, { count: 0, days: 0, average: 0 }])
    );
    
    // Get the last 90 days of offers for a reliable sample
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Analyze offers by day of week
    offers.forEach(offer => {
      const offerDate = new Date(offer.date);
      if (offerDate >= ninetyDaysAgo && offerDate <= now) {
        const dayOfWeek = offerDate.getDay();
        const dayStats = performanceByDay.get(dayOfWeek)!;
        dayStats.count++;
        
        // Count the number of each day of week in the period
        const days = eachDayOfInterval({ start: ninetyDaysAgo, end: now })
          .filter(date => date.getDay() === dayOfWeek).length;
        
        dayStats.days = days;
        dayStats.average = days > 0 ? dayStats.count / days : 0;
      }
    });
    
    return performanceByDay;
  }, [offers]);
  
  // Generate chart data with enhanced features and forecasting
  const generateChartData = useMemo(() => {
    const days = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });
    const prevMonthDays = showPrevMonth ? 
      eachDayOfInterval({ 
        start: startOfPrevMonth, 
        end: endOfPrevMonth 
      }) : [];
    
    // Calculate streaks for highlighting
    const streakPeriods = [];
    let currentStreakStart = null;
    let currentStreakLength = 0;
    
    // Convert offers to a map for faster lookup
    const offersByDate = new Map();
    offers.forEach(offer => {
      const dateStr = offer.date.split('T')[0];
      if (!offersByDate.has(dateStr)) {
        offersByDate.set(dateStr, []);
      }
      offersByDate.get(dateStr).push(offer);
    });
    
    // Calculate average and standard deviation of offers per day
    // (for outlier detection and more accurate forecasting)
    const offerCounts = [];
    days.forEach(day => {
      if (day > currentDate) return; // Only include past days
      
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayOffers = offersByDate.get(dateStr) || [];
      offerCounts.push(dayOffers.length);
    });
    
    // Calculate statistics
    const offersMean = offerCounts.length > 0 
      ? offerCounts.reduce((sum, count) => sum + count, 0) / offerCounts.length 
      : 0;
    
    const offersStdDev = offerCounts.length > 0
      ? Math.sqrt(
          offerCounts.reduce((sum, count) => sum + Math.pow(count - offersMean, 2), 0) / offerCounts.length
        )
      : 0;
    
    // Determine if a value is an outlier (more than 2 standard deviations from mean)
    const isOutlier = (value: number) => {
      return Math.abs(value - offersMean) > offersStdDev * 2;
    };
    
    const result: ChartDataItem[] = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayOffers = offersByDate.get(dateStr) || [];
      const offersCount = dayOffers.length;
      const dayNum = parseInt(format(day, 'd'), 10);
      const dayOfWeek = day.getDay();
      
      // Check if this is a workday if work day settings are enabled
      const isWorkday = !useWorkdaySettings || workdays.includes(dayOfWeek);
      
      // Find corresponding previous month day if available
      let prevMonthOffersCount = null;
      if (showPrevMonth) {
        const prevMonthDay = prevMonthDays.find(d => parseInt(format(d, 'd'), 10) === dayNum);
        if (prevMonthDay) {
          const prevDateStr = format(prevMonthDay, 'yyyy-MM-dd');
          const prevDayOffers = offersByDate.get(prevDateStr) || [];
          prevMonthOffersCount = prevDayOffers.length;
        }
      }
      
      // Calculate streak information - only consider workdays if enabled
      const shouldCountForStreak = isWorkday || !useWorkdaySettings;
      const effectiveGoal = shouldCountForStreak ? dailyGoal : 0;
      const metGoal = shouldCountForStreak ? offersCount >= effectiveGoal : false;
      
      if (metGoal) {
        if (currentStreakStart === null) {
          currentStreakStart = dayNum;
        }
        currentStreakLength++;
      } else if (day <= currentDate) { // Only reset streak for past days
        if (currentStreakLength >= 3) {
          streakPeriods.push({
            start: currentStreakStart,
            length: currentStreakLength
          });
        }
        currentStreakStart = null;
        currentStreakLength = 0;
      }
      
      // Add achievement markers
      const isExceptional = shouldCountForStreak && offersCount >= dailyGoal * 1.5;
      const isRecord = offersCount > 0 && 
        offersCount === Math.max(...days
          .filter(d => d <= currentDate)
          .map(d => {
            const dStr = format(d, 'yyyy-MM-dd');
            return (offersByDate.get(dStr) || []).length;
          }));
      
      // Generate forecast for future days based on day-of-week performance
      let forecast = undefined;
      if (day > currentDate) {
        const dayStats = dayOfWeekPerformance.get(dayOfWeek)!;
        
        // Use day-of-week average if available, fallback to overall average
        if (dayStats.days >= 3) { // Require at least 3 samples for reliable average
          forecast = dayStats.average;
        } else {
          // Use the overall daily average when not enough data
          const pastDays = days.filter(d => d <= currentDate);
          const pastDaysCount = pastDays.length;
          
          if (pastDaysCount > 0) {
            const totalOffers = pastDays.reduce((sum, d) => {
              const dStr = format(d, 'yyyy-MM-dd');
              return sum + (offersByDate.get(dStr) || []).length;
            }, 0);
            
            forecast = totalOffers / pastDaysCount;
          } else {
            forecast = 0;
          }
        }
        
        // Adjust forecast based on workday settings
        if (useWorkdaySettings && !isWorkday) {
          forecast = Math.min(forecast * 0.4, 1); // Non-workdays typically see 40% or less activity
        }
      }
      
      return {
        date: format(day, 'd'),
        dayNum,
        offers: day <= currentDate ? offersCount : undefined,
        goal: isWorkday ? dailyGoal : 0, // Only show goal line for workdays
        adjustedGoal: isWorkday ? adjustedGoal : 0,
        prevMonth: prevMonthOffersCount,
        isToday: isToday(day),
        forecast,
        metGoal,
        isExceptional,
        isRecord,
        dayOfWeek,
        isWorkday
      };
    });
    
    return { chartData: result, streakPeriods };
  }, [offers, dailyGoal, adjustedGoal, showPrevMonth, currentDate, workdays, useWorkdaySettings, dayOfWeekPerformance]);
  
  const { chartData, streakPeriods } = generateChartData;
  
  // Calculate performance metrics with improved accuracy
  const workdaysWithData = chartData
    .filter(d => d.dayNum <= currentDate.getDate() && (d.isWorkday || !useWorkdaySettings));
  
  const daysWithData = workdaysWithData.length;
  const daysMetGoal = workdaysWithData.filter(d => d.metGoal).length;
  const successRate = daysWithData > 0 ? Math.round((daysMetGoal / daysWithData) * 100) : 0;
  
  // Calculate more accurate forecasting
  const pastDays = chartData.filter(d => d.dayNum <= currentDate.getDate());
  const futureDays = chartData.filter(d => d.dayNum > currentDate.getDate());
  const futureWorkdays = futureDays.filter(d => d.isWorkday || !useWorkdaySettings);
  
  // Calculate current performance statistics excluding outliers
  const dailyOfferCounts = pastDays.map(d => d.offers || 0);
  const offersMean = dailyOfferCounts.length > 0
    ? dailyOfferCounts.reduce((sum, count) => sum + count, 0) / dailyOfferCounts.length
    : 0;
  
  const offersStdDev = dailyOfferCounts.length > 0
    ? Math.sqrt(
        dailyOfferCounts.reduce((sum, count) => sum + Math.pow(count - offersMean, 2), 0) / dailyOfferCounts.length
      )
    : 0;
  
  const filteredOfferCounts = dailyOfferCounts.filter(count => !isOutlier(count, offersMean, offersStdDev));
  
  const averageDailyOffers = filteredOfferCounts.length > 0
    ? filteredOfferCounts.reduce((sum, count) => sum + count, 0) / filteredOfferCounts.length
    : 0;
  
  const forecastTotalOffers = offerCount + futureWorkdays.reduce((sum, day) => {
    // Use day-specific forecast if available
    return sum + (day.forecast ?? averageDailyOffers);
  }, 0);
  
  const forecastTotal = Math.round(forecastTotalOffers);
  const onTrackToMeetGoal = forecastTotal >= monthlyGoal;
  const forecastPercentage = monthlyGoal > 0 ? Math.round((forecastTotal / monthlyGoal) * 100) : 0;
  
  // Also calculate forecast against adjusted goal
  const onTrackToMeetAdjustedGoal = forecastTotal >= adjustedMonthlyGoal;
  const adjustedForecastPercentage = adjustedMonthlyGoal > 0 ? Math.round((forecastTotal / adjustedMonthlyGoal) * 100) : 0;
  
  // Find milestones with improved accuracy
  const milestones = useMemo(() => {
    const milestonesList = [];
    
    // First day goal was met
    const firstDayGoalMet = chartData.find(day => day.metGoal);
    if (firstDayGoalMet) {
      milestonesList.push({
        day: firstDayGoalMet.dayNum,
        type: 'firstGoal',
        label: 'First day goal met'
      });
    }
    
    // Day with highest performance (if exceptional)
    const daysWithOffers = chartData.filter(day => (day.offers || 0) > 0);
    if (daysWithOffers.length > 0) {
      const highestDay = [...daysWithOffers].sort((a, b) => (b.offers || 0) - (a.offers || 0))[0];
      if (highestDay.isExceptional) {
        milestonesList.push({
          day: highestDay.dayNum,
          type: 'highest',
          label: `Record: ${highestDay.offers} offers (${Math.round((highestDay.offers || 0) / dailyGoal * 100)}% of goal)`
        });
      }
    }
    
    // Day when monthly goal was reached (if it happened)
    let runningTotal = 0;
    for (const day of chartData) {
      if (day.offers) {
        runningTotal += day.offers;
        if (runningTotal >= monthlyGoal && !milestonesList.some(m => m.type === 'monthlyGoal')) {
          milestonesList.push({
            day: day.dayNum,
            type: 'monthlyGoal',
            label: 'Monthly goal reached'
          });
          break;
        }
      }
    }
    
    return milestonesList;
  }, [chartData, monthlyGoal, dailyGoal]);

  // Determine progress color with more granularity
  const getProgressColor = () => {
    const progressToUse = adjustedGoal !== dailyGoal ? adjustedGoalProgress : goalProgress;
    
    if (progressToUse >= 200) return "bg-gradient-to-r from-purple-400 to-purple-600";
    if (progressToUse >= 150) return "bg-gradient-to-r from-blue-400 to-blue-600";
    if (progressToUse >= 100) return "bg-gradient-to-r from-green-400 to-green-600";
    if (progressToUse >= 80) return "bg-gradient-to-r from-amber-400 to-amber-600";
    if (progressToUse >= 60) return "bg-gradient-to-r from-orange-400 to-orange-600";
    return "bg-gradient-to-r from-red-400 to-red-600";
  };
  
  // Add a helper to format workdays
  const formatWorkdays = (days: number[]): string => {
    if (days.length === 7) return "every day";
    return days.map(day => getDayName(day, 'short')).join(', ');
  };

  return (
    <Card className="border glass-card border-border/30 bg-gradient-to-br from-card/90 to-card/70">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="text-lg font-medium bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            Monthly Goal Progress
          </CardTitle>
          
          {/* Comparative Analysis Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Compare:</span>
            <Tabs defaultValue="none" value={showPrevMonth ? "prev" : "none"} className="inline-flex h-8">
              <TabsList className="h-8 p-0 bg-transparent">
                <TabsTrigger 
                  value="none"
                  onClick={() => setShowPrevMonth(false)}
                  className="text-xs h-7 px-2 data-[state=active]:bg-muted/50"
                >
                  None
                </TabsTrigger>
                <TabsTrigger 
                  value="prev"
                  onClick={() => setShowPrevMonth(true)}
                  className="text-xs h-7 px-2 data-[state=active]:bg-muted/50"
                >
                  Last Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Main metrics - Left column */}
          <div className="md:col-span-3 flex flex-col items-center space-y-3">
            {/* Replace the circular progress with a modern gauge visualization */}
            <div className="w-full bg-muted/20 rounded-lg p-3 sm:p-4 relative overflow-hidden border border-border/10">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                  {adjustedGoal !== dailyGoal ? adjustedGoalProgress : goalProgress}%
                </div>
                <div className="w-full h-3 sm:h-4 bg-muted/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor()} transition-all duration-700 ease-in-out`} 
                    style={{ width: `${Math.min(100, adjustedGoal !== dailyGoal ? adjustedGoalProgress : goalProgress)}%` }}
                  />
                </div>
                
                {/* Progress status indicator */}
                <div className={`text-xs sm:text-sm font-medium ${
                  adjustedGoal !== dailyGoal
                    ? adjustedGoalProgress >= 100 
                      ? 'text-green-500' 
                      : adjustedGoalProgress >= 70 
                        ? 'text-amber-500' 
                        : 'text-red-500'
                    : goalProgress >= 100 
                      ? 'text-green-500' 
                      : goalProgress >= 70 
                        ? 'text-amber-500' 
                        : 'text-red-500'
                }`}>
                  {adjustedGoal !== dailyGoal
                    ? adjustedGoalProgress >= 200 ? 'Exceptional!' : 
                      adjustedGoalProgress >= 150 ? 'Outstanding!' :
                      adjustedGoalProgress >= 100 ? 'On Target' : 
                      adjustedGoalProgress >= 70 ? 'Getting Close' : 
                      'Needs Attention'
                    : goalProgress >= 200 ? 'Exceptional!' : 
                      goalProgress >= 150 ? 'Outstanding!' :
                      goalProgress >= 100 ? 'On Target' : 
                      goalProgress >= 70 ? 'Getting Close' : 
                      'Needs Attention'
                  }
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -right-4 -bottom-4 opacity-10">
                {(adjustedGoal !== dailyGoal ? adjustedGoalProgress : goalProgress) >= 100 ? (
                  <Trophy className="w-16 sm:w-20 h-16 sm:h-20 text-green-500" />
                ) : (
                  <Target className="w-16 sm:w-20 h-16 sm:h-20 text-amber-500" />
                )}
              </div>
            </div>

            {/* Quick metrics */}
            <div className="bg-muted/30 rounded-lg p-3 w-full space-y-2 text-left flex-1">
              <div className="flex items-center gap-2">
                <Target className="text-blue-500 h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Offers logged:</span>
                <span className="font-medium ml-auto">{offerCount}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Award className="text-amber-500 h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Monthly goal:</span>
                <span className="font-medium ml-auto">{monthlyGoal}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="text-indigo-500 h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Current target:</span>
                <span className="font-medium ml-auto">{currentExpectedGoal}</span>
              </div>
              
              <div className="flex items-start gap-2 mt-2">
                {isAhead ? (
                  <>
                    <Sparkles className="text-green-500 h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-md inline-block text-[11px] sm:text-xs break-words">
                        {difference} offers ahead of pace
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <ArrowUp className="text-amber-500 h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md inline-block text-[11px] sm:text-xs break-words max-w-full">
                        {difference} more needed to catch up
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Streak status (hidden on small screens) */}
            <div className="hidden md:block mb-6">
              <h3 className="text-lg font-medium mb-2">
                Streak Status
              </h3>
              <div>
                {streak > 0 ? (
                  <div className="space-y-1">
                    <div className="font-medium text-amber-600 dark:text-amber-400">
                      <span className="mr-1">🔥</span> {streak} day{streak !== 1 ? 's' : ''} streak!
                    </div>
                    <p className="text-sm">
                      {streak >= 7 ? "Amazing consistency! Keep going!" :
                      streak >= 3 ? "Building momentum! Don't break the chain!" :
                      "Great start! Keep it up!"}
                    </p>
                    {settings?.streakSettings?.countWorkdaysOnly && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on your work schedule: {formatWorkdays(settings.streakSettings.workdays || [1, 2, 3, 4, 5])}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-muted-foreground">No active streak</div>
                    <p className="text-sm">
                      Log an offer today to start a new streak!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chart and Analysis - Right column */}
          <div className="md:col-span-9 flex flex-col">
            {/* Performance Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-card/30 rounded-lg p-2 text-center border border-border/10">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Days Met Goal</div>
                <div className="text-base sm:text-lg font-bold">{daysMetGoal}/{daysPassedInMonth}</div>
              </div>
              <div className="bg-card/30 rounded-lg p-2 text-center border border-border/10">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Success Rate</div>
                <div className="text-base sm:text-lg font-bold">{successRate}%</div>
              </div>
              <div className="bg-card/30 rounded-lg p-2 text-center border border-border/10">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Exceptional Days</div>
                <div className="text-base sm:text-lg font-bold">{chartData.filter(d => d.isExceptional).length}</div>
              </div>
              <div className="bg-card/30 rounded-lg p-2 text-center border border-border/10">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Forecast</div>
                <div className="text-base sm:text-lg font-bold flex items-center justify-center">
                  {onTrackToMeetGoal ? (
                    <span className="text-green-500 flex items-center">
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5" /> On Track
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center">
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5" /> Below
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Interactive Goal Slider */}
            <div className="bg-card/30 rounded-lg p-3 sm:p-4 mb-3 border border-border/10">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs sm:text-sm font-medium">Adjust Daily Goal</div>
                <div className="text-xs font-medium">
                  {adjustedGoal} {adjustedGoal === 1 ? 'offer' : 'offers'}/day
                </div>
              </div>
              <Slider
                value={[adjustedGoal]}
                min={1}
                max={Math.max(10, dailyGoal * 2)}
                step={1}
                onValueChange={(values) => setAdjustedGoal(values[0])}
              />
              <div className="flex justify-between text-[10px] sm:text-xs mt-1 text-muted-foreground">
                <div>Easier</div>
                <div>Harder</div>
              </div>
              
              {/* Forecast with adjusted goal */}
              <div className="p-2 bg-background/50 rounded border border-border/10 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Forecast Statistics
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                    {adjustedGoal !== dailyGoal 
                      ? `${adjustedForecastPercentage}% of adjusted` 
                      : `${forecastPercentage}% of target`}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-medium">{offerCount} offers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-medium">
                        {adjustedGoal !== dailyGoal 
                          ? `${adjustedMonthlyGoal} offers` 
                          : `${monthlyGoal} offers`}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Projected:</span>
                      <span className="font-medium">{forecastTotal} offers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Avg/Day:</span>
                      <span className="font-medium">{averageDailyOffers.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Days Left:</span>
                      <span className="font-medium">{futureWorkdays.length} {useWorkdaySettings ? 'work days' : 'days'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Needed:</span>
                      <span className="font-medium">
                        {adjustedGoal !== dailyGoal
                          ? (onTrackToMeetAdjustedGoal 
                              ? 'On track!' 
                              : `${Math.ceil(adjustedMonthlyGoal - forecastTotal)} more`)
                          : (onTrackToMeetGoal 
                              ? 'On track!' 
                              : `${Math.ceil(monthlyGoal - forecastTotal)} more`)}
                      </span>
                    </div>
                  </div>
                  
                  {adjustedGoal !== dailyGoal && (
                    <div className="mt-2 pt-2 border-t border-border/10 text-xs">
                      <div className="flex items-center justify-between text-blue-500">
                        <span>Adjusted from {dailyGoal}/day</span>
                        <span>{Math.round((adjustedMonthlyGoal / monthlyGoal) * 100)}% of original</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Chart with mobile optimization */}
            <div className="overflow-x-auto sm:overflow-visible -mx-3 sm:mx-0 px-3 sm:px-0 pb-1">
              <div className="h-52 sm:h-60 w-full min-w-[480px] sm:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPrevMonth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      
                      {/* Pattern for streak highlighting */}
                      <pattern id="pattern-streak" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="4" height="4" fill="rgba(249, 115, 22, 0.05)"/>
                        <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="rgba(249, 115, 22, 0.2)" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9 }} 
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    
                    <YAxis 
                      tick={{ fontSize: 9 }} 
                      tickLine={false}
                      axisLine={false}
                      width={20}
                    />
                    
                    <Tooltip 
                      content={<CustomTooltip theme="light" />}
                      cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1 }}
                    />

                    {/* Goal Threshold Line */}
                    <ReferenceLine 
                      y={dailyGoal} 
                      stroke="#f97316" 
                      strokeDasharray="3 3" 
                      strokeWidth={1.5}
                      label={{ 
                        value: 'Goal', 
                        position: 'right', 
                        fill: '#f97316',
                        fontSize: 9
                      }}
                    />
                    
                    {/* Adjusted Goal Line (if different) */}
                    {adjustedGoal !== dailyGoal && (
                      <ReferenceLine 
                        y={adjustedGoal} 
                        stroke="#3b82f6" 
                        strokeDasharray="3 3" 
                        strokeWidth={1.5}
                        label={{ 
                          value: 'Adjusted', 
                          position: 'right', 
                          fill: '#3b82f6',
                          fontSize: 9
                        }}
                      />
                    )}
                    
                    {/* Milestone Markers */}
                    {milestones.map((milestone, idx) => (
                      <ReferenceLine 
                        key={idx}
                        x={milestone.day.toString()} 
                        stroke={
                          milestone.type === 'firstGoal' ? '#10b981' :
                          milestone.type === 'highest' ? '#8b5cf6' :
                          milestone.type === 'monthlyGoal' ? '#f59e0b' : '#94a3b8'
                        }
                        strokeWidth={1}
                        label={{ 
                          value: milestone.type === 'firstGoal' ? '🎯' : 
                                 milestone.type === 'highest' ? '🏆' : 
                                 milestone.type === 'monthlyGoal' ? '🎉' : '📌', 
                          position: 'insideBottomLeft',
                          dy: -10,
                          fontSize: 16,
                          fill: milestone.type === 'firstGoal' ? '#10b981' :
                                milestone.type === 'highest' ? '#8b5cf6' :
                                milestone.type === 'monthlyGoal' ? '#f59e0b' : '#94a3b8'
                        }}
                      />
                    ))}
                    
                    {/* Streak Periods */}
                    {streakPeriods.map((period, idx) => (
                      <rect
                        key={`streak-${idx}`}
                        x={`${period.start - 1}%`}
                        y="0%"
                        width={`${period.length}%`}
                        height="100%"
                        fill="url(#pattern-streak)"
                        fillOpacity={0.1}
                      />
                    ))}
                    
                    {/* Previous Month Data (if toggled on) */}
                    {showPrevMonth && (
                      <Line
                        type="monotone"
                        dataKey="prevMonth"
                        name="Last Month"
                        stroke="#94a3b8"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        dot={false}
                      />
                    )}
                    
                    {/* Forecast Line */}
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Forecast"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    
                    {/* Offers Line/Area */}
                    <Area 
                      type="monotone" 
                      dataKey="offers" 
                      name="Offers"
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorOffers)"
                      activeDot={(props) => {
                        const { cx, cy, payload } = props;
                        
                        // Determine if special dot
                        if (payload.isExceptional) {
                          return (
                            <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                                    fill="#8b5cf6" stroke="#7c3aed" strokeWidth="0.5" />
                            </svg>
                          );
                        }
                        
                        if (payload.isRecord) {
                          return (
                            <svg x={cx - 8} y={cy - 8} width={16} height={16} viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="9" fill="#3b82f6" stroke="#2563eb" strokeWidth="0.5" />
                              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">R</text>
                            </svg>
                          );
                        }
                        
                        // Default dot for days that met goal
                        if (payload.metGoal) {
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={5}
                              stroke="#3b82f6"
                              strokeWidth={1.5}
                              fill="#3b82f6"
                              fillOpacity={0.8}
                            />
                          );
                        }
                        
                        // Standard dot for normal days
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            stroke="#3b82f6"
                            strokeWidth={1}
                            fill="white"
                          />
                        );
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Legend for achievement markers */}
            <div className="flex flex-wrap gap-1 sm:gap-3 mt-2 text-[9px] sm:text-xs justify-center sm:justify-start">
              <div className="flex items-center">
                <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-purple-500" />
                <span>Exceptional</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-blue-500" />
                <span>Record</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-purple-500" />
                <span>Forecast</span>
              </div>
              {showPrevMonth && (
                <div className="flex items-center">
                  <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-gray-500" />
                  <span>Previous</span>
                </div>
              )}
            </div>
            
            {/* Streak status (mobile only) */}
            <div className="md:hidden mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  Streak: {streak} day{streak !== 1 ? 's' : ''}
                </div>
                {streak > 0 && (
                  <div className="text-amber-600 dark:text-amber-400">🔥</div>
                )}
              </div>
              {settings?.streakSettings?.countWorkdaysOnly && streak > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your {formatWorkdays(settings.streakSettings.workdays || [1, 2, 3, 4, 5])} schedule
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
