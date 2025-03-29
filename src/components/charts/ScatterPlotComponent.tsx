import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from "recharts";

interface ScatterPlotComponentProps {
  data: any[];
  height?: number | string;
  colors?: string[];
  theme: "light" | "dark";
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  nodeSize?: number;
}

export const ScatterPlotComponent: React.FC<ScatterPlotComponentProps> = ({
  data,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#06b6d4", "#ef4444"],
  theme = "light",
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  xAxisLabel,
  yAxisLabel,
  xAxisDataKey = "x",
  yAxisDataKey = "y",
  nodeSize = 60
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

    // If data is already in Recharts format just return it
    if (!data[0].data && data[0][xAxisDataKey] !== undefined) {
      return data;
    }

    // If data is in nivo format, transform it to Recharts format
    let transformedData: any[] = [];
    
    data.forEach((series) => {
      if (series.data) {
        const seriesData = series.data.map((point: any) => ({
          [xAxisDataKey]: point.x,
          [yAxisDataKey]: point.y,
          id: series.id,
          color: series.color
        }));
        transformedData = [...transformedData, ...seriesData];
      }
    });

    return transformedData;
  };

  const transformedData = transformData(data);

  // Group data by series for Recharts
  const groupedData = data.map((series) => {
    // Extract just this series' data
    return {
      name: series.id,
      color: series.color || colors[data.indexOf(series) % colors.length],
      data: transformedData.filter((item) => item.id === series.id)
    };
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={chartTheme.tooltip.container}>
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{data.id}</p>
          <div>{`${xAxisDataKey}: ${data[xAxisDataKey]}`}</div>
          <div>{`${yAxisDataKey}: ${data[yAxisDataKey]}`}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart
        margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.grid.line.stroke} 
          />
        )}
        
        <XAxis 
          dataKey={xAxisDataKey} 
          type="number"
          name={xAxisLabel}
          tick={{ fill: chartTheme.textColor }}
          axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
          tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
          label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', fill: chartTheme.textColor } : undefined}
        />
        
        <YAxis 
          dataKey={yAxisDataKey}
          type="number" 
          name={yAxisLabel}
          tick={{ fill: chartTheme.textColor }}
          axisLine={{ stroke: chartTheme.axis.domain.line.stroke }}
          tickLine={{ stroke: chartTheme.axis.ticks.line.stroke }}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'left', fill: chartTheme.textColor } : undefined}
        />
        
        <ZAxis type="number" range={[0, nodeSize]} />
        
        {showTooltip && (
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        )}
        
        {showLegend && (
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{ fontSize: chartTheme.fontSize, color: chartTheme.textColor }}
          />
        )}
        
        {groupedData.map((series, index) => (
          <Scatter
            key={series.name}
            name={series.name}
            data={series.data}
            fill={series.color || colors[index % colors.length]}
            line={false}
            shape="circle"
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterPlotComponent; 