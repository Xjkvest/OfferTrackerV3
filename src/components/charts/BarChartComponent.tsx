import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface BarChartComponentProps {
  data: any[];
  keys?: string[];
  indexBy?: string;
  height?: number | string;
  colors?: string[];
  theme: "light" | "dark";
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  layout?: "vertical" | "horizontal";
  xAxisLabel?: string;
  yAxisLabel?: string;
  stackedBars?: boolean;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  keys = [],
  indexBy = "name",
  height = 300,
  colors = ["#3b82f6", "#10b981", "#06b6d4", "#ef4444", "#f97316", "#a855f7", "#ec4899"],
  theme = "light",
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  layout = "horizontal",
  xAxisLabel,
  yAxisLabel,
  stackedBars = false
}) => {
  // Create a theme based on light/dark mode
  const chartTheme = {
    background: "transparent",
    textColor: theme === "dark" ? "#e5e5e5" : "#1f2937",
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
          stroke: theme === "dark" ? "#6b7280" : "#9ca3af",
          strokeWidth: 1
        },
        text: {
          fill: theme === "dark" ? "#e5e5e5" : "#374151",
          fontSize: 12
        }
      }
    },
    grid: {
      line: {
        stroke: theme === "dark" ? "#374151" : "#e5e7eb",
        strokeDasharray: "4 4"
      }
    },
    tooltip: {
      container: {
        background: theme === "dark" ? "#1f2937" : "#fff",
        color: theme === "dark" ? "#f9fafb" : "#111827",
        fontSize: 12,
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "8px 10px"
      }
    }
  };

  // Transform nivo data format to Recharts format if needed
  const transformData = (data: any[]): any[] => {
    if (!data || data.length === 0) return [];

    // If the data is already in Recharts format
    if (data[0] && typeof data[0][indexBy] !== 'undefined') {
      return data;
    }

    // Convert from nivo format
    return data.map(item => {
      const transformedItem: any = { [indexBy]: item[indexBy] };
      
      // Extract keys if not provided
      const dataKeys = keys.length > 0 ? keys : Object.keys(item).filter(key => key !== indexBy);
      
      // Add each key as a property
      dataKeys.forEach(key => {
        transformedItem[key] = item[key];
      });
      
      return transformedItem;
    });
  };

  // Extract keys if not provided
  const getDataKeys = (): string[] => {
    if (keys.length > 0) return keys;
    
    if (!data || data.length === 0) return [];
    
    // Get all keys except the indexBy key
    return Object.keys(data[0]).filter(key => key !== indexBy);
  };

  const transformedData = transformData(data);
  const dataKeys = getDataKeys();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={transformedData}
        layout={layout}
        margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.grid.line.stroke} 
            vertical={false}
          />
        )}
        
        <XAxis 
          dataKey={layout === "horizontal" ? indexBy : undefined}
          type={layout === "horizontal" ? "category" : "number"}
          tick={{ fill: chartTheme.textColor }}
          axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
          tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
          label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', fill: chartTheme.textColor } : undefined}
        />
        
        <YAxis 
          dataKey={layout === "vertical" ? indexBy : undefined}
          type={layout === "vertical" ? "category" : "number"}
          tick={{ fill: chartTheme.textColor }}
          axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
          tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'left', fill: chartTheme.textColor } : undefined}
        />
        
        {showTooltip && (
          <Tooltip
            contentStyle={chartTheme.tooltip.container}
            labelStyle={{ fontWeight: 'bold' }}
          />
        )}
        
        {showLegend && (
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ fontSize: chartTheme.fontSize, color: chartTheme.textColor }}
          />
        )}
        
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            name={key}
            fill={colors[index % colors.length]}
            stackId={stackedBars ? "stack" : undefined}
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
