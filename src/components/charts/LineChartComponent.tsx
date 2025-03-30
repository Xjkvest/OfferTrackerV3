import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from "recharts";

interface LineChartComponentProps {
  data: any[];
  height?: number | string;
  colors?: string[];
  theme: "light" | "dark";
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  xAxisDataKey?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  chartType?: "line" | "area";
}

// Custom tooltip component for a more modern look
const CustomTooltip = ({ active, payload, label, theme, xDataKey }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
        <p className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mb-1`}>
          {payload[0]?.payload?.[xDataKey] || label}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
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

export const LineChartComponent: React.FC<LineChartComponentProps> = ({
  data,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#06b6d4", "#ef4444"],
  theme = "light",
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  xAxisDataKey = "x",
  yAxisLabel,
  xAxisLabel,
  chartType = "line"
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
          strokeWidth: 0.5 // Thinner lines
        }
      },
      ticks: {
        line: {
          stroke: theme === "dark" ? "#6b7280" : "#9ca3af",
          strokeWidth: 0.5 // Thinner tick lines
        },
        text: {
          fill: theme === "dark" ? "#e5e5e5" : "#374151",
          fontSize: 11 // Slightly smaller font
        }
      }
    },
    grid: {
      line: {
        stroke: theme === "dark" ? "rgba(55, 65, 81, 0.3)" : "rgba(229, 231, 235, 0.6)", // More subtle grid
        strokeDasharray: "3 3"
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

  // Function to extract unique IDs from the data for generating lines
  const getUniqueDataKeys = (data: any[]): string[] => {
    if (!data || data.length === 0 || !data[0].data) return [];
    
    return data.map(series => series.id);
  };

  const dataKeys = getUniqueDataKeys(data);

  // Transform nivo data format to Recharts format if needed
  const transformData = (data: any[]): any[] => {
    if (!data || data.length === 0) return [];

    // If data is already in Recharts format (array of objects with x, y keys directly)
    if (!data[0].data) return data;

    // Transform from nivo format to Recharts format
    const points = data[0].data.map((point: any, index: number) => {
      const transformedPoint: any = { 
        [xAxisDataKey]: point.x,
        isToday: point.isToday || false
      };
      
      // Add a property for each series
      data.forEach(series => {
        if (series.data[index]) {
          transformedPoint[series.id] = series.data[index].y;
        }
      });
      
      return transformedPoint;
    });

    return points;
  };

  const transformedData = transformData(data);

  // Debugging - console log first data point to verify structure
  // console.log("First data point:", transformedData[0]);
  // console.log("Data keys:", dataKeys);

  return (
    <div className="flex justify-center w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={transformedData}
          margin={{ top: 15, right: 50, left: 0, bottom: 50 }} // Equal left/right margins
        >
          {/* Gradient definitions */}
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient 
                key={`gradient-${key}`} 
                id={`gradient-${key}`} 
                x1="0" 
                y1="0" 
                x2="0" 
                y2="1"
              >
                <stop 
                  offset="5%" 
                  stopColor={colors[index % colors.length]} 
                  stopOpacity={0.8} 
                />
                <stop 
                  offset="95%" 
                  stopColor={colors[index % colors.length]} 
                  stopOpacity={0.1} 
                />
              </linearGradient>
            ))}
          </defs>
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={chartTheme.grid.line.stroke} 
              vertical={false} // No vertical grid lines for cleaner look
              opacity={0.6}
            />
          )}
          
          <XAxis 
            dataKey={xAxisDataKey} 
            tick={(props) => {
              const { x, y, payload } = props;
              // Find if this tick is for today
              const dataPoint = transformedData.find(point => point[xAxisDataKey] === payload.value);
              const isToday = dataPoint?.isToday;
              
              return (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="middle" 
                    fill={isToday ? colors[0] : chartTheme.textColor}
                    fontWeight={isToday ? 'bold' : 'normal'}
                    fontSize={chartTheme.axis.ticks.text.fontSize}
                  >
                    {payload.value}
                  </text>
                  {isToday && (
                    <circle 
                      cx={0} 
                      cy={-4} 
                      r={2} 
                      fill={colors[0]} 
                    />
                  )}
                </g>
              );
            }}
            axisLine={{ stroke: chartTheme.axis.domain.line.stroke, strokeWidth: chartTheme.axis.domain.line.strokeWidth }}
            tickLine={{ stroke: chartTheme.axis.ticks.line.stroke, strokeWidth: chartTheme.axis.ticks.line.strokeWidth }}
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', fill: chartTheme.textColor, fontSize: 12, dy: 15 } : undefined}
            dy={8} // Add some padding
          />
          
          <YAxis 
            tick={{ fill: chartTheme.textColor, fontSize: chartTheme.axis.ticks.text.fontSize }}
            axisLine={{ stroke: chartTheme.axis.domain.line.stroke, strokeWidth: chartTheme.axis.domain.line.strokeWidth }}
            tickLine={{ stroke: chartTheme.axis.ticks.line.stroke, strokeWidth: chartTheme.axis.ticks.line.strokeWidth }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'left', fill: chartTheme.textColor, fontSize: 12, dx: -10 } : undefined}
            dx={-4} // Reduced padding
            tickMargin={4}
            width={30}
          />
          
          {showTooltip && (
            <Tooltip
              content={<CustomTooltip theme={theme} xDataKey={xAxisDataKey} />}
              cursor={{ stroke: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)", strokeWidth: 1 }}
            />
          )}
          
          {/* Render either Line or Area components based on chartType */}
          {dataKeys.map((key, index) => (
            chartType === "line" ? (
              <Line
                key={`line-${key}`}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            ) : (
              <Area
                key={`area-${key}`}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={`url(#gradient-${key})`}
                fillOpacity={1}
              />
            )
          ))}
          
          
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent; 