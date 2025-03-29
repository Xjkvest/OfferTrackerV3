import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  BarChart3,
  PieChart,
  Smile,
  LineChart,
  TrendingUp,
  Users,
  Target,
  Star,
  ArrowUpRight
} from "lucide-react";

interface MonthlyInsightMetric {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  category: 'channel' | 'offer' | 'csat' | 'conversion';
}

interface MonthlyInsightsDashboardProps {
  channelData: any[];
  offerTypeData: any[];
  csatData: any[];
  conversionData: any[];
}

export const MonthlyInsightsDashboard: React.FC<MonthlyInsightsDashboardProps> = ({
  channelData,
  offerTypeData,
  csatData,
  conversionData
}) => {
  // Helper function to get top item
  const getTopItem = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { name: 'N/A', value: 0 };
    }
    
    const validData = data.filter(item => 
      item && 
      typeof item === 'object' && 
      (
        (item.value !== undefined && item.value !== null) || 
        (item.count !== undefined && item.count !== null)
      )
    );
    
    if (validData.length === 0) {
      return { name: 'N/A', value: 0 };
    }
    
    const sortedData = [...validData].sort((a, b) => {
      const valueA = a.value !== undefined ? Number(a.value) : (a.count !== undefined ? Number(a.count) : 0);
      const valueB = b.value !== undefined ? Number(b.value) : (b.count !== undefined ? Number(b.count) : 0);
      return valueB - valueA;
    });
    
    const topItem = sortedData[0];
    if (!topItem) {
      return { name: 'N/A', value: 0 };
    }
    
    const name = topItem.name || topItem.label || topItem.id || 'Unnamed';
    const value = topItem.value !== undefined ? Number(topItem.value) : (topItem.count !== undefined ? Number(topItem.count) : 0);
    
    return { name, value };
  };

  // Calculate totals
  const channelTotal = Array.isArray(channelData) && channelData.length > 0
    ? channelData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  const offerTypeTotal = Array.isArray(offerTypeData) && offerTypeData.length > 0
    ? offerTypeData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  const csatTotal = Array.isArray(csatData) && csatData.length > 0
    ? csatData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  const convertedCount = Array.isArray(conversionData) && conversionData.length > 0
    ? conversionData.find(item => item.id === 'Converted' || item.name === 'Converted')?.value || 0
    : 0;
    
  const totalConversions = Array.isArray(conversionData) && conversionData.length > 0
    ? conversionData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  const conversionRate = totalConversions > 0
    ? (convertedCount / totalConversions * 100).toFixed(1)
    : '0.0';

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const insights: MonthlyInsightMetric[] = [
    // Channel Metrics
    {
      title: "Channel Distribution",
      value: formatNumber(channelTotal),
      description: `${channelData.length} active channels`,
      icon: <BarChart3 className="h-4 w-4" />,
      trend: { value: 12, isPositive: true },
      category: 'channel'
    },
    {
      title: "Top Channel",
      value: getTopItem(channelData).name,
      description: `${formatNumber(getTopItem(channelData).value)} offers`,
      icon: <Users className="h-4 w-4" />,
      category: 'channel'
    },

    // Offer Type Metrics
    {
      title: "Offer Distribution",
      value: formatNumber(offerTypeTotal),
      description: `${offerTypeData.length} types`,
      icon: <PieChart className="h-4 w-4" />,
      trend: { value: 8, isPositive: true },
      category: 'offer'
    },
    {
      title: "Top Offer Type",
      value: getTopItem(offerTypeData).name,
      description: `${formatNumber(getTopItem(offerTypeData).value)} offers`,
      icon: <Target className="h-4 w-4" />,
      category: 'offer'
    },

    // CSAT Metrics
    {
      title: "Customer Satisfaction",
      value: `${csatTotal > 0 ? (csatTotal / csatData.length).toFixed(2) : '0.00'}%`,
      description: `${csatData.length} rating levels`,
      icon: <Smile className="h-4 w-4" />,
      trend: { value: 5, isPositive: true },
      category: 'csat'
    },
    {
      title: "Top Rating",
      value: getTopItem(csatData).name,
      description: `${formatNumber(getTopItem(csatData).value)} times`,
      icon: <Star className="h-4 w-4" />,
      category: 'csat'
    },

    // Conversion Metrics
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      description: `${formatNumber(convertedCount)} conversions`,
      icon: <LineChart className="h-4 w-4" />,
      trend: { value: 3, isPositive: true },
      category: 'conversion'
    },
    {
      title: "Conversion Status",
      value: getTopItem(conversionData).name,
      description: `${formatNumber(getTopItem(conversionData).value)} offers`,
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'conversion'
    }
  ];

  const categoryStyles = {
    channel: "from-blue-500/10 to-blue-500/5",
    offer: "from-purple-500/10 to-purple-500/5",
    csat: "from-amber-500/10 to-amber-500/5",
    conversion: "from-green-500/10 to-green-500/5"
  };

  const categoryColors = {
    channel: "text-blue-500",
    offer: "text-purple-500",
    csat: "text-amber-500",
    conversion: "text-green-500"
  };

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Monthly Insights</h2>
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