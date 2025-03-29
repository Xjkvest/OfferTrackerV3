import { useMemo } from "react";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { useFilters } from "@/context/FilterContext";
import { useTheme } from "@/context/ThemeContext";
import { 
  getLast7DaysData, 
  getWeekData, 
  getMonthData, 
  getQuarterData,
  getChannelData, 
  getOfferTypeData, 
  getCsatData,
  getConversionData
} from "@/utils/chartDataUtils";
import { getFilteredOffers } from "@/utils/performanceUtils";
import { 
  startOfYear, 
  endOfYear, 
  subYears, 
  format, 
  eachMonthOfInterval, 
  startOfMonth, 
  endOfMonth, 
  differenceInDays, 
  differenceInWeeks, 
  differenceInMonths, 
  eachWeekOfInterval, 
  eachYearOfInterval,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays
} from "date-fns";

export const useMonthlyOverviewData = () => {
  const { offers } = useOffers();
  const { dailyGoal, channels, offerTypes } = useUser();
  const { filters } = useFilters();
  const { theme } = useTheme();

  // Apply filters to offers
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
  
  // Generate data for custom date range based on span
  const getCustomRangeData = () => {
    if (!filters.dateRange.start || !filters.dateRange.end) return [];
    
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    const daysDiff = differenceInDays(endDate, startDate);
    const weeksDiff = differenceInWeeks(endDate, startDate);
    const monthsDiff = differenceInMonths(endDate, startDate);
    
    // Determine the appropriate time unit based on the span
    if (daysDiff <= 35) {
      // Daily data points
      const result = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayStart = startOfDay(currentDate);
        const dayEnd = endOfDay(currentDate);
        
        const dayOffers = filteredOffers.filter(offer => {
          const offerDate = parseISO(offer.date);
          return isWithinInterval(offerDate, { start: dayStart, end: dayEnd });
        });
        
        result.push({
          date: format(currentDate, "d"),
          count: dayOffers.length,
          goal: dailyGoal
        });
        
        currentDate = addDays(currentDate, 1);
      }
      
      return result;
    } else if (weeksDiff <= 20) {
      // Weekly data points
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
      
      return weeks.map(weekStart => {
        const weekEnd = endOfDay(addDays(weekStart, 6));
        
        const weekOffers = filteredOffers.filter(offer => {
          const offerDate = parseISO(offer.date);
          return isWithinInterval(offerDate, { start: weekStart, end: weekEnd });
        });
        
        return {
          date: `W${format(weekStart, "w")}`,
          count: weekOffers.length,
          goal: dailyGoal * 7
        };
      });
    } else if (monthsDiff <= 20) {
      // Monthly data points
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthOffers = filteredOffers.filter(offer => {
          const offerDate = parseISO(offer.date);
          return isWithinInterval(offerDate, { start: monthStart, end: monthEnd });
        });
        
        return {
          date: format(month, "MMM"),
          count: monthOffers.length,
          goal: dailyGoal * 30
        };
      });
    } else {
      // Yearly data points
      const years = eachYearOfInterval({ start: startDate, end: endDate });
      
      return years.map(year => {
        const yearStart = startOfYear(year);
        const yearEnd = endOfYear(year);
        
        const yearOffers = filteredOffers.filter(offer => {
          const offerDate = parseISO(offer.date);
          return isWithinInterval(offerDate, { start: yearStart, end: yearEnd });
        });
        
        return {
          date: format(year, "yyyy"),
          count: yearOffers.length,
          goal: dailyGoal * 365
        };
      });
    }
  };
  
  // Generate monthly data for year ranges
  const getYearData = (yearOffset: number = 0) => {
    const now = new Date();
    const yearStart = startOfYear(subYears(now, yearOffset));
    const yearEnd = yearOffset === 0 ? now : endOfYear(subYears(now, yearOffset));
    
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthOffers = filteredOffers.filter(offer => {
        const offerDate = parseISO(offer.date);
        return isWithinInterval(offerDate, { start: monthStart, end: monthEnd });
      });
      
      return {
        date: format(month, "MMM"),
        count: monthOffers.length,
        goal: dailyGoal * 30 // Approximate monthly goal
      };
    });
  };
  
  // Data transformations using utility functions
  const last7DaysData = useMemo(() => getLast7DaysData(filteredOffers, dailyGoal), [filteredOffers, dailyGoal]);
  const weekData = useMemo(() => getWeekData(filteredOffers, dailyGoal, filters.dateRange.range === 'lastWeek' ? 1 : 0), [filteredOffers, dailyGoal, filters.dateRange.range]);
  const monthData = useMemo(() => getMonthData(filteredOffers, dailyGoal, filters.dateRange.range === 'lastMonth' ? 1 : 0), [filteredOffers, dailyGoal, filters.dateRange.range]);
  const quarterData = useMemo(() => getQuarterData(filteredOffers, dailyGoal, 1), [filteredOffers, dailyGoal]);
  const channelData = useMemo(() => getChannelData(filteredOffers, channels), [filteredOffers, channels]);
  const offerTypeData = useMemo(() => getOfferTypeData(filteredOffers, offerTypes), [filteredOffers, offerTypes]);
  const csatData = useMemo(() => getCsatData(filteredOffers), [filteredOffers]);
  const conversionData = useMemo(() => getConversionData(filteredOffers), [filteredOffers]);
  
  // Get data based on selected timeframe
  const chartData = useMemo(() => {
    switch (filters.dateRange.range) {
      case 'thisWeek':
      case 'lastWeek':
        return weekData;
      case 'thisMonth':
      case 'lastMonth':
        return monthData;
      case 'lastQuarter':
        return quarterData;
      case 'yearToDate':
        return getYearData(0);
      case 'lastYear':
        return getYearData(1);
      case 'custom':
        return getCustomRangeData();
      default:
        return weekData;
    }
  }, [filters.dateRange.range, weekData, monthData, quarterData, filteredOffers, dailyGoal, filters.dateRange.start, filters.dateRange.end]);
  
  // Transform data for line chart
  const lineChartData = useMemo(() => {
    return [
      {
        id: "offers",
        data: chartData.map(item => ({ x: item.date, y: item.count }))
      },
      {
        id: "goal",
        data: chartData.map(item => ({ x: item.date, y: item.goal }))
      }
    ];
  }, [chartData]);
  
  // Customized theme for charts with better accessibility
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
      legend: {
        text: {
          fontSize: 12,
          fill: theme === "dark" ? "#e5e7eb" : "#374151",
        }
      },
      ticks: {
        line: {
          stroke: theme === "dark" ? "#4b5563" : "#d1d5db",
          strokeWidth: 1
        },
        text: {
          fontSize: 11,
          fill: theme === "dark" ? "#e5e7eb" : "#374151",
          fontWeight: 500,
          outlineWidth: 0,
        }
      }
    },
    grid: {
      line: {
        stroke: theme === "dark" ? "#374151" : "#f3f4f6",
        strokeWidth: 1
      }
    },
    legends: {
      text: {
        fontSize: 11,
        fill: theme === "dark" ? "#e5e7eb" : "#374151",
      }
    },
    labels: {
      text: {
        fontSize: 11,
        fill: theme === "dark" ? "#e5e7eb" : "#374151",
        fontWeight: 500,
        outlineWidth: 2,
        outlineColor: theme === "dark" ? "#1f2937" : "#ffffff",
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
  
  // Check if data exists
  const isEmpty = filteredOffers.length === 0;

  return {
    lineChartData,
    chartData,
    channelData,
    offerTypeData,
    csatData,
    conversionData,
    chartTheme,
    isEmpty,
    theme
  };
};
