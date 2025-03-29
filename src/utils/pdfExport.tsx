import { format, parseISO, differenceInDays, subMonths, startOfWeek } from "date-fns";
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  PDFViewer,
  PDFDownloadLink,
  Link
} from '@react-pdf/renderer';
import { useUser } from "@/context/UserContext";
import { useMemo } from "react";

// Register system fonts
Font.register({
  family: 'System',
  fonts: [
    { 
      src: 'Helvetica',
      fontWeight: 'normal'
    },
    { 
      src: 'Helvetica-Bold',
      fontWeight: 'bold'
    }
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'System',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 10,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 15,
    color: '#111827',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
    color: '#374151',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 600,
  },
  tableCell: {
    padding: 8,
    fontSize: 11,
    flex: 1,
    color: '#374151',
  },
  tableCellHeader: {
    padding: 8,
    fontSize: 11,
    fontWeight: 600,
    flex: 1,
    color: '#111827',
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 12,
    paddingVertical: 4,
  },
  metricLabel: {
    color: '#4b5563',
  },
  metricValue: {
    fontWeight: 600,
    color: '#111827',
  },
  filterSection: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 8,
  },
  filterValue: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  coachingSection: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
  },
  coachingTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0369a1',
    marginBottom: 8,
  },
  coachingContent: {
    fontSize: 12,
    color: '#0c4a6e',
    marginBottom: 4,
  },
  highlightBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#92400e',
    marginBottom: 8,
  },
  highlightContent: {
    fontSize: 12,
    color: '#78350f',
    marginBottom: 4,
  },
  notesSection: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 8,
  },
  notesContent: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  insightCard: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  insightTitle: {
    marginBottom: 4,
    fontWeight: 600,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
  },
  insightSubtext: {
    fontSize: 10,
    color: '#6b7280',
  },
  trendCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  trendTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 8,
  },
  trendBar: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trendSegment: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  trendLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  metricsGrid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    minWidth: '45%',
    alignItems: 'center',
  },
  improvementSection: {
    marginBottom: 10,
  },
  improvementTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 5,
    color: '#111827',
  },
  improvementText: {
    fontSize: 12,
    color: '#374151',
  },
  agentComment: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 10,
  }
});

interface Offer {
  id: string;
  date: string;
  channel: string;
  offerType: string;
  converted: boolean;
  csat?: 'positive' | 'neutral' | 'negative' | number;
  hasFollowup?: boolean;
  followupDate?: string;
  caseNumber?: string;
}

export interface Channel {
  name: string;
  csat?: number;
}

export interface OfferType {
  name: string;
  csat?: number;
}

interface ChannelData {
  current: number;
  previous: number;
  csat: number;
}

interface PreviousPeriodData {
  conversionRate: number;
  totalOffers: number;
  channelData: Record<string, ChannelData>;
}

interface PDFReportProps {
  offers: Offer[];
  channels: Record<string, Channel>;
  offerTypes: Record<string, OfferType>;
  dateRange: {
    start: Date;
    end: Date;
  };
  userName: string;
  dailyGoal: number;
  previousPeriodData?: PreviousPeriodData;
  baseUrl?: string;
  agentComment?: string;
}

// Type definitions for CSAT
type CSATStringValue = 'positive' | 'neutral' | 'negative';
type CSATNumberValue = 1 | 0 | -1;
type CSATValue = CSATStringValue | CSATNumberValue;

interface CSATDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

// Type guard functions
const isCSATString = (value: unknown): value is CSATStringValue => {
  return typeof value === 'string' && ['positive', 'neutral', 'negative'].includes(value);
};

const isCSATNumber = (value: unknown): value is CSATNumberValue => {
  return typeof value === 'number' && [1, 0, -1].includes(value);
};

// Safe CSAT formatting without string methods on numbers
const formatCSAT = (csat: CSATValue | undefined): string => {
  if (csat === undefined) return 'N/A';
  
  if (isCSATString(csat)) {
    switch (csat) {
      case 'positive': return 'Positive';
      case 'negative': return 'Negative';
      case 'neutral': return 'Neutral';
    }
  }
  
  if (isCSATNumber(csat)) {
    switch (csat) {
      case 1: return 'Positive';
      case -1: return 'Negative';
      case 0: return 'Neutral';
    }
  }
  
  return 'N/A';
};

// Type-safe channel performance tracking
interface ChannelMetrics {
  current: number;
  previous: number;
  csat: number;
}

const calculateChannelPerformance = (currentOffers: Offer[]): Map<string, ChannelMetrics> => {
  return currentOffers.reduce((acc, offer) => {
    const metrics = acc.get(offer.channel) || { current: 0, previous: 0, csat: 0 };
    metrics.current++;
    if (typeof offer.csat === 'number') {
      metrics.csat += offer.csat;
    }
    acc.set(offer.channel, metrics);
    return acc;
  }, new Map<string, ChannelMetrics>());
};

// Calculate CSAT distribution with type safety
const calculateCSATDistribution = (offers: Offer[]): CSATDistribution => {
  return offers.reduce((acc, offer) => {
    const score = getCSATScore(offer.csat);
    if (score > 0) acc.positive++;
    else if (score < 0) acc.negative++;
    else acc.neutral++;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });
};

// Type-safe CSAT calculations
const getCSATScore = (csat: unknown): number => {
  if (csat === undefined) return 0;
  if (isCSATString(csat)) {
    return csat === 'positive' ? 1 : csat === 'negative' ? -1 : 0;
  }
  if (isCSATNumber(csat)) {
    return csat;
  }
  return 0;
};

export const generatePDFReport = ({ 
  offers, 
  channels, 
  offerTypes, 
  dateRange, 
  userName,
  dailyGoal,
  previousPeriodData: initialPreviousPeriodData,
  baseUrl,
  agentComment
}: PDFReportProps) => {
  // Calculate CSAT distribution
  const csatDistribution = calculateCSATDistribution(offers);

  // Calculate previous period data
  const previousPeriodData = (() => {
    const previousStart = subMonths(dateRange.start, 1);
    const previousEnd = subMonths(dateRange.end, 1);
    
    const previousOffers = offers.filter(offer => {
      const offerDate = parseISO(offer.date);
      return offerDate >= previousStart && offerDate <= previousEnd;
    });

    const previousConversionRate = previousOffers.length > 0
      ? (previousOffers.filter(o => o.converted).length / previousOffers.length) * 100
      : 0;

    const previousChannelData = previousOffers.reduce((acc, offer) => {
      if (!acc[offer.channel]) {
        acc[offer.channel] = { current: 0, previous: 0, csat: 0 };
      }
      acc[offer.channel].current++;
      if (typeof offer.csat === 'number') {
        acc[offer.channel].csat += offer.csat;
      }
      return acc;
    }, {} as Record<string, ChannelData>);

    return {
      conversionRate: previousConversionRate,
      totalOffers: previousOffers.length,
      channelData: previousChannelData
    };
  })();

  // Helper function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // Calculate metrics
  const metrics = (() => {
    // Calculate channel data
    const channelMetrics = Object.entries(channels).map(([channel, data]) => ({
      channel,
      count: offers.filter(o => o.channel === channel).length,
      csat: typeof data.csat === 'number' ? data.csat : 0
    }));

    // Calculate type data
    const typeMetrics = Object.entries(offerTypes).map(([type, data]) => ({
      type,
      count: offers.filter(o => o.offerType === type).length,
      csat: typeof data.csat === 'number' ? data.csat : 0
    }));

    // Calculate channel trends
    const channelTrendMetrics = Object.entries(channels).map(([channel, data]) => {
      const channelOffers = offers.filter(o => o.channel === channel);
      const weeklyTrend = channelOffers.length > 0 ? channelOffers.reduce((acc, offer) => {
        const offerDate = parseISO(offer.date);
        const weekStart = startOfWeek(offerDate);
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        if (!acc[weekKey]) {
          acc[weekKey] = { total: 0, converted: 0 };
        }
        acc[weekKey].total++;
        if (offer.converted) acc[weekKey].converted++;
        return acc;
      }, {} as Record<string, { total: number; converted: number }>) : {};
      return { channel, weeklyTrend };
    });

    // Calculate type trends
    const typeTrendMetrics = Object.entries(offerTypes).map(([type, data]) => {
      const typeOffers = offers.filter(o => o.offerType === type);
      const weeklyTrend = typeOffers.length > 0 ? typeOffers.reduce((acc, offer) => {
        const offerDate = parseISO(offer.date);
        const weekStart = startOfWeek(offerDate);
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        if (!acc[weekKey]) {
          acc[weekKey] = { total: 0, converted: 0 };
        }
        acc[weekKey].total++;
        if (offer.converted) acc[weekKey].converted++;
        return acc;
      }, {} as Record<string, { total: number; converted: number }>) : {};
      return { type, weeklyTrend };
    });

    // Calculate improvements
    const channelImprovements = channelTrendMetrics.map(({ channel, weeklyTrend }) => {
      const sortedTrend = Object.entries(weeklyTrend).sort((a, b) => a[0].localeCompare(b[0]));
      const improvement = sortedTrend.length > 0
        ? sortedTrend[sortedTrend.length - 1][1].converted - sortedTrend[0][1].converted
        : 0;
      return { channel, improvement };
    });

    const typeImprovements = typeTrendMetrics.map(({ type, weeklyTrend }) => {
      const sortedTrend = Object.entries(weeklyTrend).sort((a, b) => a[0].localeCompare(b[0]));
      const improvement = sortedTrend.length > 0
        ? sortedTrend[sortedTrend.length - 1][1].converted - sortedTrend[0][1].converted
        : 0;
      return { type, improvement };
    });

    // Calculate trend data
    const getTrendData = (weeklyTrend: Record<string, { total: number; converted: number }>) => {
      const sortedTrend = Object.entries(weeklyTrend).sort((a, b) => a[0].localeCompare(b[0]));
      const lastTrend = sortedTrend[sortedTrend.length - 1]?.[1] || { total: 0, converted: 0 };
      const firstTrend = sortedTrend[0]?.[1] || { total: 0, converted: 0 };
      const lastConversionRate = lastTrend.total > 0 ? (lastTrend.converted / lastTrend.total) * 100 : 0;
      const firstConversionRate = firstTrend.total > 0 ? (firstTrend.converted / firstTrend.total) * 100 : 0;
      return {
        lastConversionRate,
        firstConversionRate,
        isImprovement: lastConversionRate > firstConversionRate
      };
    };

    return {
      channelMetrics,
      typeMetrics,
      channelTrendMetrics,
      typeTrendMetrics,
      channelImprovements,
      typeImprovements,
      getTrendData
    };
  })();

  // Calculate metrics
  const totalOffers = offers.length;
  const convertedOffers = offers.filter(o => o.converted).length;
  const conversionRate = totalOffers > 0 ? (convertedOffers / totalOffers) * 100 : 0;
  const positiveCSAT = offers.filter(o => o.csat === 'positive' || o.csat === 1).length;
  const csatRate = totalOffers > 0 ? (positiveCSAT / totalOffers) * 100 : 0;
  const followupOffers = offers.filter(o => o.followupDate).length;
  const followupRate = totalOffers > 0 ? (followupOffers / totalOffers) * 100 : 0;
  
  // Calculate period metrics
  const periodDays = differenceInDays(dateRange.end, dateRange.start) + 1;
  const averageDailyOffers = totalOffers / periodDays;
  const goalAchievementRate = (averageDailyOffers / dailyGoal) * 100;

  // Calculate totals for channels and offer types
  const channelTotal = offers.length;
  const offerTypeTotal = offers.length;

  // Find best and worst performing channels and types
  const bestChannel = metrics.channelMetrics.length > 0 
    ? [...metrics.channelMetrics].sort((a, b) => b.csat - a.csat)[0]
    : { channel: 'N/A', csat: 0 };
  const worstChannel = metrics.channelMetrics.length > 0
    ? [...metrics.channelMetrics].sort((a, b) => a.csat - b.csat)[0]
    : { channel: 'N/A', csat: 0 };

  // Find best and worst performing offer types with fallbacks
  const bestType = metrics.typeMetrics.length > 0
    ? [...metrics.typeMetrics].sort((a, b) => b.csat - a.csat)[0]
    : { type: 'N/A', csat: 0 };
  const worstType = metrics.typeMetrics.length > 0
    ? [...metrics.typeMetrics].sort((a, b) => a.csat - b.csat)[0]
    : { type: 'N/A', csat: 0 };

  // Calculate additional insights with fallbacks
  const averageOffersPerDay = totalOffers / (differenceInDays(dateRange.end, dateRange.start) + 1);
  const bestDay = offers.length > 0 ? offers.reduce((best, current) => {
    const currentDate = format(parseISO(current.date), 'yyyy-MM-dd');
    const currentCount = offers.filter(o => format(parseISO(o.date), 'yyyy-MM-dd') === currentDate).length;
    const bestCount = offers.filter(o => format(parseISO(o.date), 'yyyy-MM-dd') === best).length;
    return currentCount > bestCount ? currentDate : best;
  }, format(parseISO(offers[0].date), 'yyyy-MM-dd')) : format(new Date(), 'yyyy-MM-dd');

  const worstDay = offers.length > 0 ? offers.reduce((worst, current) => {
    const currentDate = format(parseISO(current.date), 'yyyy-MM-dd');
    const currentCount = offers.filter(o => format(parseISO(o.date), 'yyyy-MM-dd') === currentDate).length;
    const worstCount = offers.filter(o => format(parseISO(o.date), 'yyyy-MM-dd') === worst).length;
    return currentCount < worstCount ? currentDate : worst;
  }, format(parseISO(offers[0].date), 'yyyy-MM-dd')) : format(new Date(), 'yyyy-MM-dd');

  const bestDayCount = offers.length > 0 ? offers.filter(o => format(parseISO(o.date), 'yyyy-MM-dd') === bestDay).length : 0;
  const worstDayCount = offers.length > 0 ? offers.filter(o => format(parseISO(o.date), 'yyyy-MM-dd') === worstDay).length : 0;

  const mostCommonChannel = metrics.channelMetrics.length > 0
    ? metrics.channelMetrics.reduce((best, current) => current.count > best.count ? current : best)
    : { channel: 'N/A', count: 0 };

  const mostCommonType = metrics.typeMetrics.length > 0
    ? metrics.typeMetrics.reduce((best, current) => current.count > best.count ? current : best)
    : { type: 'N/A', count: 0 };

  // Calculate daily performance trends
  const dailyPerformance = offers.reduce((acc, offer) => {
    const date = format(parseISO(offer.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = {
        total: 0,
        converted: 0,
        positiveCSAT: 0,
        followups: 0
      };
    }
    acc[date].total++;
    if (offer.converted) acc[date].converted++;
    if (offer.csat === 'positive' || offer.csat === 1) acc[date].positiveCSAT++;
    if (offer.followupDate) acc[date].followups++;
    return acc;
  }, {} as Record<string, { total: number; converted: number; positiveCSAT: number; followups: number }>);

  const dailyPerformanceData = Object.entries(dailyPerformance).map(([date, data]) => ({
    date,
    conversionRate: (data.converted / data.total) * 100,
    csatRate: (data.positiveCSAT / data.total) * 100,
    followupRate: (data.followups / data.total) * 100,
    totalOffers: data.total
  }));

  // Calculate weekly performance
  const weeklyPerformance = offers.reduce((acc, offer) => {
    const week = format(parseISO(offer.date), 'yyyy-ww');
    if (!acc[week]) {
      acc[week] = {
        total: 0,
        converted: 0,
        positiveCSAT: 0,
        followups: 0
      };
    }
    acc[week].total++;
    if (offer.converted) acc[week].converted++;
    if (offer.csat === 'positive' || offer.csat === 1) acc[week].positiveCSAT++;
    if (offer.followupDate) acc[week].followups++;
    return acc;
  }, {} as Record<string, { total: number; converted: number; positiveCSAT: number; followups: number }>);

  // Calculate weekly performance with fallbacks
  const weeklyPerformanceData = Object.entries(weeklyPerformance).map(([week, data]) => ({
    week,
    conversionRate: (data.converted / data.total) * 100,
    csatRate: (data.positiveCSAT / data.total) * 100,
    followupRate: (data.followups / data.total) * 100,
    totalOffers: data.total
  }));

  // Calculate average weekly conversion rate with fallback
  const averageWeeklyConversionRate = weeklyPerformanceData.length > 0
    ? weeklyPerformanceData.reduce((sum, data) => sum + data.conversionRate, 0) / weeklyPerformanceData.length
    : 0;

  // Calculate best and worst performing channels and types
  const channelMetrics = Object.entries(channels).map(([channel, data]) => ({
    channel,
    csat: typeof data.csat === 'number' ? data.csat : 0
  }));

  const typeMetrics = Object.entries(offerTypes).map(([type, data]) => ({
    type,
    csat: typeof data.csat === 'number' ? data.csat : 0
  }));

  const topChannel = channelMetrics.reduce((best, current) => current.csat > best.csat ? current : best);
  const bottomChannel = channelMetrics.reduce((worst, current) => current.csat < worst.csat ? current : worst);
  const topType = typeMetrics.reduce((best, current) => current.csat > best.csat ? current : best);
  const bottomType = typeMetrics.reduce((worst, current) => current.csat < worst.csat ? current : worst);

  // Calculate channel and type performance for display
  const sortedChannels = Object.entries(channels).sort((a, b) => ((b[1].csat ?? 0) - (a[1].csat ?? 0)));
  const sortedTypes = Object.entries(offerTypes).sort((a, b) => ((b[1].csat ?? 0) - (a[1].csat ?? 0)));

  const bestChannelName = sortedChannels[0]?.[0] || 'N/A';
  const worstChannelName = sortedChannels[sortedChannels.length - 1]?.[0] || 'N/A';
  const bestTypeName = sortedTypes[0]?.[0] || 'N/A';
  const worstTypeName = sortedTypes[sortedTypes.length - 1]?.[0] || 'N/A';

  // Calculate time-based metrics
  const timeMetrics = (() => {
    const byHour = {} as Record<number, number>;
    const byDay = {} as Record<string, number>;
    
    offers.forEach(offer => {
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
  })();

  // Calculate conversion metrics
  const conversionMetrics = (() => {
    const totalOffers = offers.length;
    const totalConversions = offers.filter(o => o.converted).length;
    const conversionRate = totalOffers > 0 
      ? (totalConversions / totalOffers) * 100 
      : 0;
    
    // Get conversion rate by channel
    const channelConversions = offers.reduce((acc, offer) => {
      if (!acc[offer.channel]) {
        acc[offer.channel] = { total: 0, converted: 0 };
      }
      acc[offer.channel].total++;
      if (offer.converted) acc[offer.channel].converted++;
      return acc;
    }, {} as Record<string, { total: number; converted: number }>);

    const channelData = Object.entries(channelConversions).map(([channel, data]) => ({
      name: channel,
      value: (data.converted / data.total) * 100
    }));

    const topChannel = channelData.length > 0
      ? channelData.reduce((best, current) => current.value > best.value ? current : best)
      : { name: 'N/A', value: 0 };
    
    // Get conversion rate by type
    const typeConversions = offers.reduce((acc, offer) => {
      if (!acc[offer.offerType]) {
        acc[offer.offerType] = { total: 0, converted: 0 };
      }
      acc[offer.offerType].total++;
      if (offer.converted) acc[offer.offerType].converted++;
      return acc;
    }, {} as Record<string, { total: number; converted: number }>);

    const typeData = Object.entries(typeConversions).map(([type, data]) => ({
      name: type,
      value: (data.converted / data.total) * 100
    }));

    const topType = typeData.length > 0
      ? typeData.reduce((best, current) => current.value > best.value ? current : best)
      : { name: 'N/A', value: 0 };
    
    return {
      topChannel,
      topType
    };
  })();

  // Calculate daily trends data
  const dailyTrendsData = (() => {
    const dailyData = offers.reduce((acc, offer) => {
      const date = format(parseISO(offer.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { total: 0, converted: 0 };
      }
      acc[date].total++;
      if (offer.converted) acc[date].converted++;
      return acc;
    }, {} as Record<string, { total: number; converted: number }>);

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      conversionRate: (data.converted / data.total) * 100
    }));
  })();

  // Fix type comparisons in the code
  const avgTimeToConvert = offers
    .filter(o => o.converted && o.followupDate)
    .reduce((acc, offer) => {
      const offerDate = parseISO(offer.date);
      const followupDate = parseISO(offer.followupDate || '');
      return acc + differenceInDays(followupDate, offerDate);
    }, 0) / (offers.filter(o => o.converted && o.followupDate).length || 1);

  // Fix channel data comparison
  const channelData = Object.entries(channels).map(([channel, data]) => ({
    channel,
    count: offers.filter(o => o.channel === channel).length,
    csat: typeof data.csat === 'number' ? data.csat : 0
  }));

  // Fix offer type data comparison
  const typeData = Object.entries(offerTypes).map(([type, data]) => ({
    type,
    count: offers.filter(o => o.offerType === type).length,
    csat: typeof data.csat === 'number' ? data.csat : 0
  }));

  // Fix channel trends comparison
  const channelTrends = Object.entries(channels).map(([channel, data]) => {
    const channelOffers = offers.filter(o => o.channel === channel);
    const weeklyTrend = channelOffers.length > 0 ? channelOffers.reduce((acc, offer) => {
      const offerDate = parseISO(offer.date);
      const weekStart = startOfWeek(offerDate);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      if (!acc[weekKey]) {
        acc[weekKey] = { total: 0, converted: 0 };
      }
      acc[weekKey].total++;
      if (offer.converted) acc[weekKey].converted++;
      return acc;
    }, {} as Record<string, { total: number; converted: number }>) : {};
    return { channel, weeklyTrend };
  });

  // Fix offer type trends comparison
  const typeTrends = Object.entries(offerTypes).map(([type, data]) => {
    const typeOffers = offers.filter(o => o.offerType === type);
    const weeklyTrend = typeOffers.length > 0 ? typeOffers.reduce((acc, offer) => {
      const offerDate = parseISO(offer.date);
      const weekStart = startOfWeek(offerDate);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      if (!acc[weekKey]) {
        acc[weekKey] = { total: 0, converted: 0 };
      }
      acc[weekKey].total++;
      if (offer.converted) acc[weekKey].converted++;
      return acc;
    }, {} as Record<string, { total: number; converted: number }>) : {};
    return { type, weeklyTrend };
  });

  // Fix channel improvements comparison
  const channelImprovements = channelTrends.map(({ channel, weeklyTrend }) => {
    const sortedTrend = Object.entries(weeklyTrend).sort((a, b) => a[0].localeCompare(b[0]));
    const improvement = sortedTrend.length > 0
      ? sortedTrend[sortedTrend.length - 1][1].converted - sortedTrend[0][1].converted
      : 0;
    return { channel, improvement };
  });

  // Fix type improvements comparison
  const typeImprovements = typeTrends.map(({ type, weeklyTrend }) => {
    const sortedTrend = Object.entries(weeklyTrend).sort((a, b) => a[0].localeCompare(b[0]));
    const improvement = sortedTrend.length > 0
      ? sortedTrend[sortedTrend.length - 1][1].converted - sortedTrend[0][1].converted
      : 0;
    return { type, improvement };
  });

  // Fix channel performance trends display
  const getChannelTrendData = (weeklyTrend: Record<string, { total: number; converted: number }>) => {
    const sortedTrend = Object.entries(weeklyTrend).sort((a, b) => a[0].localeCompare(b[0]));
    const lastTrend = sortedTrend[sortedTrend.length - 1]?.[1] || { total: 0, converted: 0 };
    const firstTrend = sortedTrend[0]?.[1] || { total: 0, converted: 0 };
    const lastConversionRate = lastTrend.total > 0 ? (lastTrend.converted / lastTrend.total) * 100 : 0;
    const firstConversionRate = firstTrend.total > 0 ? (firstTrend.converted / firstTrend.total) * 100 : 0;
    return {
      lastConversionRate,
      firstConversionRate,
      isImprovement: lastConversionRate > firstConversionRate
    };
  };

  // Fix CSAT display in tables
  const formatCSAT = (csat: 'positive' | 'neutral' | 'negative' | number | undefined): string => {
    if (csat === undefined) return '-';
    if (typeof csat === 'number') {
      if (csat > 0) return 'Positive';
      if (csat < 0) return 'Negative';
      return 'Neutral';
    }
    // At this point, TypeScript knows csat is a string enum value
    const formatted = csat === 'positive' ? 'Positive' :
                     csat === 'negative' ? 'Negative' : 'Neutral';
    return formatted;
  };

  // Calculate channel performance
  const channelPerformance = Array.from(calculateChannelPerformance(offers).entries());
  const maxCurrent = Math.max(...channelPerformance.map(([, metrics]) => metrics.current));

  // Calculate consistency metric
  const dailyCounts = offers.reduce((acc, offer) => {
    const day = format(parseISO(offer.date), 'yyyy-MM-dd');
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dailyOfferValues = Object.values(dailyCounts);
  const avgDaily = totalOffers / (differenceInDays(dateRange.end, dateRange.start) + 1) || 1;
  const stdDev = Math.sqrt(
    dailyOfferValues.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) / dailyOfferValues.length
  );

  const consistencyRate = (stdDev / avgDaily) * 100;
  let consistencyLabel = 'Low';
  if (consistencyRate < 15) consistencyLabel = 'High';
  else if (consistencyRate < 30) consistencyLabel = 'Medium';

  // Calculate CSAT breakdowns
  const csatByChannel = Object.entries(channels).map(([channel, data]) => {
    const relevant = offers.filter(o => o.channel === channel);
    const positives = relevant.filter(o => o.csat === 'positive' || o.csat === 1).length;
    const rate = relevant.length > 0 ? (positives / relevant.length) * 100 : 0;
    return { channel, csat: rate };
  });

  const csatByType = Object.entries(offerTypes).map(([type, data]) => {
    const relevant = offers.filter(o => o.offerType === type);
    const positives = relevant.filter(o => o.csat === 'positive' || o.csat === 1).length;
    const rate = relevant.length > 0 ? (positives / relevant.length) * 100 : 0;
    return { type, csat: rate };
  });

  // Calculate opportunity watchlist
  const lowCSATChannels = csatByChannel.filter(c => c.csat < 60);
  const lowConvertTypes = Object.entries(offerTypes).filter(([type]) => {
    const relevant = offers.filter(o => o.offerType === type);
    const converted = relevant.filter(o => o.converted).length;
    const rate = relevant.length > 0 ? (converted / relevant.length) * 100 : 0;
    return rate < 10;
  }).map(([type]) => type);

  const lowUsageChannels = Object.entries(channels).filter(([channel]) => {
    const count = offers.filter(o => o.channel === channel).length;
    return count / offers.length < 0.1;
  }).map(([channel]) => channel);

  const overallScore = Math.round(
    (conversionRate * 0.4) +
    (csatRate * 0.3) +
    (followupRate * 0.2) +
    (goalAchievementRate * 0.1)
  );
  
  const scoreLabel = overallScore >= 90 ? "Excellent"
    : overallScore >= 75 ? "Good"
    : overallScore >= 60 ? "Room to Grow"
    : "Needs Attention";

  const scoreColor = overallScore >= 90 ? '#2563eb'
    : overallScore >= 75 ? '#22c55e'
    : overallScore >= 60 ? '#f59e0b'
    : '#ef4444';

  const csatDrop = previousPeriodData && csatRate < previousPeriodData.conversionRate;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* PAGE 1: Summary Dashboard */}
        <View style={styles.header}>
          <Text style={styles.title}>{userName}</Text>
          <View style={[styles.metric, { fontSize: 11, marginBottom: 8 }]}>
            <Text style={styles.metricLabel}>
              Offers: {totalOffers}   |   Converted: {convertedOffers}   |   Follow-ups: {offers.filter(o => o.hasFollowup).length}   |   CSAT+: {offers.filter(o => o.csat === 'positive' || o.csat === 1).length}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance Score</Text>
          <Text style={[styles.metricValue, { fontSize: 20, color: scoreColor }]}>
            {overallScore} – {scoreLabel}
          </Text>        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, minWidth: '45%', marginBottom: 10 }}>
              <Text style={styles.metricLabel}>Total Offers</Text>
              <Text style={styles.metricValue}>{totalOffers}</Text>
            </View>
            <View style={{ backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, minWidth: '45%', marginBottom: 10 }}>
              <Text style={styles.metricLabel}>Conversion Rate</Text>
              <Text style={styles.metricValue}>
                {conversionRate.toFixed(1)}%
                {' '}
                {conversionRate >= 20 ? "🟢" : conversionRate >= 10 ? "🟡" : "🔴"}
              </Text>
            </View>
            <View style={{ backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, minWidth: '45%', marginBottom: 10 }}>
              <Text style={styles.metricLabel}>CSAT</Text>
              <Text style={styles.metricValue}>
                {csatRate.toFixed(1)}%
                {' '}
                {csatRate >= 80 ? "🟢" : csatRate >= 50 ? "🟡" : "🔴"}
              </Text>
            </View>
            <View style={{ backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, minWidth: '45%', marginBottom: 10 }}>
              <Text style={styles.metricLabel}>Follow-Up Rate</Text>
              <Text style={styles.metricValue}>
                {followupRate.toFixed(1)}%
                {' '}
                {followupRate >= 50 ? "🟢" : followupRate >= 30 ? "🟡" : "🔴"}
              </Text>
            </View>
            <View style={{ backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, minWidth: '45%', marginBottom: 10 }}>
              <Text style={styles.metricLabel}>Goal Achievement</Text>
              <Text style={styles.metricValue}>
                {goalAchievementRate.toFixed(1)}%
                {' '}
                {goalAchievementRate >= 100 ? "🟢" : goalAchievementRate >= 75 ? "🟡" : "🔴"}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Daily Consistency</Text>
              <Text style={styles.metricValue}>{consistencyLabel}</Text>
              <Text style={styles.insightSubtext}>{consistencyRate.toFixed(1)}% variation</Text>
            </View>
          </View>
        </View>

        {/* CSAT Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 CSAT Breakdown</Text>
          <Text style={styles.subsectionTitle}>By Channel</Text>
          {csatByChannel.map(({ channel, csat }) => (
            <Text key={channel} style={styles.notesContent}>{channel}: {csat.toFixed(1)}%</Text>
          ))}

          <Text style={styles.subsectionTitle}>By Offer Type</Text>
          {csatByType.map(({ type, csat }) => (
            <Text key={type} style={styles.notesContent}>{type}: {csat.toFixed(1)}%</Text>
          ))}
        </View>

        {/* Quick Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Highlights</Text>
          {bestChannelName === worstChannelName ? (
            <Text>Only active channel: {bestChannelName}</Text>
          ) : (
            <>
              <Text>🟢 Best Channel: {bestChannelName}</Text>
              <Text>🔴 Weakest Channel: {worstChannelName}</Text>
            </>
          )}
          {bestTypeName === worstTypeName ? (
            <Text>Only active offer type: {bestTypeName}</Text>
          ) : (
            <>
              <Text>🟢 Best Offer Type: {bestTypeName}</Text>
              <Text>🔴 Weakest Offer Type: {worstTypeName}</Text>
            </>
          )}
          <Text>📈 Best Day: {format(parseISO(bestDay), 'MMM d')} ({bestDayCount} offers)</Text>
          <Text>📉 Worst Day: {format(parseISO(worstDay), 'MMM d')} ({worstDayCount} offers)</Text>
        </View>

        {/* Top Tip Guidance */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>🧠 Top Tip</Text>
          <Text style={styles.highlightContent}>
            {followupRate < 30
              ? 'Consider improving follow-up rate — it can directly impact conversions.'
              : csatRate < 60
              ? 'Work on creating more positive experiences — your CSAT is below 60%.'
              : conversionRate < 10
              ? 'Low conversion rate — review how you're presenting value to customers.'
              : 'You're doing great — keep pushing for consistency!'}
          </Text>
        </View>

        {/* Summary Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Flags</Text>
          <Text>{goalAchievementRate >= 100 ? "✅ Goal achieved" : "⚠️ Below goal"}</Text>
          <Text>{followupRate < 30 ? "⚠️ Follow-up rate low" : "✅ Follow-up rate healthy"}</Text>
          <Text>{csatDrop ? "⛔️ CSAT dip from last month" : "✅ CSAT steady or improved"}</Text>
        </View>

        {/* Opportunity Watchlist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚩 Opportunity Watchlist</Text>
          {lowCSATChannels.map(({ channel }) => (
            <Text style={styles.notesContent} key={channel}>• Low CSAT on {channel}</Text>
          ))}
          {lowConvertTypes.map(type => (
            <Text style={styles.notesContent} key={type}>• Low conversion on {type}</Text>
          ))}
          {lowUsageChannels.map(channel => (
            <Text style={styles.notesContent} key={channel}>• Underused channel: {channel}</Text>
          ))}
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>🎯 Suggested Focus</Text>
          <Text style={styles.highlightContent}>
            {followupRate < 30
              ? "Improve follow-up rate above 30%."
              : csatDrop
              ? "Focus on delivering positive experiences."
              : conversionRate < 10
              ? "Experiment with offer timing or types."
              : "Keep up the strong performance!"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Weekly Offer Summary</Text>
          {weeklyPerformanceData.map(({ week, totalOffers }, i) => (
            <Text key={week} style={styles.notesContent}>Week {week}: {totalOffers} offers</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Offer Streak</Text>
          {(() => {
            const sortedDates = Object.keys(dailyPerformance).sort();
            let streak = 0, maxStreak = 0;
            for (let i = 0; i < sortedDates.length; i++) {
              const current = parseISO(sortedDates[i]);
              const next = parseISO(sortedDates[i + 1]);
              streak++;
              if (!next || differenceInDays(next, current) !== 1) {
                maxStreak = Math.max(maxStreak, streak);
                streak = 0;
              }
            }
            return (
              <Text style={styles.notesContent}>
                {maxStreak >= 5
                  ? `🔥 ${maxStreak}-day active streak! Keep it going.`
                  : `${maxStreak}-day activity streak. Aim for 5+ days in a row!`}
              </Text>
            );
          })()}
        </View>
      </Page>
      
      {/* PAGE 2: Trends Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Trends</Text>
          <Text style={styles.subtitle}>
            {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d")}
          </Text>
        </View>
 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Conversion Trend</Text>
          <View style={[styles.trendBar, { height: 20, backgroundColor: '#f3f4f6', marginTop: 5 }]}>
            {(() => {
              const weekly = offers.reduce((acc, offer) => {
                const week = format(startOfWeek(parseISO(offer.date)), 'yyyy-MM-dd');
                if (!acc[week]) acc[week] = { total: 0, converted: 0 };
                acc[week].total++;
                if (offer.converted) acc[week].converted++;
                return acc;
              }, {} as Record<string, { total: number, converted: number }>);

              const weeklyEntries = Object.entries(weekly).sort(([a], [b]) => a.localeCompare(b));
              return weeklyEntries.map(([week, data], index) => {
                const rate = data.total > 0 ? (data.converted / data.total) * 100 : 0;
                return (
                  <View key={index} style={{
                    width: `${100 / weeklyEntries.length}%`,
                    backgroundColor: rate > 20 ? '#22c55e' : '#ef4444',
                    height: `${Math.max(rate, 10)}%`                  }}>
                    <Text style={{ display: 'none' }}>{rate.toFixed(1)}%</Text>
                  </View>
                );
              });
            })()}
          </View>
          <Text style={styles.trendLabel}>Conversion % per week</Text>
        </View>
 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CSAT Trend</Text>
          <View style={[styles.trendBar, { height: 20, backgroundColor: '#f3f4f6', marginTop: 5 }]}>
            {(() => {
              const weekly = offers.reduce((acc, offer) => {
                const week = format(startOfWeek(parseISO(offer.date)), 'yyyy-MM-dd');
                if (!acc[week]) acc[week] = { total: 0, positive: 0 };
                acc[week].total++;
                if (offer.csat === 'positive' || offer.csat === 1) acc[week].positive++;
                return acc;
              }, {} as Record<string, { total: number, positive: number }>);

              const entries = Object.entries(weekly).sort(([a], [b]) => a.localeCompare(b));
              return entries.map(([week, data], index) => {
                const rate = data.total > 0 ? (data.positive / data.total) * 100 : 0;
                return (
                  <View key={index} style={{
                    width: `${100 / entries.length}%`,
                    backgroundColor: rate >= 80 ? '#22c55e' : '#ef4444',
                    height: `${rate}%`
                  }}>
                    <Text style={{ display: 'none' }}>{rate.toFixed(1)}%</Text>
                  </View>
                );
              });
            })()}
          </View>
          <Text style={styles.trendLabel}>Positive CSAT % per week</Text>
        </View>
 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-Up Trend</Text>
          <View style={[styles.trendBar, { height: 20, backgroundColor: '#f3f4f6', marginTop: 5 }]}>
            {(() => {
              const weekly = offers.reduce((acc, offer) => {
                const week = format(startOfWeek(parseISO(offer.date)), 'yyyy-MM-dd');
                if (!acc[week]) acc[week] = { total: 0, followed: 0 };
                acc[week].total++;
                if (offer.followupDate) acc[week].followed++;
                return acc;
              }, {} as Record<string, { total: number, followed: number }>);

              const entries = Object.entries(weekly).sort(([a], [b]) => a.localeCompare(b));
              return entries.map(([week, data], index) => {
                const rate = data.total > 0 ? (data.followed / data.total) * 100 : 0;
                return (
                  <View key={index} style={{
                    width: `${100 / entries.length}%`,
                    backgroundColor: rate >= 50 ? '#22c55e' : '#ef4444',
                    height: `${rate}%`
                  }}>
                    <Text style={{ display: 'none' }}>{rate.toFixed(1)}%</Text>
                  </View>
                );
              });
            })()}
          </View>
          <Text style={styles.trendLabel}>Follow-Up % per week</Text>
        </View>
 
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Self-Reflection</Text>
          <Text style={styles.notesContent}>
            "What went well this week?" _______________________________________
          </Text>
          <Text style={styles.notesContent}>
            "Where could I use support?" _______________________________________
          </Text>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Agent Note</Text>
          <Text style={styles.notesContent}>
            {agentComment || '(Optional agent reflection or summary here)'}
          </Text>
        </View>

        {/* Auto Coaching Prompts */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>💡 Auto Coaching Prompts</Text>
          {goalAchievementRate < 75 && (
            <Text style={styles.notesContent}>- Consider what blocked goal progress this period.</Text>
          )}
          {followupRate < 30 && (
            <Text style={styles.notesContent}>- Explore strategies to improve follow-up engagement.</Text>
          )}
          {csatDrop && (
            <Text style={styles.notesContent}>- Look into recent feedback trends for improvement areas.</Text>
          )}
          {conversionRate < 10 && (
            <Text style={styles.notesContent}>- Try experimenting with timing or offer types to increase conversions.</Text>
          )}
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Export Settings</Text>
          <Text style={styles.notesContent}>
            • Filtered Channels: {Object.keys(channels).join(', ') || 'All'}
          </Text>
          <Text style={styles.notesContent}>
            • Offer Types: {Object.keys(offerTypes).join(', ') || 'All'}
          </Text>
          <Text style={styles.notesContent}>
            • Period: {format(new Date(dateRange.start), 'MMM d')} - {format(new Date(dateRange.end), 'MMM d, yyyy')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};