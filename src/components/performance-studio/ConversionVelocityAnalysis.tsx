import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { useOffers } from "@/context/OfferContext";
import { useFilters } from "@/context/FilterContext";
import { useUser } from "@/context/UserContext";
import { getFilteredOffers } from "@/utils/trendAnalysis";
import { formatDateForStorage } from "@/utils/dateUtils";
import { motion } from "framer-motion";
import { Clock, Zap, Calendar, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface VelocityMetrics {
  avgTimeToConvert: number;
  fastestChannel: {
    name: string;
    time: number;
  };
  bestTimeOfDay: {
    hour: number;
    time: number;
  };
  bestDayOfWeek: {
    day: string;
    time: number;
  };
  hourlyPerformance: Array<{
    hour: number;
    avgTime: number;
    conversionRate: number;
  }>;
  dailyPerformance: Array<{
    day: string;
    avgTime: number;
    conversionRate: number;
  }>;
}

export const ConversionVelocityAnalysis: React.FC = () => {
  const { offers } = useOffers();
  const { channels } = useUser();
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get filtered offers
  const filteredOffers = useMemo(() => {
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

  // Calculate velocity metrics
  const velocityMetrics = useMemo(() => {
    const convertedOffers = filteredOffers.filter(o => o.converted && o.conversionDate);
    
    // Calculate average time to convert
    const totalTime = convertedOffers.reduce((sum, offer) => {
      const conversionTime = new Date(offer.conversionDate!).getTime();
      const offerTime = new Date(offer.date).getTime();
      return sum + (conversionTime - offerTime);
    }, 0);
    
    const avgTimeToConvert = convertedOffers.length > 0 
      ? totalTime / (convertedOffers.length * 1000 * 60 * 60) // Convert to hours
      : 0;

    // Calculate by channel
    const channelTimes = new Map<string, { total: number; count: number }>();
    convertedOffers.forEach(offer => {
      const conversionTime = new Date(offer.conversionDate!).getTime();
      const offerTime = new Date(offer.date).getTime();
      const timeToConvert = (conversionTime - offerTime) / (1000 * 60 * 60);
      
      if (!channelTimes.has(offer.channel)) {
        channelTimes.set(offer.channel, { total: 0, count: 0 });
      }
      
      const stats = channelTimes.get(offer.channel)!;
      stats.total += timeToConvert;
      stats.count++;
    });

    const fastestChannel = Array.from(channelTimes.entries())
      .map(([channel, stats]) => ({
        name: channel,
        time: stats.total / stats.count
      }))
      .sort((a, b) => a.time - b.time)[0] || { name: 'N/A', time: 0 };

    // Calculate by hour of day
    const hourlyTimes = new Array(24).fill({ total: 0, count: 0, conversions: 0, totalOffers: 0 });
    filteredOffers.forEach(offer => {
      const hour = new Date(offer.date).getHours();
      const stats = hourlyTimes[hour];
      
      if (offer.converted && offer.conversionDate) {
        const conversionTime = new Date(offer.conversionDate).getTime();
        const offerTime = new Date(offer.date).getTime();
        const timeToConvert = (conversionTime - offerTime) / (1000 * 60 * 60);
        
        hourlyTimes[hour] = {
          total: stats.total + timeToConvert,
          count: stats.count + 1,
          conversions: stats.conversions + 1,
          totalOffers: stats.totalOffers + 1
        };
      } else {
        hourlyTimes[hour] = {
          ...stats,
          totalOffers: stats.totalOffers + 1
        };
      }
    });

    const hourlyPerformance = hourlyTimes.map((stats, hour) => ({
      hour,
      avgTime: stats.count > 0 ? stats.total / stats.count : 0,
      conversionRate: stats.totalOffers > 0 ? (stats.conversions / stats.totalOffers) * 100 : 0
    }));

    const bestTimeOfDay = hourlyPerformance
      .sort((a, b) => a.avgTime - b.avgTime)[0] || { hour: 0, avgTime: 0 };

    // Calculate by day of week
    const dailyTimes = new Map<string, { total: number; count: number; conversions: number; totalOffers: number }>();
    filteredOffers.forEach(offer => {
      const day = new Date(offer.date).toLocaleDateString('en-US', { weekday: 'long' });
      
      if (!dailyTimes.has(day)) {
        dailyTimes.set(day, { total: 0, count: 0, conversions: 0, totalOffers: 0 });
      }
      
      const stats = dailyTimes.get(day)!;
      
      if (offer.converted && offer.conversionDate) {
        const conversionTime = new Date(offer.conversionDate).getTime();
        const offerTime = new Date(offer.date).getTime();
        const timeToConvert = (conversionTime - offerTime) / (1000 * 60 * 60);
        
        stats.total += timeToConvert;
        stats.count++;
        stats.conversions++;
      }
      
      stats.totalOffers++;
    });

    const dailyPerformance = Array.from(dailyTimes.entries()).map(([day, stats]) => ({
      day,
      avgTime: stats.count > 0 ? stats.total / stats.count : 0,
      conversionRate: stats.totalOffers > 0 ? (stats.conversions / stats.totalOffers) * 100 : 0
    }));

    const bestDayOfWeek = dailyPerformance
      .sort((a, b) => a.avgTime - b.avgTime)[0] || { day: 'N/A', avgTime: 0 };

    return {
      avgTimeToConvert,
      fastestChannel,
      bestTimeOfDay: {
        hour: bestTimeOfDay.hour,
        time: bestTimeOfDay.avgTime
      },
      bestDayOfWeek: {
        day: bestDayOfWeek.day,
        time: bestDayOfWeek.avgTime
      },
      hourlyPerformance,
      dailyPerformance
    };
  }, [filteredOffers]);

  const formatTime = (hours: number): string => {
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }
    return `${Math.round(hours / 24)}d`;
  };

  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Conversion Velocity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Avg Time to Convert</span>
                </div>
                <div className="text-2xl font-bold">{formatTime(velocityMetrics.avgTimeToConvert)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Fastest Channel</span>
                </div>
                <div className="text-2xl font-bold">{velocityMetrics.fastestChannel.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(velocityMetrics.fastestChannel.time)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Best Time</span>
                </div>
                <div className="text-2xl font-bold">{formatHour(velocityMetrics.bestTimeOfDay.hour)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(velocityMetrics.bestTimeOfDay.time)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Best Day</span>
                </div>
                <div className="text-2xl font-bold">{velocityMetrics.bestDayOfWeek.day}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(velocityMetrics.bestDayOfWeek.time)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={velocityMetrics.hourlyPerformance}>
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={formatHour}
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={formatTime}
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}%`}
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          color: isDark ? "#e5e7eb" : "#374151"
                        }}
                        formatter={(value: number, name: string) => [
                          name === "avgTime" ? formatTime(value) : `${value.toFixed(1)}%`,
                          name === "avgTime" ? "Avg Time" : "Conversion Rate"
                        ]}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="avgTime" 
                        name="Avg Time"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="conversionRate" 
                        name="Conversion Rate"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={velocityMetrics.dailyPerformance}>
                      <XAxis 
                        dataKey="day"
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis 
                        yAxisId="left"
                        tickFormatter={formatTime}
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}%`}
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDark ? "#1f2937" : "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          color: isDark ? "#e5e7eb" : "#374151"
                        }}
                        formatter={(value: number, name: string) => [
                          name === "avgTime" ? formatTime(value) : `${value.toFixed(1)}%`,
                          name === "avgTime" ? "Avg Time" : "Conversion Rate"
                        ]}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="avgTime" 
                        name="Avg Time"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="conversionRate" 
                        name="Conversion Rate"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 