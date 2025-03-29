import type { Offer } from "@/context/OfferContext";

export interface TimePattern {
  weekdayDistribution: number[];
  weekendPerformance: {
    weekday: { offers: number; conversions: number };
    weekend: { offers: number; conversions: number };
  };
  monthlyGrowth: Array<{ date: string; offers: number; conversions: number }>;
  offerIntervals: number[];
  responseTimeDistribution: Array<{ hour: number; avgResponseTime: number; conversionRate: number }>;
}

export interface ChannelEffectiveness {
  conversionVelocity: Array<{ 
    channel: string; 
    avgTimeToConvert: number;
    conversionRate: number;
  }>;
  csatCorrelation: Array<{
    channel: string;
    avgCsat: number;
    conversionRate: number;
  }>;
  multiChannelCombos: Array<{
    channels: string[];
    conversionRate: number;
    offerCount: number;
  }>;
  timePerformance: Array<{
    channel: string;
    hourlyPerformance: number[];
  }>;
  saturationAnalysis: Array<{
    channel: string;
    offerCount: number;
    diminishingReturns: boolean;
  }>;
}

export interface OfferTypeIntelligence {
  channelSuccess: Array<{
    offerType: string;
    channelPerformance: Array<{
      channel: string;
      conversionRate: number;
      offerCount: number;
    }>;
  }>;
  sequences: Array<{
    sequence: string[];
    conversionRate: number;
    count: number;
  }>;
  timePerformance: Array<{
    offerType: string;
    hourlyPerformance: number[];
    bestHours: number[];
  }>;
  conversionSpeed: Array<{
    offerType: string;
    avgTimeToConvert: number;
    conversionRate: number;
  }>;
  followupEffectiveness: Array<{
    offerType: string;
    withFollowup: { conversionRate: number; count: number };
    withoutFollowup: { conversionRate: number; count: number };
  }>;
}

export interface ConversionAnalysis {
  chains: Array<{
    pattern: string[];
    conversionRate: number;
    count: number;
  }>;
  firstTimeVsRepeat: {
    firstTime: { attempts: number; conversions: number };
    repeat: { attempts: number; conversions: number };
  };
  velocityTrends: Array<{
    date: string;
    avgTimeToConvert: number;
    conversionRate: number;
  }>;
  correlatedFactors: Array<{
    factor: string;
    correlation: number;
    significance: number;
  }>;
  goldenPaths: Array<{
    path: string[];
    conversionRate: number;
    avgTimeToConvert: number;
    count: number;
  }>;
}

export interface CsatInsights {
  trends: Array<{
    date: string;
    avgCsat: number;
    offerCount: number;
  }>;
  byOfferType: Array<{
    offerType: string;
    avgCsat: number;
    conversionCorrelation: number;
  }>;
  byChannel: Array<{
    channel: string;
    avgCsat: number;
    conversionCorrelation: number;
  }>;
  followupImpact: {
    withFollowup: { avgCsat: number; count: number };
    withoutFollowup: { avgCsat: number; count: number };
  };
  patterns: Array<{
    pattern: string;
    avgCsat: number;
    frequency: number;
  }>;
}

export interface FollowupAnalysis {
  timingEffectiveness: Array<{
    interval: number;
    conversionRate: number;
    count: number;
  }>;
  conversionRates: {
    initial: { attempts: number; conversions: number };
    followup: { attempts: number; conversions: number };
  };
  multiFollowup: Array<{
    followupCount: number;
    conversionRate: number;
    avgTimeToConvert: number;
  }>;
  channelEffectiveness: Array<{
    channel: string;
    followupConversionRate: number;
    count: number;
  }>;
  csatImpact: {
    withFollowup: { avgCsat: number; count: number };
    withoutFollowup: { avgCsat: number; count: number };
  };
}

export interface PerformanceIndicators {
  leadingIndicators: Array<{
    indicator: string;
    correlation: number;
    reliability: number;
  }>;
  conversionVelocity: Array<{
    date: string;
    velocity: number;
    trend: number;
  }>;
  channelTrends: Array<{
    channel: string;
    trend: number;
    prediction: number;
  }>;
  offerTypeTrends: Array<{
    offerType: string;
    trend: number;
    prediction: number;
  }>;
  successPatterns: Array<{
    pattern: string;
    frequency: number;
    reliability: number;
  }>;
}

export interface ComparativeAnalysis {
  periodComparisons: Array<{
    period: string;
    current: {
      offers: number;
      conversions: number;
    };
    previous: {
      offers: number;
      conversions: number;
    };
  }>;
  channelBenchmarks: Array<{
    channel: string;
    performance: number;
    benchmark: number;
  }>;
  offerTypeRanking: Array<{
    offerType: string;
    score: number;
    rank: number;
  }>;
  timeBasedSuccess: Array<{
    timeSlot: string;
    successRate: number;
    volume: number;
  }>;
}

export interface OptimizationOpportunities {
  bestCombinations: Array<{
    time: string;
    channel: string;
    offerType: string;
    score: number;
    volume: number;
  }>;
  underutilizedPatterns: Array<{
    pattern: string;
    currentUsage: number;
    potential: number;
    impact: number;
  }>;
  channelCapacity: Array<{
    channel: string;
    currentLoad: number;
    optimalLoad: number;
    headroom: number;
  }>;
  offerFrequency: Array<{
    interval: string;
    currentFrequency: number;
    optimalFrequency: number;
    delta: number;
  }>;
  resourceSuggestions: Array<{
    resource: string;
    impact: number;
    cost: number;
    timeToImplement: string;
  }>;
}

export interface RiskAnalysis {
  riskExposure: Array<{
    category: string;
    riskLevel: number;
    targetLevel: number;
    gap: number;
  }>;
  riskTrends: Array<{
    date: string;
    highRiskOffers: number;
    mediumRiskOffers: number;
    lowRiskOffers: number;
    totalOffers: number;
  }>;
  riskFactors: Array<{
    factor: string;
    impact: number;
    severity: 'high' | 'medium' | 'low';
    frequency: number;
  }>;
  mitigationEffectiveness: Array<{
    strategy: string;
    effectiveness: number;
    costEfficiency: number;
    timeToImplement: string;
  }>;
  complianceStatus: Array<{
    category: string;
    complianceScore: number;
    riskLevel: number;
    volume: number;
    riskCategory: 'high' | 'medium' | 'low';
  }>;
  declineIndicators: Array<{
    metric: string;
    trend: number;
    severity: number;
  }>;
  channelFatigue: Array<{
    channel: string;
    fatigueScore: number;
    recommendation: string;
  }>;
  typeSaturation: Array<{
    offerType: string;
    saturationLevel: number;
    risk: number;
  }>;
  csatRisks: Array<{
    factor: string;
    impact: number;
    mitigation: string;
  }>;
  conversionWarnings: Array<{
    warning: string;
    probability: number;
    impact: number;
  }>;
}

export function analyzeTimePatterns(offers: Offer[]): TimePattern {
  const weekdayData = new Array(7).fill(0);
  const weekendPerf = {
    weekday: { offers: 0, conversions: 0 },
    weekend: { offers: 0, conversions: 0 }
  };
  const monthlyData = new Map<string, { offers: number; conversions: number }>();
  const intervals: number[] = [];
  const responseTimesByHour = new Array(24).fill({ count: 0, totalTime: 0, conversions: 0 });

  // Sort offers by date
  const sortedOffers = [...offers].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedOffers.forEach((offer, index) => {
    const date = new Date(offer.date);
    const day = date.getDay();
    const hour = date.getHours();
    const monthKey = date.toISOString().slice(0, 7);

    // Weekday distribution
    weekdayData[day]++;

    // Weekend vs weekday performance
    const isWeekend = day === 0 || day === 6;
    if (isWeekend) {
      weekendPerf.weekend.offers++;
      if (offer.converted) weekendPerf.weekend.conversions++;
    } else {
      weekendPerf.weekday.offers++;
      if (offer.converted) weekendPerf.weekday.conversions++;
    }

    // Monthly growth
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { offers: 0, conversions: 0 });
    }
    const monthStats = monthlyData.get(monthKey)!;
    monthStats.offers++;
    if (offer.converted) monthStats.conversions++;

    // Offer intervals
    if (index > 0) {
      const prevDate = new Date(sortedOffers[index - 1].date);
      const interval = (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60); // hours
      intervals.push(interval);
    }

    // Response time distribution
    if (offer.converted && offer.conversionDate) {
      const responseTime = (new Date(offer.conversionDate).getTime() - date.getTime()) / (1000 * 60 * 60);
      const hourStats = responseTimesByHour[hour];
      responseTimesByHour[hour] = {
        count: hourStats.count + 1,
        totalTime: hourStats.totalTime + responseTime,
        conversions: hourStats.conversions + 1
      };
    }
  });

  // Calculate response time distribution
  const responseTimeDistribution = responseTimesByHour.map((stats, hour) => ({
    hour,
    avgResponseTime: stats.count > 0 ? stats.totalTime / stats.count : 0,
    conversionRate: stats.count > 0 ? (stats.conversions / stats.count) * 100 : 0
  }));

  return {
    weekdayDistribution: weekdayData,
    weekendPerformance: weekendPerf,
    monthlyGrowth: Array.from(monthlyData.entries()).map(([date, stats]) => ({
      date,
      offers: stats.offers,
      conversions: stats.conversions
    })),
    offerIntervals: intervals,
    responseTimeDistribution
  };
}

export function analyzeChannelEffectiveness(offers: Offer[]): ChannelEffectiveness {
  const channelStats = new Map<string, {
    offers: number;
    conversions: number;
    totalResponseTime: number;
    csatTotal: number;
    csatCount: number;
    hourlyOffers: number[];
    convertedOffers: number;
  }>();

  // Initialize channel stats
  offers.forEach(offer => {
    if (!channelStats.has(offer.channel)) {
      channelStats.set(offer.channel, {
        offers: 0,
        conversions: 0,
        totalResponseTime: 0,
        csatTotal: 0,
        csatCount: 0,
        hourlyOffers: new Array(24).fill(0),
        convertedOffers: 0
      });
    }

    const stats = channelStats.get(offer.channel)!;
    const hour = new Date(offer.date).getHours();

    stats.offers++;
    stats.hourlyOffers[hour]++;

    if (offer.converted) {
      stats.conversions++;
      if (offer.conversionDate) {
        const responseTime = (new Date(offer.conversionDate).getTime() - new Date(offer.date).getTime()) / (1000 * 60 * 60);
        stats.totalResponseTime += responseTime;
        stats.convertedOffers++;
      }
    }

    if (typeof offer.csat === 'number') {
      stats.csatTotal += offer.csat;
      stats.csatCount++;
    }
  });

  // Calculate multi-channel combinations
  const customerChannels = new Map<string, Set<string>>();
  offers.forEach(offer => {
    const customerId = offer.id; // Use appropriate customer identifier
    if (!customerChannels.has(customerId)) {
      customerChannels.set(customerId, new Set());
    }
    customerChannels.get(customerId)!.add(offer.channel);
  });

  // Analyze channel combinations
  const combos = new Map<string, { offers: number; conversions: number }>();
  customerChannels.forEach(channels => {
    if (channels.size > 1) {
      const key = Array.from(channels).sort().join(',');
      if (!combos.has(key)) {
        combos.set(key, { offers: 0, conversions: 0 });
      }
      const stats = combos.get(key)!;
      stats.offers++;
      // Count conversions for this combination
      const customerOffers = offers.filter(o => o.id === offers[0].id && channels.has(o.channel));
      if (customerOffers.some(o => o.converted)) {
        stats.conversions++;
      }
    }
  });

  return {
    conversionVelocity: Array.from(channelStats.entries()).map(([channel, stats]) => ({
      channel,
      avgTimeToConvert: stats.convertedOffers > 0 ? stats.totalResponseTime / stats.convertedOffers : 0,
      conversionRate: (stats.conversions / stats.offers) * 100
    })),
    csatCorrelation: Array.from(channelStats.entries()).map(([channel, stats]) => ({
      channel,
      avgCsat: stats.csatCount > 0 ? stats.csatTotal / stats.csatCount : 0,
      conversionRate: (stats.conversions / stats.offers) * 100
    })),
    multiChannelCombos: Array.from(combos.entries()).map(([channels, stats]) => ({
      channels: channels.split(','),
      conversionRate: (stats.conversions / stats.offers) * 100,
      offerCount: stats.offers
    })),
    timePerformance: Array.from(channelStats.entries()).map(([channel, stats]) => ({
      channel,
      hourlyPerformance: stats.hourlyOffers
    })),
    saturationAnalysis: Array.from(channelStats.entries()).map(([channel, stats]) => {
      const recentOffers = offers
        .filter(o => o.channel === channel)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, Math.floor(stats.offers * 0.2)); // Look at most recent 20%

      const recentConversionRate = recentOffers.filter(o => o.converted).length / recentOffers.length;
      const overallConversionRate = stats.conversions / stats.offers;

      return {
        channel,
        offerCount: stats.offers,
        diminishingReturns: recentConversionRate < overallConversionRate * 0.8 // 20% drop in conversion rate
      };
    })
  };
}

// ... Additional analysis functions for other categories ...

export interface InsightAnalysis {
  timePatterns: TimePattern;
  channelEffectiveness: ChannelEffectiveness;
  offerTypeIntelligence: OfferTypeIntelligence;
  conversionAnalysis: ConversionAnalysis;
  csatInsights: CsatInsights;
  followupAnalysis: FollowupAnalysis;
  performanceIndicators: PerformanceIndicators;
  comparativeAnalysis: ComparativeAnalysis;
  optimizationOpportunities: OptimizationOpportunities;
  riskAnalysis: RiskAnalysis;
}

export function analyzeOffers(offers: Offer[]): InsightAnalysis {
  // Mock data for development
  const mockOfferTypeIntelligence: OfferTypeIntelligence = {
    channelSuccess: [
      {
        offerType: 'Type A',
        channelPerformance: [
          { channel: 'Email', conversionRate: 65, offerCount: 100 },
          { channel: 'SMS', conversionRate: 45, offerCount: 80 },
          { channel: 'Phone', conversionRate: 75, offerCount: 120 }
        ]
      }
    ],
    sequences: [
      { sequence: ['Email', 'Phone'], conversionRate: 70, count: 50 },
      { sequence: ['SMS', 'Email'], conversionRate: 60, count: 40 }
    ],
    timePerformance: [
      { offerType: 'Type A', hourlyPerformance: [60, 65, 70], bestHours: [9, 14, 16] }
    ],
    conversionSpeed: [
      { offerType: 'Type A', avgTimeToConvert: 24, conversionRate: 65 }
    ],
    followupEffectiveness: [
      {
        offerType: 'Type A',
        withFollowup: { conversionRate: 75, count: 100 },
        withoutFollowup: { conversionRate: 55, count: 80 }
      }
    ]
  };

  const mockConversionAnalysis: ConversionAnalysis = {
    chains: [
      { pattern: ['Email', 'Phone'], conversionRate: 70, count: 100 }
    ],
    firstTimeVsRepeat: {
      firstTime: { attempts: 100, conversions: 60 },
      repeat: { attempts: 80, conversions: 56 }
    },
    velocityTrends: [
      { date: '2024-01', avgTimeToConvert: 24, conversionRate: 65 }
    ],
    correlatedFactors: [
      { factor: 'Time of Day', correlation: 0.8, significance: 0.95 }
    ],
    goldenPaths: [
      { path: ['Email', 'Phone'], conversionRate: 75, avgTimeToConvert: 20, count: 50 }
    ]
  };

  const mockCsatInsights: CsatInsights = {
    trends: [
      { date: '2024-01', avgCsat: 4.5, offerCount: 100 }
    ],
    byOfferType: [
      { offerType: 'Type A', avgCsat: 4.2, conversionCorrelation: 0.7 }
    ],
    byChannel: [
      { channel: 'Email', avgCsat: 4.3, conversionCorrelation: 0.75 }
    ],
    followupImpact: {
      withFollowup: { avgCsat: 4.5, count: 100 },
      withoutFollowup: { avgCsat: 4.0, count: 80 }
    },
    patterns: [
      { pattern: 'Quick Response', avgCsat: 4.6, frequency: 80 }
    ]
  };

  const mockFollowupAnalysis: FollowupAnalysis = {
    timingEffectiveness: [
      { interval: 24, conversionRate: 65, count: 100 }
    ],
    conversionRates: {
      initial: { attempts: 100, conversions: 60 },
      followup: { attempts: 80, conversions: 56 }
    },
    multiFollowup: [
      { followupCount: 2, conversionRate: 70, avgTimeToConvert: 36 }
    ],
    channelEffectiveness: [
      { channel: 'Email', followupConversionRate: 65, count: 100 }
    ],
    csatImpact: {
      withFollowup: { avgCsat: 4.5, count: 100 },
      withoutFollowup: { avgCsat: 4.0, count: 80 }
    }
  };

  const mockPerformanceIndicators: PerformanceIndicators = {
    leadingIndicators: [
      { indicator: 'Response Time', correlation: 0.8, reliability: 0.9 }
    ],
    conversionVelocity: [
      { date: '2024-01', velocity: 75, trend: 0.8 }
    ],
    channelTrends: [
      { channel: 'Email', trend: 0.7, prediction: 0.8 }
    ],
    offerTypeTrends: [
      { offerType: 'Type A', trend: 0.75, prediction: 0.8 }
    ],
    successPatterns: [
      { pattern: 'Quick Follow-up', frequency: 80, reliability: 0.85 }
    ]
  };

  const mockComparativeAnalysis: ComparativeAnalysis = {
    periodComparisons: [
      {
        period: '2024-01',
        current: { offers: 100, conversions: 65 },
        previous: { offers: 90, conversions: 54 }
      }
    ],
    channelBenchmarks: [
      { channel: 'Email', performance: 75, benchmark: 70 }
    ],
    offerTypeRanking: [
      { offerType: 'Type A', score: 85, rank: 1 }
    ],
    timeBasedSuccess: [
      { timeSlot: 'Morning', successRate: 70, volume: 100 }
    ]
  };

  const mockOptimizationOpportunities: OptimizationOpportunities = {
    bestCombinations: [
      { time: 'Morning', channel: 'Email', offerType: 'Type A', score: 85, volume: 100 }
    ],
    underutilizedPatterns: [
      { pattern: 'Weekend Offers', currentUsage: 30, potential: 70, impact: 40 }
    ],
    channelCapacity: [
      { channel: 'Email', currentLoad: 60, optimalLoad: 80, headroom: 20 }
    ],
    offerFrequency: [
      { interval: 'Daily', currentFrequency: 10, optimalFrequency: 15, delta: 5 }
    ],
    resourceSuggestions: [
      { resource: 'Email Templates', impact: 75, cost: 5000, timeToImplement: '2 weeks' }
    ]
  };

  const mockRiskAnalysis: RiskAnalysis = {
    riskExposure: [
      { category: 'Channel', riskLevel: 30, targetLevel: 20, gap: 10 }
    ],
    riskTrends: [
      {
        date: '2024-01',
        highRiskOffers: 10,
        mediumRiskOffers: 30,
        lowRiskOffers: 60,
        totalOffers: 100
      }
    ],
    riskFactors: [
      { factor: 'Response Time', impact: 70, severity: 'medium', frequency: 30 }
    ],
    mitigationEffectiveness: [
      { strategy: 'Quick Response', effectiveness: 80, costEfficiency: 75, timeToImplement: '1 week' }
    ],
    complianceStatus: [
      { category: 'Data Privacy', complianceScore: 85, riskLevel: 20, volume: 100, riskCategory: 'low' }
    ],
    declineIndicators: [
      { metric: 'Response Rate', trend: -0.1, severity: 0.3 }
    ],
    channelFatigue: [
      { channel: 'Email', fatigueScore: 0.3, recommendation: 'Reduce frequency' }
    ],
    typeSaturation: [
      { offerType: 'Type A', saturationLevel: 0.7, risk: 0.4 }
    ],
    csatRisks: [
      { factor: 'Response Time', impact: 0.6, mitigation: 'Improve response time' }
    ],
    conversionWarnings: [
      { warning: 'High decline rate', probability: 0.3, impact: 0.7 }
    ]
  };

  return {
    timePatterns: analyzeTimePatterns(offers),
    channelEffectiveness: analyzeChannelEffectiveness(offers),
    offerTypeIntelligence: mockOfferTypeIntelligence,
    conversionAnalysis: mockConversionAnalysis,
    csatInsights: mockCsatInsights,
    followupAnalysis: mockFollowupAnalysis,
    performanceIndicators: mockPerformanceIndicators,
    comparativeAnalysis: mockComparativeAnalysis,
    optimizationOpportunities: mockOptimizationOpportunities,
    riskAnalysis: mockRiskAnalysis
  };
} 