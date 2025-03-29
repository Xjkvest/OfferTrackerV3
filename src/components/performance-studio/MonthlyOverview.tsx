import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { LineChartSection } from "@/components/performance-studio/overview/LineChartSection";
import { ChartGrid } from "@/components/performance-studio/overview/ChartGrid";
import { useTheme } from "@/context/ThemeContext";
import { useMonthlyOverviewData } from "@/components/performance-studio/overview/useMonthlyOverviewData";
import { EmptyState } from "@/components/performance-studio/overview/EmptyState";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, PieChart, BarChart } from "lucide-react";
import { ensureValidChartData } from "@/utils/mockChartData";
import { MonthlyInsightsDashboard } from './overview/MonthlyInsightsDashboard';

export const MonthlyOverview: React.FC = () => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'all' | 'line' | 'pie'>('all');
  
  // Get data for charts from custom hook
  const { 
    lineChartData, 
    channelData, 
    offerTypeData, 
    csatData, 
    conversionData, 
    chartTheme,
    isEmpty
  } = useMonthlyOverviewData();

  // Debug the data received from the hook
  useEffect(() => {
    console.log('MonthlyOverview data loaded:', {
      lineChartData: !!lineChartData,
      channelData,
      offerTypeData,
      csatData,
      conversionData,
      isEmpty
    });
  }, [lineChartData, channelData, offerTypeData, csatData, conversionData, isEmpty]);

  // Ensure we have valid data for charts, use mock data as fallback
  const ensuredChannelData = ensureValidChartData(channelData, 'channel');
  const ensuredOfferTypeData = ensureValidChartData(offerTypeData, 'offerType');
  const ensuredCsatData = ensureValidChartData(csatData, 'csat');
  const ensuredConversionData = ensureValidChartData(conversionData, 'conversion');

  // Filters the visible chart sections based on the selected tab
  const renderCharts = () => {
    if (selectedTab === 'all' || selectedTab === 'line') {
      return (
        <div className={selectedTab === 'all' ? 'mb-6' : ''}>
          <LineChartSection lineChartData={lineChartData} chartTheme={chartTheme} />
        </div>
      );
    }
    return null;
  };

  const renderPieCharts = () => {
    if (selectedTab === 'all' || selectedTab === 'pie') {
      return (
        <div className="space-y-4">
          <MonthlyInsightsDashboard 
            channelData={channelData}
            offerTypeData={offerTypeData}
            csatData={csatData}
            conversionData={conversionData}
          />
          <ChartGrid
            channelData={ensuredChannelData}
            offerTypeData={ensuredOfferTypeData}
            csatData={ensuredCsatData}
            conversionData={ensuredConversionData}
          />
        </div>
      );
    }
    return null;
  };

  // Render content based on data availability
  const renderContent = () => {
    if (isEmpty) {
      return <EmptyState />;
    }
    
    return (
      <>
        {renderCharts()}
        {renderPieCharts()}
      </>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-border/50">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* Header with tabs */}
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <h2 className="text-lg font-medium">Monthly Overview</h2>
            
            <div className="flex items-center gap-2">
              <Tabs value={selectedTab} className="hidden sm:flex h-8">
                <TabsList className="h-8">
                  <TabsTrigger 
                    value="all" 
                    onClick={() => setSelectedTab('all')}
                    className="text-xs h-7 px-2 flex items-center gap-1.5"
                  >
                    <BarChart className="h-3.5 w-3.5" />
                    <span>All Charts</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="line" 
                    onClick={() => setSelectedTab('line')}
                    className="text-xs h-7 px-2 flex items-center gap-1.5"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Trend</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pie" 
                    onClick={() => setSelectedTab('pie')}
                    className="text-xs h-7 px-2 flex items-center gap-1.5"
                  >
                    <PieChart className="h-3.5 w-3.5" />
                    <span>Distribution</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Mobile tabs - only show if we have data */}
          {!isEmpty && (
            <div className="flex sm:hidden p-3 border-b border-border/50">
              <Tabs value={selectedTab} className="w-full">
                <TabsList className="w-full h-8 grid grid-cols-3">
                  <TabsTrigger 
                    value="all" 
                    onClick={() => setSelectedTab('all')}
                    className="text-xs"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="line" 
                    onClick={() => setSelectedTab('line')}
                    className="text-xs"
                  >
                    Trend
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pie" 
                    onClick={() => setSelectedTab('pie')}
                    className="text-xs"
                  >
                    Distribution
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          {/* Charts content */}
          <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden">
            {renderContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
