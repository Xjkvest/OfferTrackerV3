import React, { useMemo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { useOffers, Offer } from "@/context/OfferContext";
import { useFilters } from "@/context/FilterContext";
import { useUser } from "@/context/UserContext";
import { getFilteredOffers } from "@/utils/performanceUtils";
import { formatDateForStorage } from "@/utils/dateUtils";
import { motion } from "framer-motion";
import { Clock, Zap, Calendar, TrendingUp, MessageSquare } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

// Utility functions
const formatTime = (hours: number): string => {
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  return `${Math.round(hours / 24)}d`;
};

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  icon: ReactNode;
  tooltip?: string;
  isDark?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subvalue, icon, tooltip, isDark }) => {
  return (
    <div className={cn(
      "p-4 rounded-lg border",
      isDark 
        ? "bg-gray-800 border-gray-700" 
        : "bg-gray-50 border-gray-100"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn(
          "text-sm font-medium",
          isDark ? "text-gray-300" : "text-gray-700"
        )}>{title}</h3>
        <div className="text-gray-500">{icon}</div>
      </div>
      <div className={cn(
        "text-xl font-bold",
        isDark ? "text-gray-100" : "text-gray-900"
      )}>{value}</div>
      {subvalue && (
        <div className={cn(
          "text-sm mt-1",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>{subvalue}</div>
      )}
      {tooltip && (
        <div className={cn(
          "text-xs mt-2",
          isDark ? "text-gray-500" : "text-gray-400"
        )}>{tooltip}</div>
      )}
    </div>
  );
};

interface VelocityMetrics {
  avgTimeToConvert: number;
  fastestChannel: {
    name: string;
    time: number;
    sampleSize: number;
  };
  bestTimeOfDay: {
    hour: number;
    time: number;
    sampleSize: number;
  };
  bestDayOfWeek: {
    day: string;
    time: number;
    sampleSize: number;
  };
  hourlyPerformance: Array<{
    hour: number;
    avgTime: number;
    conversionRate: number;
    sampleSize: number;
  }>;
  dailyPerformance: Array<{
    day: string;
    avgTime: number;
    conversionRate: number;
    sampleSize: number;
  }>;
}

interface ConversionVelocityAnalysisProps {
  filteredOffers: Offer[];
}

export const ConversionVelocityAnalysis: React.FC<ConversionVelocityAnalysisProps> = ({ 
  filteredOffers
}) => {
  const { offers } = useOffers();
  const { channels } = useUser();
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Chart theme colors based on theme
  const chartTheme = useMemo(() => ({
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    textColor: isDark ? '#d1d5db' : '#374151',
    grid: {
      line: {
        stroke: isDark ? '#374151' : '#e5e7eb'
      }
    },
    axis: {
      domain: {
        line: {
          stroke: isDark ? '#4b5563' : '#9ca3af'
        }
      },
      ticks: {
        line: {
          stroke: isDark ? '#4b5563' : '#d1d5db'
        }
      }
    },
    tooltip: {
      container: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
        color: isDark ? '#f3f4f6' : '#111827'
      }
    },
    bars: {
      primary: isDark ? '#a78bfa' : '#8884d8', // Purple
      secondary: isDark ? '#6ee7b7' : '#82ca9d', // Green
    },
    fontSize: isDark ? 12 : 12
  }), [isDark]);

  // Get filtered offers
  const localFilteredOffers = useMemo(() => {
    return getFilteredOffers(
      offers,
      filters.dateRange.start && filters.dateRange.end 
        ? { 
            start: filters.dateRange.start instanceof Date 
              ? formatDateForStorage(filters.dateRange.start) 
              : String(filters.dateRange.start), 
            end: filters.dateRange.end instanceof Date 
              ? formatDateForStorage(filters.dateRange.end) 
              : String(filters.dateRange.end) 
          } 
        : null,
      filters.channels.length > 0 ? filters.channels : null,
      filters.offerTypes.length > 0 ? filters.offerTypes : null,
      filters.csat ? filters.csat[0] : null,
      filters.converted,
      filters.hasFollowup
    );
  }, [offers, filters]);

  // Choose which filtered offers to use
  const offersToAnalyze = filteredOffers || localFilteredOffers;

  // Calculate velocity metrics
  const velocityMetrics = useMemo(() => {
    // Debug logging to identify issues
    console.log('[ConversionVelocity] Total offers to analyze:', offersToAnalyze.length);
    
    // Log conversion status distribution
    const convertedCount = offersToAnalyze.filter(o => o.converted === true).length;
    const unconvertedCount = offersToAnalyze.filter(o => o.converted === false).length;
    const undefinedCount = offersToAnalyze.filter(o => o.converted === undefined).length;
    console.log('[ConversionVelocity] Conversion status distribution:', {
      convertedCount,
      unconvertedCount,
      undefinedCount,
      total: convertedCount + unconvertedCount + undefinedCount
    });
    
    // Check for conversion dates
    const withConversionDate = offersToAnalyze.filter(o => o.converted && o.conversionDate).length;
    const withoutConversionDate = offersToAnalyze.filter(o => o.converted && !o.conversionDate).length;
    console.log('[ConversionVelocity] Conversion date presence:', {
      withConversionDate,
      withoutConversionDate
    });
    
    // Only include offers that have valid conversion data - RELAXED VALIDATION
    const convertedOffers = offersToAnalyze.filter(o => {
      // Require converted flag to be true
      if (o.converted !== true) {
        return false;
      }
      
      // If no conversionDate, can't calculate velocity
      if (!o.conversionDate) {
        console.debug('[ConversionVelocity] Offer is marked as converted but missing conversionDate:', o.id);
        return false;
      }
      
      // If no offer date, can't calculate velocity
      if (!o.date) {
        console.debug('[ConversionVelocity] Offer is missing date field:', o.id);
        return false;
      }
      
      // Try to parse the dates, but don't strictly validate
      try {
        const convDate = new Date(o.conversionDate);
        const offerDate = new Date(o.date);
        
        // Allow any non-NaN dates regardless of relation between them
        if (isNaN(convDate.getTime())) {
          console.debug('[ConversionVelocity] Invalid conversion date format:', o.conversionDate, 'for offer:', o.id);
          return false;
        }
        
        if (isNaN(offerDate.getTime())) {
          console.debug('[ConversionVelocity] Invalid offer date format:', o.date, 'for offer:', o.id);
          return false;
        }
        
        // Even if conversionDate is before offerDate, still include it but log the issue
        if (convDate < offerDate) {
          console.warn(
            '[ConversionVelocity] Conversion date is before offer date:',
            'id:', o.id,
            'offerDate:', offerDate.toISOString(),
            'conversionDate:', convDate.toISOString()
          );
          // Still return true to include it in analysis
        }
        
        return true;
      } catch (e) {
        console.error('[ConversionVelocity] Error parsing dates for offer:', o.id, e);
        return false;
      }
    });
    
    console.log('[ConversionVelocity] Valid converted offers for analysis:', convertedOffers.length);
    
    if (convertedOffers.length === 0) {
      console.debug('[ConversionVelocity] No valid converted offers found for analysis');
      // Return default empty state if no valid offers
      return {
        avgTimeToConvert: 0,
        fastestChannel: { name: 'No data', time: 0, sampleSize: 0 },
        bestTimeOfDay: { hour: 0, time: 0, sampleSize: 0 },
        bestDayOfWeek: { day: 'No data', time: 0, sampleSize: 0 },
        hourlyPerformance: Array(24).fill(0).map((_, hour) => ({ 
          hour, avgTime: 0, conversionRate: 0, sampleSize: 0 
        })),
        dailyPerformance: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          .map(day => ({ day, avgTime: 0, conversionRate: 0, sampleSize: 0 }))
      };
    }
    
    // Calculate average time to convert (in hours)
    const conversionTimes = convertedOffers.map(offer => {
      const conversionDate = new Date(offer.conversionDate!);
      const offerDate = new Date(offer.date);
      
      // Handle case where conversion is before offer date (data error)
      // Instead of negative time, use a small positive value
      if (conversionDate < offerDate) {
        console.warn('[ConversionVelocity] Using minimum time for offer with conversion before offer date:', offer.id);
        return 0.1; // 6 minutes as minimum time
      }
      
      const timeToConvert = Math.max(0.1, (conversionDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60));
      
      if (timeToConvert > 720) { // More than 30 days
        console.debug(
          '[ConversionVelocity] Long conversion time detected:',
          'id:', offer.id,
          'timeToConvert:', timeToConvert,
          'hours (~', Math.round(timeToConvert / 24), 'days)'
        );
      }
      
      return timeToConvert;
    });
    
    // Log conversion time statistics
    if (conversionTimes.length > 0) {
      const minTime = Math.min(...conversionTimes);
      const maxTime = Math.max(...conversionTimes);
      const avgTime = conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length;
      console.log('[ConversionVelocity] Conversion time statistics (hours):', {
        min: minTime,
        max: maxTime,
        avg: avgTime,
        samples: conversionTimes.length
      });
    }
    
    // Remove outliers (values more than 2 standard deviations from mean)
    // BUT ONLY IF WE HAVE ENOUGH DATA POINTS
    let filteredTimes = conversionTimes;
    if (conversionTimes.length >= 5) {
      const mean = conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length;
      const variance = conversionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / conversionTimes.length;
      const stdDev = Math.sqrt(variance);
      const threshold = stdDev * 2;
      
      filteredTimes = conversionTimes.filter(
        time => Math.abs(time - mean) <= threshold
      );
      
      console.log('[ConversionVelocity] Outlier filtering:', {
        originalCount: conversionTimes.length,
        filteredCount: filteredTimes.length,
        mean,
        stdDev,
        threshold
      });
    } else {
      console.log('[ConversionVelocity] Not enough data for outlier filtering (need at least 5 points)');
    }
    
    const avgTimeToConvert = filteredTimes.length > 0 
      ? filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length
      : conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length; // Fallback to mean if all were outliers
    
    // Calculate by channel with minimum sample threshold
    const channelTimes: Map<string, { total: number; count: number; times: number[] }> = new Map();
    convertedOffers.forEach(offer => {
      const conversionDate = new Date(offer.conversionDate!);
      const offerDate = new Date(offer.date);
      
      // Skip invalid dates but log them
      if (isNaN(conversionDate.getTime()) || isNaN(offerDate.getTime())) {
        console.warn('[ConversionVelocity] Skipping offer with invalid dates:', offer.id);
        return;
      }
      
      // Use a minimum time for negative values (when conversion date is before offer date)
      let timeToConvert = (conversionDate.getTime() - offerDate.getTime()) / (1000 * 60 * 60);
      if (timeToConvert < 0) {
        console.warn('[ConversionVelocity] Negative conversion time, using minimum:', offer.id);
        timeToConvert = 0.1; // 6 minutes minimum
      }
      
      // Ensure we have a valid channel
      const channel = offer.channel || 'Unknown';
      
      if (!channelTimes.has(channel)) {
        channelTimes.set(channel, { total: 0, count: 0, times: [] });
      }
      
      const entry = channelTimes.get(channel)!;
      entry.total += timeToConvert;
      entry.count += 1;
      entry.times.push(timeToConvert);
    });
    
    // Find fastest channel with at least 3 conversions
    const channelAverages = Array.from(channelTimes.entries())
      .map(([name, { total, count, times }]) => {
        // Calculate median instead of mean if we have enough data points
        let avgTime = count > 0 ? total / count : 0;
        
        // For channels with at least 5 data points, use median instead
        if (times.length >= 5) {
          times.sort((a, b) => a - b);
          const midPoint = Math.floor(times.length / 2);
          if (times.length % 2 === 0) {
            avgTime = (times[midPoint - 1] + times[midPoint]) / 2;
          } else {
            avgTime = times[midPoint];
          }
        }
        
        return { name, time: avgTime, sampleSize: count };
      })
      .filter(channel => channel.sampleSize >= 1) // Reduce requirement to just 1 conversion
      .sort((a, b) => a.time - b.time);
    
    const fastestChannel = channelAverages[0] || { name: 'No data', time: 0, sampleSize: 0 };
    
    console.log('[ConversionVelocity] Channel analysis:', channelAverages);
    
    // Calculate by hour of day (0-23)
    const hourlyTimes: { [hour: number]: { total: number; count: number; converted: number; total_offers: number } } = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyTimes[i] = { total: 0, count: 0, converted: 0, total_offers: 0 };
    }
    
    // Count all offers by hour for denominator in conversion rate
    offersToAnalyze.forEach(offer => {
      try {
        const offerTime = new Date(offer.date);
        if (!isNaN(offerTime.getTime())) {
          const hour = offerTime.getHours();
          hourlyTimes[hour].total_offers += 1;
        }
      } catch (e) {
        console.error('[ConversionVelocity] Error processing offer for hourly analysis:', e);
      }
    });
    
    // Process converted offers for numerator
    convertedOffers.forEach(offer => {
      try {
        const offerTime = new Date(offer.date);
        const conversionTime = new Date(offer.conversionDate!);
        
        if (isNaN(offerTime.getTime()) || isNaN(conversionTime.getTime())) {
          return;
        }
        
        const hour = offerTime.getHours();
        let timeToConvert = (conversionTime.getTime() - offerTime.getTime()) / (1000 * 60 * 60);
        
        // Handle negative times (data errors)
        if (timeToConvert < 0) {
          timeToConvert = 0.1;
        }
        
        hourlyTimes[hour].total += timeToConvert;
        hourlyTimes[hour].count += 1;
        hourlyTimes[hour].converted += 1;
      } catch (e) {
        console.error('[ConversionVelocity] Error in hourly conversion calculation:', e);
      }
    });
    
    // Find best hour with at least 1 conversion
    const hourlyPerformance = Object.entries(hourlyTimes).map(([hourStr, { total, count, converted, total_offers }]) => {
      const hour = parseInt(hourStr);
      const avgTime = count > 0 ? total / count : 0;
      const conversionRate = total_offers > 0 ? (converted / total_offers) * 100 : 0;
      return { hour, avgTime, conversionRate, sampleSize: count };
    });
    
    // Sort by conversion time (ascending)
    const sortedHourlyByTime = [...hourlyPerformance]
      .filter(h => h.sampleSize > 0)
      .sort((a, b) => a.avgTime - b.avgTime);
    
    const bestTimeOfDay = sortedHourlyByTime.length > 0
      ? { hour: sortedHourlyByTime[0].hour, time: sortedHourlyByTime[0].avgTime, sampleSize: sortedHourlyByTime[0].sampleSize }
      : { hour: 0, time: 0, sampleSize: 0 };
    
    console.log('[ConversionVelocity] Hourly performance:', hourlyPerformance);
    
    // Calculate by day of week (0 = Sunday, 6 = Saturday)
    const dailyTimes: { [day: string]: { total: number; count: number; converted: number; total_offers: number } } = {
      'Sunday': { total: 0, count: 0, converted: 0, total_offers: 0 },
      'Monday': { total: 0, count: 0, converted: 0, total_offers: 0 },
      'Tuesday': { total: 0, count: 0, converted: 0, total_offers: 0 },
      'Wednesday': { total: 0, count: 0, converted: 0, total_offers: 0 },
      'Thursday': { total: 0, count: 0, converted: 0, total_offers: 0 },
      'Friday': { total: 0, count: 0, converted: 0, total_offers: 0 },
      'Saturday': { total: 0, count: 0, converted: 0, total_offers: 0 },
    };
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Count all offers by day for denominator in conversion rate
    offersToAnalyze.forEach(offer => {
      try {
        const offerTime = new Date(offer.date);
        if (!isNaN(offerTime.getTime())) {
          const dayIndex = offerTime.getDay();
          const day = dayNames[dayIndex];
          dailyTimes[day].total_offers += 1;
        }
      } catch (e) {
        console.error('[ConversionVelocity] Error processing offer for daily analysis:', e);
      }
    });
    
    // Process converted offers for numerator and conversion time
    convertedOffers.forEach(offer => {
      try {
        const offerTime = new Date(offer.date);
        const conversionTime = new Date(offer.conversionDate!);
        
        if (isNaN(offerTime.getTime()) || isNaN(conversionTime.getTime())) {
          return;
        }
        
        const dayIndex = offerTime.getDay();
        const day = dayNames[dayIndex];
        let timeToConvert = (conversionTime.getTime() - offerTime.getTime()) / (1000 * 60 * 60);
        
        // Handle negative times (data errors)
        if (timeToConvert < 0) {
          timeToConvert = 0.1;
        }
        
        dailyTimes[day].total += timeToConvert;
        dailyTimes[day].count += 1;
        dailyTimes[day].converted += 1;
      } catch (e) {
        console.error('[ConversionVelocity] Error in daily conversion calculation:', e);
      }
    });
    
    // Map to array for easier processing
    const dailyPerformance = Object.entries(dailyTimes).map(([day, { total, count, converted, total_offers }]) => {
      const avgTime = count > 0 ? total / count : 0;
      const conversionRate = total_offers > 0 ? (converted / total_offers) * 100 : 0;
      return { day, avgTime, conversionRate, sampleSize: count };
    });
    
    // Find best day
    const sortedDailyByTime = [...dailyPerformance]
      .filter(d => d.sampleSize > 0)
      .sort((a, b) => a.avgTime - b.avgTime);
    
    const bestDayOfWeek = sortedDailyByTime.length > 0
      ? { day: sortedDailyByTime[0].day, time: sortedDailyByTime[0].avgTime, sampleSize: sortedDailyByTime[0].sampleSize }
      : { day: 'No data', time: 0, sampleSize: 0 };
    
    console.log('[ConversionVelocity] Daily performance:', dailyPerformance);

    return {
      avgTimeToConvert,
      fastestChannel,
      bestTimeOfDay,
      bestDayOfWeek,
      hourlyPerformance,
      dailyPerformance
    };
  }, [offersToAnalyze]);

  return (
    <div className={cn(
      "p-6 rounded-xl shadow-sm",
      isDark ? "bg-gray-900" : "bg-white"
    )}>
      <h2 className={cn(
        "text-xl font-semibold mb-6",
        isDark ? "text-white" : "text-gray-900"
      )}>Conversion Velocity Analysis</h2>
      
      {offersToAnalyze.length === 0 ? (
        <div className={cn(
          "text-center py-8",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>
          No offer data available for analysis
        </div>
      ) : offersToAnalyze.filter(o => o.converted && o.conversionDate).length === 0 ? (
        <div className={cn(
          "text-center py-8",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>
          No conversion data available for analysis
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Average Time to Convert"
              value={formatTime(velocityMetrics.avgTimeToConvert)}
              icon={<Clock className="h-5 w-5 text-blue-500" />}
              tooltip="Average time from offer creation to conversion"
              isDark={isDark}
            />
            
            <MetricCard
              title="Fastest Channel"
              value={velocityMetrics.fastestChannel.name}
              subvalue={formatTime(velocityMetrics.fastestChannel.time)}
              icon={<MessageSquare className="h-5 w-5 text-green-500" />}
              tooltip={`Based on ${velocityMetrics.fastestChannel.sampleSize || 0} conversions`}
              isDark={isDark}
            />
            
            <MetricCard
              title="Best Time of Day"
              value={formatHour(velocityMetrics.bestTimeOfDay.hour)}
              subvalue={formatTime(velocityMetrics.bestTimeOfDay.time)}
              icon={<Clock className="h-5 w-5 text-purple-500" />}
              tooltip={`Based on ${velocityMetrics.bestTimeOfDay.sampleSize || 0} conversions`}
              isDark={isDark}
            />
            
            <MetricCard
              title="Best Day of Week"
              value={velocityMetrics.bestDayOfWeek.day}
              subvalue={formatTime(velocityMetrics.bestDayOfWeek.time)}
              icon={<Calendar className="h-5 w-5 text-amber-500" />}
              tooltip={`Based on ${velocityMetrics.bestDayOfWeek.sampleSize || 0} conversions`}
              isDark={isDark}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className={cn(
                "text-lg font-medium mb-4",
                isDark ? "text-gray-200" : "text-gray-900"
              )}>Conversion Time by Hour of Day</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={velocityMetrics.hourlyPerformance.filter(h => h.sampleSize > 0)}
                    margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={chartTheme.grid.line.stroke} 
                    />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={formatHour}
                      label={{ 
                        value: 'Hour of Day', 
                        position: 'insideBottom', 
                        offset: -5,
                        fill: chartTheme.textColor
                      }}
                      tick={{ fill: chartTheme.textColor }}
                      axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
                      tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Hours to Convert', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: chartTheme.textColor
                      }}
                      tick={{ fill: chartTheme.textColor }}
                      axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
                      tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'avgTime' ? formatTime(value as number) : `${value}%`,
                        name === 'avgTime' ? 'Avg Time to Convert' : 'Conversion Rate'
                      ]}
                      labelFormatter={label => `Hour: ${formatHour(label as number)}`}
                      contentStyle={chartTheme.tooltip.container}
                      labelStyle={{ fontWeight: 'bold', color: chartTheme.tooltip.container.color }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        color: chartTheme.textColor, 
                        fontSize: chartTheme.fontSize 
                      }} 
                    />
                    <Bar 
                      name="Avg Time to Convert" 
                      dataKey="avgTime" 
                      fill={chartTheme.bars.primary}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      name="Conversion Rate (%)" 
                      dataKey="conversionRate" 
                      fill={chartTheme.bars.secondary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className={cn(
                "text-lg font-medium mb-4",
                isDark ? "text-gray-200" : "text-gray-900"
              )}>Conversion Time by Day of Week</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={velocityMetrics.dailyPerformance.filter(d => d.sampleSize > 0)}
                    margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={chartTheme.grid.line.stroke} 
                    />
                    <XAxis 
                      dataKey="day"
                      label={{ 
                        value: 'Day of Week', 
                        position: 'insideBottom', 
                        offset: -5,
                        fill: chartTheme.textColor 
                      }}
                      tick={{ fill: chartTheme.textColor }}
                      axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
                      tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Hours to Convert', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: chartTheme.textColor 
                      }}
                      tick={{ fill: chartTheme.textColor }}
                      axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
                      tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'avgTime' ? formatTime(value as number) : `${value}%`,
                        name === 'avgTime' ? 'Avg Time to Convert' : 'Conversion Rate'
                      ]}
                      labelFormatter={label => `${label}`}
                      contentStyle={chartTheme.tooltip.container}
                      labelStyle={{ fontWeight: 'bold', color: chartTheme.tooltip.container.color }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        color: chartTheme.textColor, 
                        fontSize: chartTheme.fontSize 
                      }} 
                    />
                    <Bar 
                      name="Avg Time to Convert" 
                      dataKey="avgTime" 
                      fill={chartTheme.bars.primary}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      name="Conversion Rate (%)" 
                      dataKey="conversionRate" 
                      fill={chartTheme.bars.secondary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 