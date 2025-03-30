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
    // Only include offers that have valid conversion data
    const convertedOffers = offersToAnalyze.filter(o => 
      o.converted === true && 
      o.conversionDate && 
      o.date &&
      // Ensure conversion date is after offer date (avoid data errors)
      new Date(o.conversionDate).getTime() >= new Date(o.date).getTime()
    );
    
    if (convertedOffers.length === 0) {
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
      const conversionTime = new Date(offer.conversionDate!).getTime();
      const offerTime = new Date(offer.date).getTime();
      // Convert ms to hours
      return (conversionTime - offerTime) / (1000 * 60 * 60);
    });
    
    // Remove outliers (values more than 2 standard deviations from mean)
    const mean = conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length;
    const variance = conversionTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / conversionTimes.length;
    const stdDev = Math.sqrt(variance);
    const threshold = stdDev * 2;
    
    const filteredTimes = conversionTimes.filter(
      time => Math.abs(time - mean) <= threshold
    );
    
    const avgTimeToConvert = filteredTimes.length > 0 
      ? filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length
      : mean; // Fallback to mean if all were outliers

    // Calculate by channel with minimum sample threshold
    const channelTimes: Map<string, { total: number; count: number; times: number[] }> = new Map();
    convertedOffers.forEach(offer => {
      const conversionTime = new Date(offer.conversionDate!).getTime();
      const offerTime = new Date(offer.date).getTime();
      const timeToConvert = (conversionTime - offerTime) / (1000 * 60 * 60);
      
      if (!channelTimes.has(offer.channel)) {
        channelTimes.set(offer.channel, { total: 0, count: 0, times: [] });
      }
      
      const stats = channelTimes.get(offer.channel)!;
      stats.total += timeToConvert;
      stats.count++;
      stats.times.push(timeToConvert);
    });

    // Minimum 2 conversions required for channel metrics to be reliable
    const reliableChannels = Array.from(channelTimes.entries())
      .filter(([_, stats]) => stats.count >= 2)
      .map(([channel, stats]) => {
        // Remove outliers in each channel
        const channelMean = stats.total / stats.count;
        const channelVariance = stats.times.reduce((sum, time) => sum + Math.pow(time - channelMean, 2), 0) / stats.count;
        const channelStdDev = Math.sqrt(channelVariance);
        const channelThreshold = channelStdDev * 2;
        
        const filteredTimes = stats.times.filter(time => Math.abs(time - channelMean) <= channelThreshold);
        const adjustedAvg = filteredTimes.length > 0 
          ? filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length 
          : channelMean;
        
        return {
          name: channel,
          time: adjustedAvg,
          sampleSize: stats.count
        };
      })
      .sort((a, b) => a.time - b.time);

    const fastestChannel = reliableChannels.length > 0 
      ? reliableChannels[0] 
      : { name: 'Insufficient data', time: 0, sampleSize: 0 };

    // Calculate by hour of day
    const hourlyTimes = Array.from({ length: 24 }, () => ({ 
      total: 0, count: 0, conversions: 0, totalOffers: 0, times: [] as number[]
    }));
    
    offersToAnalyze.forEach(offer => {
      const hour = new Date(offer.date).getHours();
      const stats = hourlyTimes[hour];
      
      if (offer.converted && offer.conversionDate) {
        const conversionTime = new Date(offer.conversionDate).getTime();
        const offerTime = new Date(offer.date).getTime();
        const timeToConvert = (conversionTime - offerTime) / (1000 * 60 * 60);
        
        // Skip negative conversion times (data error)
        if (timeToConvert >= 0) {
          stats.total += timeToConvert;
          stats.count++;
          stats.conversions++;
          stats.times.push(timeToConvert);
        }
      }
      
      stats.totalOffers++;
    });

    const hourlyPerformance = hourlyTimes.map((stats, hour) => {
      // For hours with sufficient data, remove outliers
      let adjustedAvgTime = 0;
      if (stats.count >= 2) {
        const hourMean = stats.total / stats.count;
        const hourVariance = stats.times.reduce((sum, time) => sum + Math.pow(time - hourMean, 2), 0) / stats.count;
        const hourStdDev = Math.sqrt(hourVariance);
        const hourThreshold = hourStdDev * 2;
        
        const filteredTimes = stats.times.filter(time => Math.abs(time - hourMean) <= hourThreshold);
        adjustedAvgTime = filteredTimes.length > 0 
          ? filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length 
          : hourMean;
      } else if (stats.count === 1) {
        adjustedAvgTime = stats.total;
      }
      
      return {
        hour,
        avgTime: adjustedAvgTime,
        conversionRate: stats.totalOffers > 0 ? (stats.conversions / stats.totalOffers) * 100 : 0,
        sampleSize: stats.count
      };
    });

    // Find best time of day (minimum 2 conversions required)
    const reliableHours = hourlyPerformance
      .filter(h => h.sampleSize >= 2)
      .sort((a, b) => a.avgTime - b.avgTime);
      
    const bestTimeOfDay = reliableHours.length > 0
      ? { hour: reliableHours[0].hour, time: reliableHours[0].avgTime, sampleSize: reliableHours[0].sampleSize }
      : { hour: 0, time: 0, sampleSize: 0 };

    // Calculate by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyTimes = new Map(dayNames.map(day => [day, { 
      total: 0, count: 0, conversions: 0, totalOffers: 0, times: [] as number[]
    }]));
    
    offersToAnalyze.forEach(offer => {
      const dayName = dayNames[new Date(offer.date).getDay()];
      const stats = dailyTimes.get(dayName)!;
      
      if (offer.converted && offer.conversionDate) {
        const conversionTime = new Date(offer.conversionDate).getTime();
        const offerTime = new Date(offer.date).getTime();
        const timeToConvert = (conversionTime - offerTime) / (1000 * 60 * 60);
        
        // Skip negative conversion times (data error)
        if (timeToConvert >= 0) {
          stats.total += timeToConvert;
          stats.count++;
          stats.conversions++;
          stats.times.push(timeToConvert);
        }
      }
      
      stats.totalOffers++;
    });

    const dailyPerformance = Array.from(dailyTimes.entries()).map(([day, stats]) => {
      // For days with sufficient data, remove outliers
      let adjustedAvgTime = 0;
      if (stats.count >= 2) {
        const dayMean = stats.total / stats.count;
        const dayVariance = stats.times.reduce((sum, time) => sum + Math.pow(time - dayMean, 2), 0) / stats.count;
        const dayStdDev = Math.sqrt(dayVariance);
        const dayThreshold = dayStdDev * 2;
        
        const filteredTimes = stats.times.filter(time => Math.abs(time - dayMean) <= dayThreshold);
        adjustedAvgTime = filteredTimes.length > 0 
          ? filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length 
          : dayMean;
      } else if (stats.count === 1) {
        adjustedAvgTime = stats.total;
      }
      
      return {
        day,
        avgTime: adjustedAvgTime,
        conversionRate: stats.totalOffers > 0 ? (stats.conversions / stats.totalOffers) * 100 : 0,
        sampleSize: stats.count
      };
    });

    // Find best day of week (minimum 2 conversions required)
    const reliableDays = dailyPerformance
      .filter(d => d.sampleSize >= 2)
      .sort((a, b) => a.avgTime - b.avgTime);
      
    const bestDayOfWeek = reliableDays.length > 0
      ? { day: reliableDays[0].day, time: reliableDays[0].avgTime, sampleSize: reliableDays[0].sampleSize }
      : { day: 'Insufficient data', time: 0, sampleSize: 0 };

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