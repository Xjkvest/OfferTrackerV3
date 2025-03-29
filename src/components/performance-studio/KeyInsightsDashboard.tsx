import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  Calendar,
  Zap,
  ArrowUpRight,
  BarChart2,
  PieChart,
  Star,
  ChevronRight
} from "lucide-react";

interface InsightMetric {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  category: 'conversion' | 'time' | 'velocity' | 'channel';
}

interface KeyInsightsDashboardProps {
  conversionMetrics: {
    total: number;
    rate: number;
    topChannel: { name: string; value: number };
    topType: { name: string; value: number };
  };
  timeMetrics: {
    peakHour: { hour: number; count: number };
    bestDay: { day: string; count: number };
    byHour: Record<number, number>;
  };
  velocityMetrics: {
    avgTimeToConvert: number;
    fastestChannel: string;
    bestTimeOfDay: { hour: number; time: number };
    bestDayOfWeek: { day: string; time: number };
  };
  channels: string[];
  offerTypes: string[];
}

export const KeyInsightsDashboard: React.FC<KeyInsightsDashboardProps> = ({
  conversionMetrics,
  timeMetrics,
  velocityMetrics,
  channels,
  offerTypes
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatTime = (hours: number): string => {
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }
    return `${Math.round(hours / 24)}d`;
  };

  const insights: InsightMetric[] = [
    // Conversion Metrics
    {
      title: "Conversion Rate",
      value: `${Math.round(conversionMetrics.rate)}%`,
      description: `${conversionMetrics.total} conversions`,
      icon: <TrendingUp className="h-4 w-4" />,
      trend: {
        value: conversionMetrics.rate,
        isPositive: conversionMetrics.rate >= 50
      },
      category: 'conversion'
    },
    {
      title: "Best Type",
      value: conversionMetrics.topType.name,
      description: `${Math.round(conversionMetrics.topType.value)}%`,
      icon: <Target className="h-4 w-4" />,
      category: 'conversion'
    },
    {
      title: "Best Channel",
      value: conversionMetrics.topChannel.name,
      description: `${Math.round(conversionMetrics.topChannel.value)}%`,
      icon: <Users className="h-4 w-4" />,
      category: 'conversion'
    },

    // Time Metrics
    {
      title: "Peak Hour",
      value: `${timeMetrics.peakHour.hour}:00`,
      description: `${timeMetrics.peakHour.count} offers`,
      icon: <Clock className="h-4 w-4" />,
      category: 'time'
    },
    {
      title: "Best Day",
      value: timeMetrics.bestDay.day,
      description: `${timeMetrics.bestDay.count} offers`,
      icon: <Calendar className="h-4 w-4" />,
      category: 'time'
    },

    // Velocity Metrics
    {
      title: "Avg Time",
      value: formatTime(velocityMetrics.avgTimeToConvert),
      description: "to convert",
      icon: <Zap className="h-4 w-4" />,
      category: 'velocity'
    },
    {
      title: "Fastest",
      value: velocityMetrics.fastestChannel,
      description: formatTime(velocityMetrics.bestTimeOfDay.time),
      icon: <ArrowUpRight className="h-4 w-4" />,
      category: 'velocity'
    },
    {
      title: "Best Time",
      value: `${velocityMetrics.bestTimeOfDay.hour}:00`,
      description: formatTime(velocityMetrics.bestTimeOfDay.time),
      icon: <BarChart2 className="h-4 w-4" />,
      category: 'velocity'
    },
    {
      title: "Best Day",
      value: velocityMetrics.bestDayOfWeek.day,
      description: formatTime(velocityMetrics.bestDayOfWeek.time),
      icon: <PieChart className="h-4 w-4" />,
      category: 'velocity'
    },

    // Channel & Type Metrics
    {
      title: "Active Channels",
      value: channels.length,
      description: "in use",
      icon: <Users className="h-4 w-4" />,
      category: 'channel'
    },
    {
      title: "Offer Types",
      value: offerTypes.length,
      description: "varieties",
      icon: <Target className="h-4 w-4" />,
      category: 'channel'
    }
  ];

  const categoryStyles = {
    conversion: "from-blue-500/10 to-blue-500/5",
    time: "from-green-500/10 to-green-500/5",
    velocity: "from-purple-500/10 to-purple-500/5",
    channel: "from-orange-500/10 to-orange-500/5"
  };

  const categoryColors = {
    conversion: "text-blue-500",
    time: "text-green-500",
    velocity: "text-purple-500",
    channel: "text-orange-500"
  };

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <Star className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Key Insights</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {Object.entries(categoryStyles).map(([category, gradient]) => {
          const categoryInsights = insights.filter(i => i.category === category);
          return (
            <div 
              key={category} 
              className="h-full"
            >
              <div className={`rounded-lg p-2 bg-gradient-to-r ${gradient} h-full flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`${categoryColors[category as keyof typeof categoryColors]}`}>
                    {categoryInsights[0].icon}
                  </div>
                  <span className="text-xs font-medium capitalize">{category}</span>
                </div>
                <div className="space-y-1 flex-1">
                  {categoryInsights.map((insight, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{insight.title}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{insight.value}</span>
                        {insight.trend && (
                          <ArrowUpRight 
                            className={`h-3 w-3 ${
                              insight.trend.isPositive ? 'text-green-500' : 'text-red-500'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}; 