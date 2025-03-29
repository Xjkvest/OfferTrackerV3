import React, { useMemo, useState, useEffect } from "react";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { useFilters } from "@/context/FilterContext";
import { Card, CardContent } from "@/components/ui/card";
import { FilterBar } from "./FilterBar";
import { 
  getFilteredOffers, 
  getConversionByTypeData, 
  getCsatByChannelData,
  getConversionsByChannelData,
  getConversionCountByTypeData,
  getConversionCountByChannelData
} from "@/utils/trendAnalysis";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateForStorage } from "@/utils/dateUtils";
import { ModernAnalyticsCard } from "@/components/charts/ModernAnalyticsCard";
import { TrendsLineChart } from "@/components/charts/TrendsLineChart";
import { TrendsBarChart } from "@/components/charts/TrendsBarChart";
import { ConversionVelocityAnalysis } from "./ConversionVelocityAnalysis";
import { 
  TrendingUp, 
  BarChart2, 
  PieChart,
  Target,
  Users,
  Star,
  ArrowUpRight,
  Clock,
  Calendar,
  Zap
} from "lucide-react";
import { KeyInsightsDashboard } from "./KeyInsightsDashboard";

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#84cc16', // lime
  '#6366f1'  // indigo
];

export const TrendsBreakdown: React.FC = () => {
  const { offers, isLoading: offersLoading } = useOffers();
  const { channels, offerTypes } = useUser();
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isDark = theme === 'dark';
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
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

  // Calculate daily trends data
  const dailyTrendsData = useMemo(() => {
    const dateMap = new Map<string, { 
      date: string;
      offers: number;
      conversions: number;
      trend?: number;
    }>();
    
    // Sort offers by date
    const sortedOffers = [...filteredOffers].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group by date
    sortedOffers.forEach(offer => {
      const dateKey = new Date(offer.date).toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { 
          date: dateKey, 
          offers: 0, 
          conversions: 0 
        });
      }
      
      const entry = dateMap.get(dateKey)!;
      entry.offers++;
      if (offer.converted) {
        entry.conversions++;
      }
    });
    
    // Convert to array and calculate trend
    const data = Array.from(dateMap.values());
    
    // Calculate 7-day moving average
    data.forEach((item, index) => {
      if (index >= 6) {
        const weekData = data.slice(index - 6, index + 1);
        const avgOffers = weekData.reduce((sum, day) => sum + day.offers, 0) / 7;
        item.trend = Math.round(avgOffers);
      }
    });
    
    return data;
  }, [filteredOffers]);

  // Calculate conversion metrics
  const conversionMetrics = useMemo(() => {
    const totalOffers = filteredOffers.length;
    const totalConversions = filteredOffers.filter(o => o.converted).length;
    const conversionRate = totalOffers > 0 
      ? (totalConversions / totalOffers) * 100 
      : 0;
    
    // Get conversion rate by channel
    const channelConversions = getConversionsByChannelData(filteredOffers, channels);
    const topChannel = channelConversions[0] || { name: 'N/A', value: 0 };
    
    // Get conversion rate by type
    const typeConversions = getConversionByTypeData(filteredOffers, offerTypes);
    const topType = typeConversions[0] || { name: 'N/A', value: 0 };
    
    return {
      total: totalConversions,
      rate: conversionRate,
      topChannel,
      topType
    };
  }, [filteredOffers, channels, offerTypes]);

  // Calculate time-based metrics
  const timeMetrics = useMemo(() => {
    const byHour = {} as Record<number, number>;
    const byDay = {} as Record<string, number>;
    
    filteredOffers.forEach(offer => {
      const date = new Date(offer.date);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      byHour[hour] = (byHour[hour] || 0) + 1;
      byDay[day] = (byDay[day] || 0) + 1;
    });
    
    // Get peak hour
    const peakHour = Object.entries(byHour)
      .sort(([,a], [,b]) => b - a)[0] || ['0', 0];
    
    // Get best day
    const bestDay = Object.entries(byDay)
      .sort(([,a], [,b]) => b - a)[0] || ['Sunday', 0];
    
    return {
      peakHour: {
        hour: parseInt(peakHour[0]),
        count: peakHour[1]
      },
      bestDay: {
        day: bestDay[0],
        count: bestDay[1]
      },
      byHour
    };
  }, [filteredOffers]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Effect to handle data loading state
  useEffect(() => {
    if (!offersLoading && filteredOffers) {
      // Small delay to ensure charts render properly
      const timer = setTimeout(() => {
        setIsDataLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [offersLoading, filteredOffers]);

  const isEmpty = filteredOffers.length === 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  const chartVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const renderContent = () => {
    if (offersLoading) {
      return (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Loading data...
          </div>
        </Card>
      );
    } else if (isEmpty) {
      return (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            No data available for the selected filters
          </div>
        </Card>
      );
    } else {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isDataLoaded ? "visible" : "hidden"}
        >
          {/* Key Insights Dashboard */}
          <motion.div 
            variants={chartVariants}
            className="mb-4"
          >
            <KeyInsightsDashboard
              conversionMetrics={conversionMetrics}
              timeMetrics={timeMetrics}
              velocityMetrics={{
                avgTimeToConvert: 0, // We'll need to calculate this
                fastestChannel: conversionMetrics.topChannel.name,
                bestTimeOfDay: {
                  hour: timeMetrics.peakHour.hour,
                  time: 0 // We'll need to calculate this
                },
                bestDayOfWeek: {
                  day: timeMetrics.bestDay.day,
                  time: 0 // We'll need to calculate this
                }
              }}
              channels={channels}
              offerTypes={offerTypes}
            />
          </motion.div>

          {/* Conversion Velocity Analysis - Full width */}
          <motion.div 
            variants={chartVariants}
            className="mb-4"
          >
            <ConversionVelocityAnalysis />
          </motion.div>

          {/* Other cards in 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Offers & Conversions Trend */}
            <motion.div variants={chartVariants}>
              <ModernAnalyticsCard
                title="Offers & Conversions Over Time"
                value={formatNumber(filteredOffers.length)}
                trend={{
                  value: conversionMetrics.rate,
                  isPositive: conversionMetrics.rate >= 50
                }}
                icon={<TrendingUp className="h-5 w-5" />}
                gradient="from-blue-500/10 to-blue-500/5"
                badge={{
                  text: `${conversionMetrics.total} Conversions`,
                  variant: "secondary"
                }}
                insights={[
                  {
                    title: "Conversion Rate",
                    value: `${Math.round(conversionMetrics.rate)}%`,
                    description: "Overall success rate"
                  },
                  {
                    title: "Best Channel",
                    value: conversionMetrics.topChannel.name,
                    description: `${Math.round(conversionMetrics.topChannel.value)}% conversion rate`
                  },
                  {
                    title: "Best Offer Type",
                    value: conversionMetrics.topType.name,
                    description: `${Math.round(conversionMetrics.topType.value)}% conversion rate`
                  }
                ]}
              >
                <TrendsLineChart
                  data={dailyTrendsData}
                  config={{
                    height: 300,
                    colors: {
                      offers: isDark ? '#3b82f6' : '#2563eb',
                      conversions: isDark ? '#10b981' : '#059669',
                      trend: isDark ? '#8b5cf6' : '#7c3aed',
                      weekend: isDark ? '#374151' : '#e5e7eb',
                      holiday: isDark ? '#ef4444' : '#dc2626'
                    },
                    showTrend: true
                  }}
                />
              </ModernAnalyticsCard>
            </motion.div>

            {/* Channel Performance */}
            <motion.div variants={chartVariants}>
              <ModernAnalyticsCard
                title="Channel Performance"
                value={formatNumber(channels.length)}
                trend={{
                  value: conversionMetrics.topChannel.value,
                  isPositive: true
                }}
                icon={<Users className="h-5 w-5" />}
                gradient="from-green-500/10 to-green-500/5"
                badge={{
                  text: `Top: ${conversionMetrics.topChannel.name}`,
                  variant: "secondary"
                }}
                insights={[
                  {
                    title: "Best Channel",
                    value: conversionMetrics.topChannel.name,
                    description: `${Math.round(conversionMetrics.topChannel.value)}% conversion rate`
                  },
                  {
                    title: "Active Channels",
                    value: channels.length.toString(),
                    description: "Number of channels in use"
                  }
                ]}
              >
                <TrendsBarChart
                  data={getConversionsByChannelData(filteredOffers, channels)}
                  config={{
                    height: 300,
                    colors: COLORS,
                    showRate: true,
                    maxItems: 8
                  }}
                />
              </ModernAnalyticsCard>
            </motion.div>

            {/* Offer Type Analysis */}
            <motion.div variants={chartVariants}>
              <ModernAnalyticsCard
                title="Offer Type Analysis"
                value={formatNumber(offerTypes.length)}
                trend={{
                  value: conversionMetrics.topType.value,
                  isPositive: true
                }}
                icon={<Target className="h-5 w-5" />}
                gradient="from-purple-500/10 to-purple-500/5"
                badge={{
                  text: `Top: ${conversionMetrics.topType.name}`,
                  variant: "secondary"
                }}
                insights={[
                  {
                    title: "Best Type",
                    value: conversionMetrics.topType.name,
                    description: `${Math.round(conversionMetrics.topType.value)}% conversion rate`
                  },
                  {
                    title: "Offer Variety",
                    value: offerTypes.length.toString(),
                    description: "Different types of offers"
                  }
                ]}
              >
                <TrendsBarChart
                  data={getConversionByTypeData(filteredOffers, offerTypes)}
                  config={{
                    height: 300,
                    colors: COLORS,
                    showRate: true,
                    maxItems: 8
                  }}
                />
              </ModernAnalyticsCard>
            </motion.div>

            {/* Time Analysis */}
            <motion.div variants={chartVariants}>
              <ModernAnalyticsCard
                title="Time Analysis"
                value={timeMetrics.peakHour.hour.toString().padStart(2, '0') + ':00'}
                trend={{
                  value: (timeMetrics.peakHour.count / filteredOffers.length) * 100,
                  isPositive: true
                }}
                icon={<Clock className="h-5 w-5" />}
                gradient="from-amber-500/10 to-amber-500/5"
                badge={{
                  text: `Best: ${timeMetrics.bestDay.day}`,
                  variant: "secondary"
                }}
                insights={[
                  {
                    title: "Peak Hour",
                    value: `${timeMetrics.peakHour.hour}:00`,
                    description: `${timeMetrics.peakHour.count} offers made`
                  },
                  {
                    title: "Best Day",
                    value: timeMetrics.bestDay.day,
                    description: `${timeMetrics.bestDay.count} offers made`
                  }
                ]}
              >
                <TrendsBarChart
                  data={Object.entries(timeMetrics.byHour).map(([hour, count]) => ({
                    name: `${hour}:00`,
                    value: count as number
                  }))}
                  config={{
                    height: 300,
                    colors: [isDark ? '#f59e0b' : '#d97706'],
                    maxItems: 24
                  }}
                />
              </ModernAnalyticsCard>
            </motion.div>
          </div>
        </motion.div>
      );
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-border/50">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <h2 className="text-lg font-medium">Trends & Breakdown</h2>
          </div>
          
          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden">
            {renderContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
