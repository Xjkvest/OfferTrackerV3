import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OfferChartData {
  date: string;
  offers: {
    total: number;
    successful: number;
    pending: number;
    failed: number;
  };
  goals: {
    daily: number;
    weekly: number;
  };
  metrics: {
    successRate: number;
    averageValue: number;
  };
  context: {
    isToday: boolean;
    isWeekend: boolean;
    isHoliday: boolean;
  };
}

interface ChartConfig {
  showSuccessRate: boolean;
  showAverageValue: boolean;
  showWeeklyGoal: boolean;
  showTrendLine: boolean;
  height: number;
  colors: {
    primary: string;
    success: string;
    value: string;
    goal: string;
    trend: string;
    weekend: string;
    holiday: string;
  };
}

interface AnalyticsLineChartProps {
  data: OfferChartData[];
  config: ChartConfig;
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={cn(
        "rounded-lg border p-3 shadow-lg",
        theme === 'dark'
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      )}>
        <p className={cn(
          "text-sm font-medium mb-2",
          theme === 'dark' ? "text-gray-300" : "text-gray-600"
        )}>
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry?.color || '#888' }}
              />
              <span className={cn(
                "text-sm",
                theme === 'dark' ? "text-white" : "text-gray-900"
              )}>
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function AnalyticsLineChart({ data, config }: AnalyticsLineChartProps) {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  // Calculate the maximum value for Y-axis scaling
  const maxValue = useMemo(() => {
    return Math.max(
      ...data.map(item => Math.max(
        item.offers.total,
        item.goals.daily,
        item.goals.weekly,
        item.metrics.averageValue
      ))
    );
  }, [data]);

  // Calculate 7-day moving average
  const trendData = useMemo(() => {
    return data.map((item, index) => {
      if (index < 0) return null;
      const weekData = data.slice(index - 6, index + 1);
      const average = weekData.reduce((sum, day) => sum + day.offers.total, 0) / 7;
      return {
        date: item.date,
        trend: Math.round(average)
      };
    }).filter(Boolean);
  }, [data]);

  // Transform data for the chart
  const transformedData = useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      total: item.offers.total,
      successRate: item.metrics.successRate,
      averageValue: item.metrics.averageValue,
      dailyGoal: item.goals.daily,
      weeklyGoal: item.goals.weekly,
      isToday: item.context.isToday,
      isWeekend: item.context.isWeekend,
      isHoliday: item.context.isHoliday
    }));
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={config.height}>
        <LineChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          {/* Weekend and Holiday Shading */}
          {transformedData.map((item, index) => {
            if (item.isWeekend || item.isHoliday) {
              const nextItem = transformedData[index + 1];
              if (!nextItem) return null;
              
              return (
                <ReferenceArea
                  key={`shade-${index}`}
                  x1={item.date}
                  x2={nextItem.date}
                  fill={item.isHoliday ? config.colors.holiday : config.colors.weekend}
                  fillOpacity={0.1}
                  stroke="none"
                />
              );
            }
            return null;
          })}

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#374151' : '#E5E7EB'}
            vertical={false}
          />
          
          <XAxis
            dataKey="date"
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
            height={40}
            interval={0}
            tickMargin={8}
          />
          
          <YAxis
            domain={[0, Math.ceil(maxValue * 1.2)]}
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ 
              fill: isDark ? '#9CA3AF' : '#6B7280',
              fontSize: 11
            }}
            width={30}
            tickMargin={4}
            tickFormatter={(value) => Math.round(value).toString()}
          />
          
          <Tooltip
            content={<CustomTooltip theme={currentTheme} />}
            cursor={{
              stroke: isDark ? '#374151' : '#E5E7EB',
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
          />
          
          <Legend
            wrapperStyle={{ 
              paddingTop: 10,
              paddingRight: 10,
              fontSize: '12px'
            }}
            iconType="circle"
            iconSize={8}
            verticalAlign="top"
            align="right"
          />

          {/* Main offers line */}
          <Line
            type="monotone"
            dataKey="total"
            name="Total Offers"
            stroke={config.colors.primary}
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload, index } = props;
              const isToday = payload.isToday;
              
              return (
                <circle 
                  key={`dot-${index}`}
                  cx={cx} 
                  cy={cy} 
                  r={isToday ? 5 : 3.5}
                  stroke={config.colors.primary}
                  strokeWidth={1.5}
                  fill={isDark ? '#1f2937' : '#fff'}
                  style={{ 
                    filter: isToday ? `drop-shadow(0 0 2px ${config.colors.primary})` : "none"
                  }}
                />
              );
            }}
          />

          {/* Success rate line */}
          {config.showSuccessRate && (
            <Line
              type="monotone"
              dataKey="successRate"
              name="Success Rate"
              stroke={config.colors.success}
              strokeWidth={2}
              dot={false}
            />
          )}

          {/* Average value line */}
          {config.showAverageValue && (
            <Line
              type="monotone"
              dataKey="averageValue"
              name="Average Value"
              stroke={config.colors.value}
              strokeWidth={2}
              dot={false}
            />
          )}

          {/* Daily goal reference line */}
          <ReferenceLine
            y="dailyGoal"
            name="Daily Goal"
            stroke={config.colors.goal}
            strokeDasharray="3 3"
            label={{
              value: "Daily Goal",
              position: "right",
              fill: isDark ? '#9CA3AF' : '#6B7280'
            }}
          />

          {/* Weekly goal reference line */}
          {config.showWeeklyGoal && (
            <ReferenceLine
              y="weeklyGoal"
              name="Weekly Goal"
              stroke={config.colors.goal}
              strokeDasharray="3 3"
              label={{
                value: "Weekly Goal",
                position: "right",
                fill: isDark ? '#9CA3AF' : '#6B7280'
              }}
            />
          )}

          {/* Trend line */}
          {config.showTrendLine && trendData.length > 0 && (
            <Line
              type="monotone"
              data={trendData}
              dataKey="trend"
              name="7-Day Average"
              stroke={config.colors.trend}
              strokeWidth={2}
              dot={false}
              strokeDasharray="3 3"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
} 