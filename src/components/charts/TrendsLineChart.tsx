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
import { motion } from 'framer-motion';

interface TrendsLineChartProps {
  data: {
    date: string;
    offers: number;
    conversions: number;
    trend?: number;
  }[];
  config: {
    height: number;
    colors: {
      offers: string;
      conversions: string;
      trend: string;
      weekend: string;
      holiday: string;
    };
    showTrend: boolean;
  };
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const isDark = theme === 'dark';
    return (
      <div className={`p-3 rounded-lg shadow-lg ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
      } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry?.color || '#888' }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendsLineChart({ data, config }: TrendsLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate max value for Y-axis
  const maxValue = useMemo(() => {
    return Math.max(
      ...data.map(item => Math.max(item.offers, item.conversions))
    );
  }, [data]);

  // Transform dates to be more readable
  const transformedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
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
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
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
            tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
            width={40}
            tickMargin={8}
          />
          
          <Tooltip
            content={<CustomTooltip theme={theme} />}
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

          {/* Offers line */}
          <Line
            type="monotone"
            dataKey="offers"
            name="Total Offers"
            stroke={config.colors.offers}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />

          {/* Conversions line */}
          <Line
            type="monotone"
            dataKey="conversions"
            name="Conversions"
            stroke={config.colors.conversions}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />

          {/* Trend line */}
          {config.showTrend && (
            <Line
              type="monotone"
              dataKey="trend"
              name="7-Day Trend"
              stroke={config.colors.trend}
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
} 