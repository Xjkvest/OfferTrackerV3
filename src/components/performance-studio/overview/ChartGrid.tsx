import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/context/ThemeContext";
import { RechartsDonutChart } from "@/components/charts/RechartsDonutChart";
import { ModernAnalyticsCard } from "@/components/charts/ModernAnalyticsCard";
import { 
  PieChart, 
  MessagesSquare,
  CircleDot,
  TrendingUp,
  Users,
  Star,
  Repeat,
  BarChart2,
  Target,
  Calendar,
  BarChart3,
  LineChart,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ensureValidChartData } from "@/utils/mockChartData";

interface ChartGridProps {
  channelData: any[];
  offerTypeData: any[];
  csatData: any[];
  conversionData: any[];
}

export const ChartGrid: React.FC<ChartGridProps> = ({
  channelData,
  offerTypeData,
  csatData,
  conversionData,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  // Double-ensure we have valid data for all charts
  const finalChannelData = ensureValidChartData(channelData, 'channel');
  const finalOfferTypeData = ensureValidChartData(offerTypeData, 'offerType');
  const finalCsatData = ensureValidChartData(csatData, 'csat');
  const finalConversionData = ensureValidChartData(conversionData, 'conversion');

  // Function to get the top item by value
  const getTopItem = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("Empty or invalid data array passed to getTopItem");
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
      console.log("No valid items with value/count found");
      return { name: 'N/A', value: 0 };
    }
    
    const sortedData = [...validData].sort((a, b) => {
      const valueA = a.value !== undefined ? Number(a.value) : (a.count !== undefined ? Number(a.count) : 0);
      const valueB = b.value !== undefined ? Number(b.value) : (b.count !== undefined ? Number(b.count) : 0);
      return valueB - valueA;
    });
    
    const topItem = sortedData[0];
    if (!topItem) {
      console.log("No top item found after sorting");
      return { name: 'N/A', value: 0 };
    }
    
    const name = topItem.name || topItem.label || topItem.id || 'Unnamed';
    const value = topItem.value !== undefined ? Number(topItem.value) : (topItem.count !== undefined ? Number(topItem.count) : 0);
    
    return { name, value };
  };

  // Calculate derived metrics with safety checks
  const topChannel = getTopItem(finalChannelData);
  const topOfferType = getTopItem(finalOfferTypeData);
  
  // Calculate totals with safety checks
  const channelTotal = Array.isArray(finalChannelData) && finalChannelData.length > 0
    ? finalChannelData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  const offerTypeTotal = Array.isArray(finalOfferTypeData) && finalOfferTypeData.length > 0
    ? finalOfferTypeData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  const csatTotal = Array.isArray(finalCsatData) && finalCsatData.length > 0
    ? finalCsatData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  const convertedCount = Array.isArray(finalConversionData) && finalConversionData.length > 0
    ? finalConversionData.find(item => item.id === 'Converted' || item.name === 'Converted')?.value || 0
    : 0;
    
  const totalConversions = Array.isArray(finalConversionData) && finalConversionData.length > 0
    ? finalConversionData.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    : 0;
    
  // Calculate rates
  const conversionRate = totalConversions > 0
    ? (convertedCount / totalConversions * 100).toFixed(1)
    : '0.0';

  // Define fixed chart height to prevent rendering issues
  const chartHeight = isMobile ? 200 : 220;

  // Color schemes for charts - enhanced with better gradient palettes
  const channelColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];
  const offerTypeColors = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
  const csatColors = ['#f59e0b', '#f97316', '#eab308', '#facc15', '#fbbf24'];
  const conversionColors = ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];
  
  // Calculate inner and outer radius based on chart view
  const innerRadius = 50;
  const outerRadius = 80;
  
  // Format total for charts to be human-readable
  const formatTotal = (total: number): string => {
    if (total >= 1000) {
      return `${(total / 1000).toFixed(1)}k`;
    }
    return total.toString();
  };

  return (
    <div className="space-y-6">
      {/* Main Grid Layout */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* Channel Distribution Card */}
        <ModernAnalyticsCard
          title="Channel Distribution"
          value={formatTotal(channelTotal)}
          trend={{ value: 12, isPositive: true }}
          icon={<BarChart3 className="h-5 w-5" />}
          gradient="from-blue-500/10 to-blue-500/5"
          badge={{ text: "Top: " + topChannel.name }}
          insights={[
            {
              title: "Top Channel",
              value: topChannel.name,
              description: `Generated ${formatTotal(topChannel.value)} offers`
            },
            {
              title: "Channel Mix",
              value: `${channelData.length} channels`,
              description: "Active across different platforms"
            }
          ]}
        >
          <RechartsDonutChart
            data={finalChannelData.map(item => ({
              ...item,
              color: item.color || channelColors[finalChannelData.indexOf(item) % channelColors.length]
            }))}
            colors={channelColors}
            height={180}
            innerRadius={45}
            outerRadius={70}
            legendPosition={{ top: 0, left: 0, width: "25%" }}
            theme={theme}
          />
        </ModernAnalyticsCard>

        {/* Offer Type Distribution Card */}
        <ModernAnalyticsCard
          title="Offer Type Distribution"
          value={formatTotal(offerTypeTotal)}
          trend={{ value: 8, isPositive: true }}
          icon={<PieChart className="h-5 w-5" />}
          gradient="from-purple-500/10 to-purple-500/5"
          badge={{ text: "Top: " + topOfferType.name }}
          insights={[
            {
              title: "Top Offer Type",
              value: topOfferType.name,
              description: `Generated ${formatTotal(topOfferType.value)} offers`
            },
            {
              title: "Offer Variety",
              value: `${offerTypeData.length} types`,
              description: "Different offer categories"
            }
          ]}
        >
          <RechartsDonutChart
            data={finalOfferTypeData.map(item => ({
              ...item,
              color: item.color || offerTypeColors[finalOfferTypeData.indexOf(item) % offerTypeColors.length]
            }))}
            colors={offerTypeColors}
            height={180}
            innerRadius={45}
            outerRadius={70}
            legendPosition={{ top: 0, left: 0, width: "25%" }}
            theme={theme}
          />
        </ModernAnalyticsCard>
      </div>
      
      {/* Second Row */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* CSAT Rating Card */}
        <ModernAnalyticsCard
          title="CSAT Distribution"
          value={formatTotal(csatTotal)}
          trend={{ value: 5, isPositive: true }}
          icon={<Smile className="h-5 w-5" />}
          gradient="from-amber-500/10 to-amber-500/5"
          insights={[
            {
              title: "Positive Ratings",
              value: formatTotal(
                finalCsatData
                  .filter(item => item.label === 'Positive' || item.label === 'positive' || item.name === 'Positive' || item.name === 'positive')
                  .reduce((sum, item) => sum + (item.value || 0), 0)
              ),
              description: "Customers satisfied with offers"
            },
            {
              title: "Rating Categories",
              value: `${finalCsatData.length}`,
              description: "Different satisfaction levels"
            }
          ]}
        >
          <RechartsDonutChart
            data={finalCsatData.map(item => ({
              ...item,
              color: item.color || csatColors[finalCsatData.indexOf(item) % csatColors.length]
            }))}
            colors={csatColors}
            height={180}
            innerRadius={45}
            outerRadius={70}
            legendPosition={{ top: 0, left: 0, width: "25%" }}
            theme={theme}
          />
        </ModernAnalyticsCard>

        {/* Conversion Card */}
        <ModernAnalyticsCard
          title="Conversion Status"
          value={conversionRate + '%'}
          trend={{ value: 3, isPositive: true }}
          icon={<TrendingUp className="h-5 w-5" />}
          gradient="from-green-500/10 to-green-500/5"
          insights={[
            {
              title: "Total Converted",
              value: formatTotal(convertedCount),
              description: "Offers that resulted in conversions"
            },
            {
              title: "Conversion Pipeline",
              value: `${finalConversionData.length} statuses`,
              description: "Offer conversion pipeline"
            }
          ]}
        >
          <RechartsDonutChart
            data={finalConversionData.map(item => ({
              ...item,
              color: item.color || conversionColors[finalConversionData.indexOf(item) % conversionColors.length]
            }))}
            colors={conversionColors}
            height={180}
            innerRadius={45}
            outerRadius={70}
            showTotal={true}
            legendPosition={{ top: 0, left: 0, width: "25%" }}
            theme={theme}
          />
        </ModernAnalyticsCard>
      </div>
    </div>
  );
};
