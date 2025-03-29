import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

interface TrendsBarChartProps {
  data: Array<{
    name: string;
    value: number;
    total?: number;
    rate?: number;
  }>;
  config: {
    height: number;
    colors: string[];
    showRate?: boolean;
    maxItems?: number;
  };
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const isDark = theme === 'dark';
    const data = payload[0].payload;
    
    return (
      <div className={`p-3 rounded-lg shadow-lg ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
      } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className="font-medium mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: payload[0].color }}
            />
            <span className="font-medium">Count:</span>
            <span>{data.value}</span>
          </div>
          {data.total !== undefined && (
            <div className="text-sm text-muted-foreground">
              Total: {data.total}
            </div>
          )}
          {data.rate !== undefined && (
            <div className="text-sm text-muted-foreground">
              Rate: {data.rate.toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function TrendsBarChart({ data, config }: TrendsBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Limit the number of items if specified
  const displayData = config.maxItems 
    ? data.slice(0, config.maxItems)
    : data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={config.height}>
        <BarChart
          data={displayData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          layout="vertical"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? '#374151' : '#E5E7EB'}
            horizontal={false}
          />
          
          <XAxis
            type="number"
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
          />
          
          <YAxis
            type="category"
            dataKey="name"
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
            width={120}
            tickMargin={8}
          />
          
          <Tooltip
            content={<CustomTooltip theme={theme} />}
            cursor={{
              fill: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
            }}
          />
          
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
          >
            {displayData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={config.colors[index % config.colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
} 