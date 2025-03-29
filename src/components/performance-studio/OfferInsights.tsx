import React, { useMemo } from "react";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { useFilters } from "@/context/FilterContext";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "./FilterBar";
import { 
  getFilteredOffers, 
  getConversionLagData, 
  getFollowupEffectivenessData,
  getConversionFunnelData
} from "@/utils/performanceUtils";
import { motion } from "framer-motion";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { ScatterPlotComponent } from "@/components/charts/ScatterPlotComponent";
import { HeatMapComponent } from "@/components/charts/HeatMapComponent";
import { FunnelChart } from "@/components/charts/FunnelChart";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF6B6B', '#6a0dad'];

export const OfferInsights: React.FC = () => {
  const { offers } = useOffers();
  const { channels } = useUser();
  const { filters } = useFilters();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  const filteredOffers = useMemo(() => {
    return getFilteredOffers(
      offers,
      filters.dateRange.start && filters.dateRange.end 
        ? { start: filters.dateRange.start, end: filters.dateRange.end } 
        : null,
      filters.channels.length > 0 ? filters.channels : null,
      filters.offerTypes.length > 0 ? filters.offerTypes : null,
      filters.csat,
      filters.converted,
      filters.hasFollowup
    );
  }, [offers, filters]);
  
  // Create chart theme
  const chartTheme = useMemo(() => ({
    background: "transparent",
    textColor: theme === "dark" ? "#e5e7eb" : "#374151",
    fontSize: 12,
    axis: {
      domain: {
        line: {
          stroke: theme === "dark" ? "#4b5563" : "#d1d5db",
          strokeWidth: 1
        }
      },
      ticks: {
        line: {
          stroke: theme === "dark" ? "#4b5563" : "#d1d5db",
          strokeWidth: 1
        }
      }
    },
    grid: {
      line: {
        stroke: theme === "dark" ? "#374151" : "#f3f4f6",
        strokeWidth: 1
      }
    },
    tooltip: {
      container: {
        background: theme === "dark" ? "#1f2937" : "#ffffff",
        color: theme === "dark" ? "#e5e7eb" : "#374151",
        fontSize: "12px",
        borderRadius: "6px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        padding: "8px 12px"
      }
    }
  }), [theme]);
  
  // Data for conversion lag scatterplot
  const conversionLagData = useMemo(() => {
    const data = getConversionLagData(filteredOffers);
    
    // Transform to format for Nivo scatterplot
    return [
      {
        id: 'with-followup',
        data: data
          .filter(d => d.hasFollowup)
          .map(d => ({
            x: d.lagDays,
            y: d.offerType,
            group: 'With Followup',
            offerType: d.offerType,
            channel: d.channel,
            lagDays: d.lagDays
          }))
      },
      {
        id: 'without-followup',
        data: data
          .filter(d => !d.hasFollowup)
          .map(d => ({
            x: d.lagDays,
            y: d.offerType,
            group: 'Without Followup',
            offerType: d.offerType,
            channel: d.channel,
            lagDays: d.lagDays
          }))
      }
    ];
  }, [filteredOffers]);
  
  // Data for followup effectiveness bar chart
  const followupEffectivenessData = useMemo(() => {
    const data = getFollowupEffectivenessData(filteredOffers);
    
    // Transform for Nivo bar chart
    return data.map(d => ({
      name: d.name,
      value: d.value
    }));
  }, [filteredOffers]);
  
  // Data for CSAT heatmap calendar
  const csatCalendarData = useMemo(() => {
    if (!filters.dateRange.start || !filters.dateRange.end) return [];
    
    const dateRange = {
      start: filters.dateRange.start,
      end: filters.dateRange.end
    };
    
    const days = eachDayOfInterval(dateRange);
    
    return days.map(day => {
      const dayOffers = filteredOffers.filter(offer => 
        isSameDay(parseISO(offer.date), day)
      );
      
      if (dayOffers.length === 0) {
        return {
          date: format(day, 'yyyy-MM-dd'),
          displayDate: format(day, 'MMM d'),
          score: null,
          positive: 0,
          neutral: 0,
          negative: 0,
          total: 0
        };
      }
      
      const positive = dayOffers.filter(o => o.csat === 'positive').length;
      const neutral = dayOffers.filter(o => o.csat === 'neutral').length;
      const negative = dayOffers.filter(o => o.csat === 'negative').length;
      const total = positive + neutral + negative;
      
      let score = 0;
      if (total > 0) {
        score = (positive - negative) / total;
      }
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        displayDate: format(day, 'MMM d'),
        score,
        positive,
        neutral,
        negative,
        total
      };
    });
  }, [filteredOffers, filters.dateRange]);
  
  // Transform CSAT data for heatmap
  const heatmapData = useMemo(() => {
    // Group by week
    const weeks: Record<string, any[]> = {};
    
    csatCalendarData.forEach(day => {
      const date = new Date(day.date);
      const weekNum = Math.floor(date.getDate() / 7);
      const weekKey = `Week ${weekNum + 1}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      
      weeks[weekKey].push({
        x: format(date, 'EEE'),
        y: day.score !== null ? day.score * 100 : null,
        date: day.displayDate,
        positive: day.positive,
        negative: day.negative,
        neutral: day.neutral,
        total: day.total
      });
    });
    
    // Convert to format for Nivo heatmap
    return Object.entries(weeks).map(([id, data]) => ({
      id,
      data
    }));
  }, [csatCalendarData]);
  
  // Offer activity heatmap data
  const offerHeatmapData = useMemo(() => {
    if (!filters.dateRange.start || !filters.dateRange.end) return [];
    
    const dateRange = {
      start: filters.dateRange.start,
      end: filters.dateRange.end
    };
    
    const days = eachDayOfInterval(dateRange);
    
    // Group by week
    const weeks: Record<string, any[]> = {};
    
    days.forEach(day => {
      const dayOffers = filteredOffers.filter(offer => 
        isSameDay(parseISO(offer.date), day)
      );
      
      const total = dayOffers.length;
      const converted = dayOffers.filter(o => o.converted).length;
      
      const weekNum = Math.floor(day.getDate() / 7);
      const weekKey = `Week ${weekNum + 1}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      
      weeks[weekKey].push({
        x: format(day, 'EEE'),
        y: total,
        date: format(day, 'MMM d'),
        total,
        converted,
        conversionRate: total > 0 ? (converted / total) * 100 : 0
      });
    });
    
    // Convert to format for Nivo heatmap
    return Object.entries(weeks).map(([id, data]) => ({
      id,
      data
    }));
  }, [filteredOffers, filters.dateRange]);
  
  // Conversion funnel data
  const conversionFunnelData = useMemo(() => {
    const data = getConversionFunnelData(filteredOffers);
    
    // Transform for Nivo funnel
    return data.map((d, i) => ({
      id: d.name,
      value: d.value,
      label: d.name,
      color: COLORS[i % COLORS.length]
    }));
  }, [filteredOffers]);
  
  const isEmpty = filteredOffers.length === 0;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
  
  return (
    <div className="space-y-6">
      <FilterBar
        showDateRange={true}
        showChannels={true}
        showOfferTypes={true}
      />
      
      {isEmpty ? (
        <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 p-8 text-center">
          <div className="text-xl font-medium">No data found for this selection</div>
          <div className="text-muted-foreground mt-2">Try adjusting your filters to see results</div>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="md:col-span-2" variants={chartVariants}>
            <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Conversion Lag
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {conversionLagData[0].data.length > 0 || conversionLagData[1].data.length > 0 ? (
                    <ScatterPlotComponent
                      data={conversionLagData}
                      theme={theme as "light" | "dark"}
                      height={280}
                      showGrid={true}
                      showTooltip={true}
                      showLegend={true}
                      xAxisLabel="Time to Conversion (days)"
                      yAxisLabel="Offer Type"
                      colors={['#0088FE', '#FF8042']}
                      nodeSize={16}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-lg font-medium">No conversion data available</p>
                        <p className="text-sm text-muted-foreground">No converted offers found with selected filters</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-center mt-4 flex justify-center flex-wrap gap-3">
                  <Badge variant="outline" className="bg-[#0088FE]/10 border-[#0088FE]/30">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#0088FE] mr-1.5"></span>
                    With Follow-up
                  </Badge>
                  <Badge variant="outline" className="bg-[#FF8042]/10 border-[#FF8042]/30">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#FF8042] mr-1.5"></span>
                    Without Follow-up
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={chartVariants}>
            <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                  Follow-up Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <HorizontalBarChart
                    data={followupEffectivenessData}
                    barKey="value"
                    indexBy="name"
                    height={280}
                    color="#82ca9d"
                    theme={theme as "light" | "dark"}
                    showLegend={false}
                    showTooltip={true}
                    showGrid={true}
                    xAxisLabel="Conversion Rate"
                    showDataLabels={true}
                    barSize={18}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Comparing conversion rates for offers with and without follow-ups
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={chartVariants}>
            <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <FunnelChart
                    data={conversionFunnelData}
                    theme={theme as "light" | "dark"}
                    height={280}
                    showValues={true}
                    showTooltip={true}
                    valueFormat={(value) => value.toString()}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={chartVariants}>
            <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                  CSAT Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {heatmapData.length > 0 && heatmapData[0].data.length > 0 ? (
                    <HeatMapComponent
                      data={heatmapData}
                      height={280}
                      theme={theme as "light" | "dark"}
                      xAxisLabel="Day"
                      yAxisLabel="Week"
                      colors={["#fb7185", "#fcd34d", "#4ade80"]}
                      showLegend={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-lg font-medium">No CSAT data available</p>
                        <p className="text-sm text-muted-foreground">No offers with CSAT ratings found</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={chartVariants} className="md:col-span-2">
            <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Offer Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  {offerHeatmapData.length > 0 && offerHeatmapData[0].data.length > 0 ? (
                    <HeatMapComponent
                      data={offerHeatmapData}
                      height={220}
                      theme={theme as "light" | "dark"}
                      xAxisLabel="Day"
                      yAxisLabel="Week"
                      colors={["#f7fafc", "#3b82f6", "#1d4ed8"]}
                      showLegend={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-lg font-medium">No offer data available</p>
                        <p className="text-sm text-muted-foreground">No offers found in the selected date range</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
