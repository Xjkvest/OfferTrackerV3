import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from "recharts";

interface HorizontalBarChartProps {
  data: any[];
  barKey?: string;
  indexBy?: string;
  height?: number | string;
  color?: string;
  theme: "light" | "dark";
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  showDataLabels?: boolean;
  barSize?: number;
  maxBarWidth?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  barKey = "value",
  indexBy = "name",
  height = 300,
  color = "#3b82f6",
  theme = "light",
  showLegend = false,
  showTooltip = true,
  showGrid = true,
  xAxisLabel,
  showDataLabels = false,
  barSize = 20,
  maxBarWidth = 20
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

  // Format long labels for better display
  const formatLabel = (label: string) => {
    if (typeof label !== 'string') return label;
    return label.length > 15 ? `${label.substring(0, 12)}...` : label;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={chartTheme.tooltip.container}>
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                background: color,
                width: 12,
                height: 12,
                marginRight: 5,
                borderRadius: 2
              }}
            />
            <span>{`${payload[0].name}: ${payload[0].value}`}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 55, bottom: 40 }}
        barSize={barSize}
        maxBarSize={maxBarWidth}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.grid.line.stroke} 
            horizontal={true}
            vertical={false}
          />
        )}
        
        <XAxis 
          type="number"
          tick={{ fill: chartTheme.textColor }}
          axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
          tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, fill: chartTheme.textColor } : undefined}
        />
        
        <YAxis 
          type="category"
          dataKey={indexBy}
          tick={{ fill: chartTheme.textColor }}
          axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
          tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
          tickFormatter={formatLabel}
          width={80}
        />
        
        {showTooltip && (
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          />
        )}
        
        {showLegend && (
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ fontSize: chartTheme.fontSize, color: chartTheme.textColor }}
          />
        )}
        
        <Bar 
          dataKey={barKey} 
          fill={color}
          radius={[0, 4, 4, 0]}
          animationDuration={1000}
        >
          {showDataLabels && (
            <LabelList 
              dataKey={barKey} 
              position="right" 
              fill={chartTheme.textColor} 
              style={{ fontSize: 11 }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default HorizontalBarChart; 