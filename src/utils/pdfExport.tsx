import { format, parseISO, differenceInDays, subMonths, startOfWeek, addDays } from "date-fns";
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

// Register standard fonts that are built into PDF readers
Font.registerHyphenationCallback(word => [word]);

// Use standard fonts instead of custom fonts
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 15,
    borderBottom: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    flex: 1,
    color: '#374151',
  },
  tableCellHeader: {
    padding: 6,
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1,
    color: '#111827',
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 11,
    paddingVertical: 3,
  },
  metricLabel: {
    color: '#4b5563',
  },
  metricValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  filterSection: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  filterValue: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 3,
  },
  coachingSection: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  coachingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  coachingContent: {
    fontSize: 11,
    color: '#0c4a6e',
    marginBottom: 3,
  },
  notesSection: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 4,
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  notesContent: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 3,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  insightCard: {
    flex: 1,
    minWidth: '45%',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  insightTitle: {
    marginBottom: 3,
    fontWeight: 'bold',
  },
  insightValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  insightSubtext: {
    fontSize: 9,
    color: '#6b7280',
  },
  trendCard: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  trendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  trendBar: {
    flexDirection: 'row',
    height: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trendSegment: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  trendLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 3,
  },
  metricsGrid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricCard: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
    minWidth: '45%',
    alignItems: 'center',
  },
  improvementSection: {
    marginBottom: 8,
  },
  improvementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#111827',
  },
  improvementText: {
    fontSize: 11,
    color: '#374151',
  },
  agentComment: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 8,
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  weekMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  weekMetricLabel: {
    fontWeight: 'bold',
  },
  reflectionContainer: {
    marginBottom: 8,
  },
  reflectionPrompt: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  reflectionInput: {
    fontSize: 11,
    color: '#4b5563',
  },
  agentNote: {
    fontSize: 11,
    color: '#374151',
  },
  insightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  insightText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightLabel: {
    fontWeight: 'bold',
  },
  channelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelCard: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
    minWidth: '45%',
    marginBottom: 8,
  },
  channelTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  channelMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelMetricLabel: {
    fontWeight: 'bold',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
    minWidth: '45%',
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  typeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeMetricLabel: {
    fontWeight: 'bold',
  },
  notesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notesLabel: {
    fontWeight: 'bold',
  },
  performanceScore: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  performanceColumn: {
    flex: 1,
  },
  performanceMetricCard: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  metricDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  performanceMetricLabel: {
    fontSize: 11,
    color: '#4b5563',
  },
  performanceMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timeAnalysis: {
    marginBottom: 15,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeLabel: {
    width: 70,
    fontSize: 11,
    color: '#4b5563',
  },
  timeBar: {
    flex: 1,
    height: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 6,
  },
  timeBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  timeValue: {
    width: 50,
    fontSize: 11,
    textAlign: 'right',
    color: '#111827',
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  bar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
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
  notes?: string;
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

export function generatePDFReport({ 
  offers, 
  channels, 
  offerTypes, 
  dateRange, 
  userName,
  dailyGoal,
  previousPeriodData: initialPreviousPeriodData,
  baseUrl,
  agentComment
}: PDFReportProps) {
  // Calculate base metrics first - replace useMemo
  const metrics = (() => {
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

    // Calculate channel metrics
    const channelMetrics = Object.entries(channels).map(([channel, data]) => ({
      channel,
      count: offers.filter(o => o.channel === channel).length,
      csat: typeof data.csat === 'number' ? data.csat : 0
    }));

    // Calculate type metrics
    const typeMetrics = Object.entries(offerTypes).map(([type, data]) => ({
      type,
      count: offers.filter(o => o.offerType === type).length,
      csat: typeof data.csat === 'number' ? data.csat : 0
    }));

    // Find best and worst performing channels and types
    const bestChannel = channelMetrics.length > 0 
      ? [...channelMetrics].sort((a, b) => b.csat - a.csat)[0]
      : { channel: 'N/A', csat: 0 };
    const worstChannel = channelMetrics.length > 0
      ? [...channelMetrics].sort((a, b) => a.csat - b.csat)[0]
      : { channel: 'N/A', csat: 0 };

    const bestType = typeMetrics.length > 0
      ? [...typeMetrics].sort((a, b) => b.csat - a.csat)[0]
      : { type: 'N/A', csat: 0 };
    const worstType = typeMetrics.length > 0
      ? [...typeMetrics].sort((a, b) => a.csat - b.csat)[0]
      : { type: 'N/A', csat: 0 };

    // Calculate daily performance
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

    // Calculate best and worst days
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

    // Calculate most common channel and type
    const mostCommonChannel = channelMetrics.length > 0
      ? channelMetrics.reduce((best, current) => current.count > best.count ? current : best)
      : { channel: 'N/A', count: 0 };

    const mostCommonType = typeMetrics.length > 0
      ? typeMetrics.reduce((best, current) => current.count > best.count ? current : best)
      : { type: 'N/A', count: 0 };

    // Calculate opportunity watchlist
    const lowCSATChannels = channelMetrics.filter(c => c.csat < 60);
    const lowConvertTypes = typeMetrics.filter(t => {
      const relevant = offers.filter(o => o.offerType === t.type);
      const converted = relevant.filter(o => o.converted).length;
      const rate = relevant.length > 0 ? (converted / relevant.length) * 100 : 0;
      return rate < 10;
    });
    const lowUsageChannels = channelMetrics.filter(c => c.count / totalOffers < 0.1);

    return {
      totalOffers,
      convertedOffers,
      conversionRate,
      positiveCSAT,
      csatRate,
      followupOffers,
      followupRate,
      periodDays,
      averageDailyOffers,
      goalAchievementRate,
      channelMetrics,
      typeMetrics,
      bestChannel,
      worstChannel,
      bestType,
      worstType,
      bestDay,
      worstDay,
      bestDayCount,
      worstDayCount,
      mostCommonChannel,
      mostCommonType,
      consistencyRate,
      consistencyLabel,
      lowCSATChannels,
      lowConvertTypes,
      lowUsageChannels
    };
  })();

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

  // Calculate daily performance trends - replace useMemo
  const dailyPerformance = (() => {
    if (!offers || !Array.isArray(offers)) {
      return {} as Record<string, { total: number; converted: number; positiveCSAT: number; followups: number }>;
    }

    // Create an array of all dates in the range
    const dates: string[] = [];
    let currentDate = startOfWeek(dateRange.start);
    const endDate = dateRange.end;
    
    while (currentDate <= endDate) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    }

    // Initialize all dates with zero values
    const initialData = dates.reduce((acc, date) => {
      acc[date] = {
        total: 0,
        converted: 0,
        positiveCSAT: 0,
        followups: 0
      };
      return acc;
    }, {} as Record<string, { total: number; converted: number; positiveCSAT: number; followups: number }>);

    // Add actual offer data
    return offers.reduce((acc, offer) => {
      if (!offer?.date) return acc;
      try {
        const date = format(parseISO(offer.date), 'yyyy-MM-dd');
        if (acc[date]) {
          acc[date].total++;
          if (offer.converted) acc[date].converted++;
          if (offer.csat === 'positive' || offer.csat === 1) acc[date].positiveCSAT++;
          if (offer.followupDate) acc[date].followups++;
        }
      } catch (error) {
        console.error('Error processing offer date:', error);
      }
      return acc;
    }, initialData);
  })();

  const dailyPerformanceData = Object.entries(dailyPerformance).map(([date, data]) => ({
    date,
    conversionRate: data.total > 0 ? (data.converted / data.total) * 100 : 0,
    csatRate: data.total > 0 ? (data.positiveCSAT / data.total) * 100 : 0,
    followupRate: data.total > 0 ? (data.followups / data.total) * 100 : 0,
    totalOffers: data.total
  }));

  // Calculate weekly performance - replace useMemo
  const weeklyPerformance = (() => {
    const weeks: Array<{
      totalOffers: number;
      conversionRate: number;
      csatRate: number;
      followupRate: number;
      startDate: string;
      endDate: string;
    }> = [];
    
    // Group days by calendar week
    const weeklyData = dailyPerformanceData.reduce((acc, day) => {
      // Skip days with no offers
      if (day.totalOffers === 0) return acc;
      
      const weekStart = format(startOfWeek(parseISO(day.date)), 'yyyy-MM-dd');
      
      if (!acc[weekStart]) {
        acc[weekStart] = {
          days: [],
          totalOffers: 0,
          converted: 0,
          positiveCSAT: 0,
          followups: 0
        };
      }
      
      acc[weekStart].days.push(day);
      acc[weekStart].totalOffers += day.totalOffers;
      acc[weekStart].converted += (day.conversionRate / 100) * day.totalOffers;
      acc[weekStart].positiveCSAT += (day.csatRate / 100) * day.totalOffers;
      acc[weekStart].followups += (day.followupRate / 100) * day.totalOffers;
      
      return acc;
    }, {} as Record<string, {
      days: typeof dailyPerformanceData[0][];
      totalOffers: number;
      converted: number;
      positiveCSAT: number;
      followups: number;
    }>);
    
    // Convert to array format
    Object.entries(weeklyData).forEach(([weekStart, data]) => {
      if (data.days.length === 0) return;
      
      // Sort days to find the last day of the week
      const sortedDays = [...data.days].sort((a, b) => 
        parseISO(b.date).getTime() - parseISO(a.date).getTime()
      );
      
      weeks.push({
        startDate: weekStart,
        endDate: sortedDays[0].date,
        totalOffers: data.totalOffers,
        conversionRate: data.totalOffers > 0 ? (data.converted / data.totalOffers) * 100 : 0,
        csatRate: data.totalOffers > 0 ? (data.positiveCSAT / data.totalOffers) * 100 : 0,
        followupRate: data.totalOffers > 0 ? (data.followups / data.totalOffers) * 100 : 0
      });
    });
    
    // Sort weeks by start date
    return weeks.sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  })();

  // Calculate time-based metrics
  const timeBasedMetrics = (() => {
    const timeRanges = {
      morning: { start: 6, end: 12 },
      afternoon: { start: 12, end: 18 },
      evening: { start: 18, end: 24 }
    };

    const timePerformance = Object.entries(timeRanges).map(([range, { start, end }]) => {
      const rangeOffers = offers.filter(offer => {
        const hour = new Date(offer.date).getHours();
        return hour >= start && hour < end;
      });

      const total = rangeOffers.length;
      const converted = rangeOffers.filter(o => o.converted).length;
      const positiveCSAT = rangeOffers.filter(o => o.csat === 'positive' || o.csat === 1).length;
      const followups = rangeOffers.filter(o => o.followupDate).length;

      return {
        range,
        total,
        conversionRate: total > 0 ? (converted / total) * 100 : 0,
        csatRate: total > 0 ? (positiveCSAT / total) * 100 : 0,
        followupRate: total > 0 ? (followups / total) * 100 : 0
      };
    });

    return timePerformance;
  })();

  // Calculate conversion metrics
  const conversionMetrics = (() => {
    const dailyCounts = offers.reduce((acc, offer) => {
      const day = format(parseISO(offer.date), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyOfferValues = Object.values(dailyCounts);
    const avgDaily = metrics.totalOffers / (differenceInDays(dateRange.end, dateRange.start) + 1) || 1;
    const stdDev = Math.sqrt(
      dailyOfferValues.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) / dailyOfferValues.length
    );

    return {
      avgDaily,
      stdDev,
      consistencyRate: (stdDev / avgDaily) * 100
    };
  })();

  // Calculate performance score
  const performanceScore = Math.round(
    (metrics.conversionRate * 0.4) +
    (metrics.csatRate * 0.3) +
    (metrics.followupRate * 0.2) +
    (metrics.goalAchievementRate * 0.1)
  );
  
  const performanceLabel = performanceScore >= 90 ? "Excellent"
    : performanceScore >= 75 ? "Good"
    : performanceScore >= 60 ? "Room to Grow"
    : "Needs Attention";

  const performanceColor = performanceScore >= 90 ? '#2563eb'
    : performanceScore >= 75 ? '#22c55e'
    : performanceScore >= 60 ? '#f59e0b'
    : '#ef4444';

  const hasCSATDrop = previousPeriodData && metrics.csatRate < previousPeriodData.conversionRate;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Offer Tracker Performance Report</Text>
          <Text style={styles.subtitle}>{userName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Details</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesContent}>
              <Text style={styles.notesLabel}>Generated: </Text>
              <Text>{format(new Date(), 'MMM d, yyyy h:mm a')}</Text>
            </Text>
            <Text style={styles.notesContent}>
              <Text style={styles.notesLabel}>Period: </Text>
              <Text>{format(new Date(dateRange.start), 'MMM d')} - {format(new Date(dateRange.end), 'MMM d, yyyy')}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.performanceScore}>
            <View style={styles.performanceColumn}>
              <View style={styles.performanceMetricCard}>
                <View style={styles.metricLabelRow}>
                  <View style={[styles.metricDot, { backgroundColor: '#3b82f6' }]}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={styles.performanceMetricLabel}>Conversion Rate</Text>
                </View>
                <Text style={styles.performanceMetricValue}>{metrics.conversionRate.toFixed(1)}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(metrics.conversionRate, 100)}%`,
                        backgroundColor: metrics.conversionRate >= 70 ? '#22c55e' : 
                                       metrics.conversionRate >= 30 ? '#f59e0b' : '#ef4444'
                      }
                    ]} 
                  >
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                </View>
              </View>
              <View style={styles.performanceMetricCard}>
                <View style={styles.metricLabelRow}>
                  <View style={[styles.metricDot, { backgroundColor: '#10b981' }]}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={styles.performanceMetricLabel}>CSAT</Text>
                </View>
                <Text style={styles.performanceMetricValue}>{metrics.csatRate.toFixed(1)}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(metrics.csatRate, 100)}%`,
                        backgroundColor: metrics.csatRate >= 70 ? '#22c55e' : 
                                       metrics.csatRate >= 30 ? '#f59e0b' : '#ef4444'
                      }
                    ]} 
                  >
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.performanceColumn}>
              <View style={styles.performanceMetricCard}>
                <View style={styles.metricLabelRow}>
                  <View style={[styles.metricDot, { backgroundColor: '#f59e0b' }]}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={styles.performanceMetricLabel}>Follow-Up Rate</Text>
                </View>
                <Text style={styles.performanceMetricValue}>{metrics.followupRate.toFixed(1)}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(metrics.followupRate, 100)}%`,
                        backgroundColor: metrics.followupRate >= 70 ? '#22c55e' : 
                                       metrics.followupRate >= 30 ? '#f59e0b' : '#ef4444'
                      }
                    ]} 
                  >
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                </View>
              </View>
              <View style={styles.performanceMetricCard}>
                <View style={styles.metricLabelRow}>
                  <View style={[styles.metricDot, { backgroundColor: '#6366f1' }]}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={styles.performanceMetricLabel}>Goal Achievement</Text>
                </View>
                <Text style={styles.performanceMetricValue}>{metrics.goalAchievementRate.toFixed(1)}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(metrics.goalAchievementRate, 100)}%`,
                        backgroundColor: metrics.goalAchievementRate >= 70 ? '#22c55e' : 
                                       metrics.goalAchievementRate >= 30 ? '#f59e0b' : '#ef4444'
                      }
                    ]} 
                  >
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 }}>Velocity Analysis</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
                Daily Averages
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Offers: {(metrics.totalOffers / metrics.periodDays).toFixed(1)} per day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Conversions: {(metrics.convertedOffers / metrics.periodDays).toFixed(1)} per day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Conversion Rate: {metrics.conversionRate.toFixed(1)}%
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
                Best Day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • {format(parseISO(metrics.bestDay), 'MMM d')}: {metrics.bestDayCount} offers
              </Text>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8, marginTop: 8 }}>
                Worst Day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • {format(parseISO(metrics.worstDay), 'MMM d')}: {metrics.worstDayCount} offers
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
                Consistency
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Rating: {metrics.consistencyLabel}
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Variation: {metrics.consistencyRate.toFixed(1)}%
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Daily Goal: {dailyGoal} offers
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: '#fef3c7', padding: 15, borderRadius: 4 }]}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#92400e', marginBottom: 10 }}>Key Takeaways</Text>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                <Text style={{ display: 'none' }}> </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#78350f' }}>Best Day: {format(parseISO(metrics.bestDay), 'MMM d')} ({metrics.bestDayCount} offers)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                <Text style={{ display: 'none' }}> </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#78350f' }}>Worst Day: {format(parseISO(metrics.worstDay), 'MMM d')} ({metrics.worstDayCount} offers)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                <Text style={{ display: 'none' }}> </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#78350f' }}>Most Common Channel: {metrics.mostCommonChannel.channel} ({metrics.mostCommonChannel.count} offers)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                <Text style={{ display: 'none' }}> </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#78350f' }}>Most Common Type: {metrics.mostCommonType.type} ({metrics.mostCommonType.count} offers)</Text>
            </View>
            {metrics.bestChannel.channel === metrics.worstChannel.channel ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                  <Text style={{ display: 'none' }}> </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#78350f' }}>Only Active Channel: {metrics.bestChannel.channel}</Text>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#78350f' }}>Best Channel: {metrics.bestChannel.channel} ({metrics.bestChannel.csat.toFixed(1)}% CSAT)</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#78350f' }}>Weakest Channel: {metrics.worstChannel.channel} ({metrics.worstChannel.csat.toFixed(1)}% CSAT)</Text>
                </View>
              </>
            )}
            {metrics.bestType.type === metrics.worstType.type ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                  <Text style={{ display: 'none' }}> </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#78350f' }}>Only Active Type: {metrics.bestType.type}</Text>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#78350f' }}>Best Offer Type: {metrics.bestType.type} ({metrics.bestType.csat.toFixed(1)}% CSAT)</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#78350f' }}>Weakest Offer Type: {metrics.worstType.type} ({metrics.worstType.csat.toFixed(1)}% CSAT)</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: '#fef2f2', padding: 15, borderRadius: 4, marginBottom: 20 }]}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#991b1b', marginBottom: 10 }}>Focus Area</Text>
          <Text style={{ fontSize: 12, color: '#7f1d1d', marginBottom: 15 }}>
            {metrics.followupRate < 30 
              ? "Increase your follow-up rate to build stronger customer relationships."
              : metrics.csatRate < 60
              ? "Focus on improving customer experience to raise your CSAT score."
              : metrics.conversionRate < 10
              ? "Experiment with offer timing or types to boost conversions."
              : "Maintain momentum — your performance is trending well."}
          </Text>
          <View style={{ gap: 8 }}>
            {metrics.csatRate < 60 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                  <Text style={{ display: 'none' }}> </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#7f1d1d' }}>Address common CSAT pain points to improve satisfaction.</Text>
              </View>
            )}
            {metrics.conversionRate < 10 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                  <Text style={{ display: 'none' }}> </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#7f1d1d' }}>Review offer timing or messaging to boost conversion.</Text>
              </View>
            )}
            {metrics.followupRate < 30 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                  <Text style={{ display: 'none' }}> </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#7f1d1d' }}>Increase your follow-up activity to maintain customer engagement.</Text>
              </View>
            )}
            {metrics.goalAchievementRate < 75 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                  <Text style={{ display: 'none' }}> </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#7f1d1d' }}>Adjust your daily routine to better meet offer goals.</Text>
              </View>
            )}
            {metrics.consistencyRate > 30 && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#0ea5e9', marginRight: 6 }}>
                  <Text style={{ display: 'none' }}> </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#7f1d1d' }}>Aim for more consistent offer activity throughout the week.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Channel Performance</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(channels).map(([channel, data]) => {
              const channelOffers = offers.filter(o => o.channel === channel);
              const totalOffers = channelOffers.length;
              const convertedOffers = channelOffers.filter(o => o.converted).length;
              const conversionRate = totalOffers > 0 ? (convertedOffers / totalOffers) * 100 : 0;
              
              return (
                <View key={channel} style={{ 
                  flex: 1, 
                  minWidth: '30%', 
                  backgroundColor: '#f9fafb', 
                  padding: 6, 
                  borderRadius: 4 
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: 3, 
                      backgroundColor: '#3b82f6',
                      marginRight: 4 
                    }}>
                      <Text style={{ display: 'none' }}> </Text>
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{channel}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>Offers:</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827' }}>{totalOffers}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>Conv:</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827' }}>{conversionRate.toFixed(1)}%</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>CSAT:</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827' }}>
                      {typeof data.csat === 'number' ? data.csat.toFixed(1) : '0.0'}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offer Type Performance</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(offerTypes).map(([type, data]) => {
              const typeOffers = offers.filter(o => o.offerType === type);
              const totalOffers = typeOffers.length;
              const convertedOffers = typeOffers.filter(o => o.converted).length;
              const conversionRate = totalOffers > 0 ? (convertedOffers / totalOffers) * 100 : 0;
              
              return (
                <View key={type} style={{ 
                  flex: 1, 
                  minWidth: '30%', 
                  backgroundColor: '#f9fafb', 
                  padding: 6, 
                  borderRadius: 4 
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: 3, 
                      backgroundColor: '#10b981',
                      marginRight: 4 
                    }}>
                      <Text style={{ display: 'none' }}> </Text>
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{type}</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>Offers:</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827' }}>{totalOffers}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>Conv:</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827' }}>{conversionRate.toFixed(1)}%</Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 10, color: '#4b5563' }}>CSAT:</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#111827' }}>
                      {typeof data.csat === 'number' ? data.csat.toFixed(1) : '0.0'}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time-Based Performance</Text>
          <View style={styles.timeAnalysis}>
            {timeBasedMetrics.map(({ range, total, conversionRate, csatRate, followupRate }) => (
              <View key={range} style={styles.timeSlot}>
                <Text style={styles.timeLabel}>{range.charAt(0).toUpperCase() + range.slice(1)}</Text>
                <View style={styles.timeBar}>
                  <View 
                    style={[
                      styles.timeBarFill, 
                      { 
                        width: `${Math.min(conversionRate, 100)}%`,
                        backgroundColor: conversionRate >= 20 ? '#22c55e' : conversionRate >= 10 ? '#f59e0b' : '#ef4444'
                      }
                    ]} 
                  >
                    <Text style={{ display: 'none' }}> </Text>
                  </View>
                </View>
                <Text style={styles.timeValue}>{conversionRate.toFixed(1)}%</Text>
              </View>
            ))}
          </View>
          <Text style={styles.notesContent}>Conversion rate by time of day</Text>
        </View>
      </Page>
      
      {/* PAGE 2: Trends Overview */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Trends</Text>
          <Text style={styles.subtitle}>
            {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 }}>Velocity Analysis</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
                Daily Averages
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Offers: {(metrics.totalOffers / metrics.periodDays).toFixed(1)} per day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Conversions: {(metrics.convertedOffers / metrics.periodDays).toFixed(1)} per day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Conversion Rate: {metrics.conversionRate.toFixed(1)}%
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
                Best Day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • {format(parseISO(metrics.bestDay), 'MMM d')}: {metrics.bestDayCount} offers
              </Text>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8, marginTop: 8 }}>
                Worst Day
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • {format(parseISO(metrics.worstDay), 'MMM d')}: {metrics.worstDayCount} offers
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
                Consistency
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Rating: {metrics.consistencyLabel}
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Variation: {metrics.consistencyRate.toFixed(1)}%
              </Text>
              <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
                • Daily Goal: {dailyGoal} offers
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 }}>Weekly Conversion Trend</Text>
          <View style={[styles.trendBar, { height: 20, backgroundColor: '#f3f4f6', marginTop: 5 }]}>
            {(() => {
              if (!offers || !Array.isArray(offers)) {
                return <Text>No offers data available</Text>;
              }

              const weekly = offers.reduce((acc, offer) => {
                if (!offer || typeof offer !== 'object') return acc;
                if (!offer.date || typeof offer.date !== 'string') return acc;
                
                try {
                  const parsedDate = parseISO(offer.date);
                  if (isNaN(parsedDate.getTime())) return acc;
                  
                  const week = format(startOfWeek(parsedDate), 'yyyy-MM-dd');
                  if (!acc[week]) acc[week] = { total: 0, converted: 0 };
                  acc[week].total++;
                  if (offer.converted) acc[week].converted++;
                } catch (error) {
                  console.error('Error processing offer date:', error);
                }
                return acc;
              }, {} as Record<string, { total: number, converted: number }>);

              const weeklyEntries = Object.entries(weekly).sort(([a], [b]) => a.localeCompare(b));
              if (weeklyEntries.length === 0) {
                return <Text>No valid weekly data available</Text>;
              }

              return weeklyEntries.map(([week, data], index) => {
                const rate = data.total > 0 ? (data.converted / data.total) * 100 : 0;
                return (
                  <View key={index} style={{
                    width: `${100 / weeklyEntries.length}%`,
                    backgroundColor: rate > 20 ? '#22c55e' : '#ef4444',
                    height: `${Math.max(rate, 10)}%`
                  }}>
                    <Text style={{ display: 'none' }}>{rate.toFixed(1)}%</Text>
                  </View>
                );
              });
            })()}
          </View>
          <Text style={styles.trendLabel}>Conversion % per week</Text>
        </View>
 
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 }}>CSAT Trend</Text>
          <View style={[styles.trendBar, { height: 20, backgroundColor: '#f3f4f6', marginTop: 5 }]}>
            {(() => {
              if (!offers || !Array.isArray(offers)) {
                return <Text>No offers data available</Text>;
              }

              const weekly = offers.reduce((acc, offer) => {
                if (!offer || typeof offer !== 'object') return acc;
                if (!offer.date || typeof offer.date !== 'string') return acc;
                
                try {
                  const parsedDate = parseISO(offer.date);
                  if (isNaN(parsedDate.getTime())) return acc;
                  
                  const week = format(startOfWeek(parsedDate), 'yyyy-MM-dd');
                  if (!acc[week]) acc[week] = { total: 0, positive: 0 };
                  acc[week].total++;
                  if (offer.csat === 'positive' || offer.csat === 1) acc[week].positive++;
                } catch (error) {
                  console.error('Error processing offer date:', error);
                }
                return acc;
              }, {} as Record<string, { total: number, positive: number }>);

              const entries = Object.entries(weekly).sort(([a], [b]) => a.localeCompare(b));
              if (entries.length === 0) {
                return <Text>No valid weekly data available</Text>;
              }

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
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 }}>Follow-Up Trend</Text>
          <View style={[styles.trendBar, { height: 20, backgroundColor: '#f3f4f6', marginTop: 5 }]}>
            {(() => {
              if (!offers || !Array.isArray(offers)) {
                return <Text>No offers data available</Text>;
              }

              const weekly = offers.reduce((acc, offer) => {
                if (!offer || typeof offer !== 'object') return acc;
                if (!offer.date || typeof offer.date !== 'string') return acc;
                
                try {
                  const parsedDate = parseISO(offer.date);
                  if (isNaN(parsedDate.getTime())) return acc;
                  
                  const week = format(startOfWeek(parsedDate), 'yyyy-MM-dd');
                  if (!acc[week]) acc[week] = { total: 0, followed: 0 };
                  acc[week].total++;
                  if (offer.followupDate) acc[week].followed++;
                } catch (error) {
                  console.error('Error processing offer date:', error);
                }
                return acc;
              }, {} as Record<string, { total: number, followed: number }>);

              const entries = Object.entries(weekly).sort(([a], [b]) => a.localeCompare(b));
              if (entries.length === 0) {
                return <Text>No valid weekly data available</Text>;
              }

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

        {/* Compact Export Info Block */}
        <View style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 4, marginTop: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827', marginBottom: 6 }}>Export Settings</Text>
          <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
            Filtered Channels: {Object.keys(channels).join(', ')}
          </Text>
          <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
            Offer Types: {Object.keys(offerTypes).join(', ')}
          </Text>
          <Text style={{ fontSize: 11, color: '#4b5563', marginBottom: 4 }}>
            Period: {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
          </Text>
        </View>
      </Page>
      
      {/* PAGE 3: Detailed Offers List */}
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Detailed Offers List</Text>
          <Text style={styles.subtitle}>
            {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d")}
          </Text>
        </View>

        {/* Legend */}
        <View style={{ 
          backgroundColor: '#f3f4f6', 
          padding: 10, 
          borderRadius: 4, 
          marginBottom: 12 
        }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827', marginBottom: 6 }}>
            Legend
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#22c55e', marginRight: 4 }}>[+]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>Converted</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#6b7280', marginRight: 4 }}>[-]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>Pending</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#ef4444', marginRight: 4 }}>[E]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>Expired</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#f59e0b', marginRight: 4 }}>[!]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>5 or less days to convert</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#22c55e', marginRight: 4 }}>[*]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>Positive CSAT</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#6b7280', marginRight: 4 }}>[=]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>Neutral CSAT</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#ef4444', marginRight: 4 }}>[×]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>Negative CSAT</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: '30%' }}>
              <Text style={{ fontSize: 11, color: '#3b82f6', marginRight: 4 }}>[F]</Text>
              <Text style={{ fontSize: 10, color: '#4b5563' }}>Follow-up</Text>
            </View>
          </View>
          <Text style={{ fontSize: 10, fontStyle: 'normal', color: '#6b7280', marginTop: 5 }}>
            Note: Offers expire after 30 days if not converted. Rows are color-coded by status.
          </Text>
        </View>

        {/* Column Headers */}
        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: '#f3f4f6',
          padding: 6,
          marginBottom: 4,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb'
        }}>
          <Text style={{ width: 80, fontSize: 11, fontWeight: 'bold', color: '#111827' }}>Time</Text>
          <Text style={{ width: 75, fontSize: 11, fontWeight: 'bold', color: '#111827' }}>Status</Text>
          <Text style={{ width: 80, fontSize: 11, fontWeight: 'bold', color: '#111827' }}>Case #</Text>
          <Text style={{ width: 70, fontSize: 11, fontWeight: 'bold', color: '#111827' }}>Channel</Text>
          <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', color: '#111827' }}>Type</Text>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold', color: '#111827' }}>Notes</Text>
        </View>

        {/* Offers List */}
        {(() => {
          // Sort all offers by date (latest to oldest)
          const sortedOffers = [...offers].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          // Group offers by date
          const offersByDate = sortedOffers.reduce((acc, offer) => {
            const date = format(parseISO(offer.date), 'yyyy-MM-dd');
            if (!acc[date]) acc[date] = [];
            acc[date].push(offer);
            return acc;
          }, {} as Record<string, Offer[]>);

          // Sort dates from newest to oldest
          const sortedDates = Object.keys(offersByDate).sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
          );

          const today = new Date();

          return sortedDates.map((date) => (
            <View key={date}>
              {/* Date Header */}
              <View style={{ 
                backgroundColor: '#f1f5f9',
                padding: 5,
                marginTop: 4,
                marginBottom: 4,
                borderRadius: 2,
                borderLeftWidth: 3,
                borderLeftColor: '#64748b'
              }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#334155' }}>
                  {format(parseISO(date), 'MMM d, yyyy')}
                </Text>
              </View>

              {/* Offers for this date */}
              {offersByDate[date].map((offer, index) => {
                // Calculate days since offer to determine status
                const offerDate = parseISO(offer.date);
                const daysSinceOffer = differenceInDays(today, offerDate);
                const daysUntilExpiration = 30 - daysSinceOffer;
                
                // Define row background color based on status
                let backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                
                if (offer.converted) {
                  backgroundColor = '#e8f5e9'; // Slightly darker green for better contrast
                } else if (daysSinceOffer > 30) {
                  backgroundColor = '#fee2e2'; // Slightly darker red for better contrast
                } else if (daysUntilExpiration <= 5) {
                  backgroundColor = '#fef3c7'; // Slightly darker yellow for better contrast
                }
                
                // Determine status indicator
                const isExpired = daysSinceOffer > 30;
                const isNearingExpiration = !offer.converted && daysUntilExpiration <= 5 && daysUntilExpiration > 0;
                
                return (
                  <View key={index} style={{ 
                    flexDirection: 'row',
                    padding: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e5e7eb',
                    backgroundColor
                  }}>
                    <Text style={{ width: 80, fontSize: 11, color: '#4b5563' }}>
                      {format(parseISO(offer.date), 'h:mm a')}
                    </Text>
                    <View style={{ width: 75, flexDirection: 'row', gap: 4 }}>
                      {offer.converted ? (
                        <Text style={{ fontSize: 11, color: '#22c55e' }}>[+]</Text>
                      ) : isExpired ? (
                        <Text style={{ fontSize: 11, color: '#ef4444' }}>[E]</Text>
                      ) : isNearingExpiration ? (
                        <Text style={{ fontSize: 11, color: '#f59e0b' }}>[!]</Text>
                      ) : (
                        <Text style={{ fontSize: 11, color: '#6b7280' }}>[-]</Text>
                      )}
                      <Text style={{ 
                        fontSize: 11, 
                        color: offer.csat === 'positive' || offer.csat === 1 ? '#22c55e' :
                               offer.csat === 'negative' || offer.csat === -1 ? '#ef4444' :
                               '#6b7280'
                      }}>
                        {offer.csat === 'positive' || offer.csat === 1 ? '[*]' :
                         offer.csat === 'negative' || offer.csat === -1 ? '[×]' :
                         '[=]'}
                      </Text>
                      {offer.followupDate && (
                        <Text style={{ fontSize: 11, color: '#3b82f6' }}>[F]</Text>
                      )}
                    </View>
                    <Text style={{ width: 80, fontSize: 11, color: '#111827' }}>
                      {offer.caseNumber || '-'}
                    </Text>
                    <Text style={{ width: 70, fontSize: 11, color: '#4b5563' }}>
                      {offer.channel}
                    </Text>
                    <Text style={{ width: 100, fontSize: 11, color: '#4b5563' }}>
                      {offer.offerType}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 11, color: '#4b5563' }}>
                      {offer.notes ? (offer.notes.length > 50 ? offer.notes.substring(0, 50) + '...' : offer.notes) : '-'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ));
        })()}
      </Page>
    </Document>
  );
}