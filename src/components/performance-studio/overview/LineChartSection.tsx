import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { AnalyticsLineChart } from "@/components/charts/AnalyticsLineChart";
import { ModernAnalyticsCard } from "@/components/charts/ModernAnalyticsCard";
import { LineChart } from "lucide-react";

interface LineChartSectionProps {
  lineChartData: {
    id: string;
    data: Array<{
      x: string;
      y: number;
      isToday?: boolean;
      isWeekend?: boolean;
      isHoliday?: boolean;
    }>;
  }[];
  chartTheme: any;
}

export function LineChartSection({ lineChartData, chartTheme }: LineChartSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Transform data for the chart
  const chartData = lineChartData[0].data.map(item => ({
    date: item.x,
    offers: {
      total: item.y,
      successful: 0, // These will be added later
      pending: 0,
      failed: 0
    },
    goals: {
      daily: lineChartData[1]?.data.find(d => d.x === item.x)?.y || 0,
      weekly: 0 // This will be calculated later
    },
    metrics: {
      successRate: 0, // This will be calculated later
      averageValue: 0 // This will be calculated later
    },
    context: {
      isToday: item.isToday || false,
      isWeekend: item.isWeekend || false,
      isHoliday: item.isHoliday || false
    }
  }));

  // Calculate metrics for insights
  const totalOffers = chartData.reduce((sum, item) => sum + item.offers.total, 0);
  const dailyAverage = totalOffers / chartData.length;
  const maxOffers = Math.max(...chartData.map(item => item.offers.total));
  const goalAchievementRate = (chartData.filter(item => item.offers.total >= item.goals.daily).length / chartData.length) * 100;

  // Chart configuration
  const chartConfig = {
    showSuccessRate: false,
    showAverageValue: false,
    showWeeklyGoal: false,
    showTrendLine: true,
    height: 350,
    colors: {
      primary: isDark ? '#3b82f6' : '#2563eb',
      success: isDark ? '#10b981' : '#059669',
      value: isDark ? '#06b6d4' : '#0891b2',
      goal: isDark ? '#f59e0b' : '#d97706',
      trend: isDark ? '#8b5cf6' : '#7c3aed',
      weekend: isDark ? '#374151' : '#e5e7eb',
      holiday: isDark ? '#ef4444' : '#dc2626'
    }
  };

  return (
    <ModernAnalyticsCard
      title="Offers Over Time"
      value={totalOffers.toString()}
      trend={{
        value: ((maxOffers - dailyAverage) / dailyAverage) * 100,
        isPositive: maxOffers > dailyAverage
      }}
      icon={<LineChart className="h-5 w-5" />}
      gradient="from-blue-500/10 to-blue-500/5"
      badge={{
        text: `Top: ${maxOffers}`,
        variant: "secondary"
      }}
      insights={[
        {
          title: "Daily Average",
          value: Math.round(dailyAverage).toString(),
          description: "Average number of offers per day"
        },
        {
          title: "Goal Achievement",
          value: `${Math.round(goalAchievementRate)}%`,
          description: "Days meeting or exceeding daily goal"
        },
        {
          title: "Peak Performance",
          value: maxOffers.toString(),
          description: "Highest number of offers in a single day"
        }
      ]}
      className="min-h-[50px]"
    >
      <AnalyticsLineChart
        data={chartData}
        config={chartConfig}
      />
    </ModernAnalyticsCard>
  );
}
