import React from "react";
import { ResponsiveContainer } from "recharts";

interface FunnelChartProps {
  data: any[];
  height?: number | string;
  colors?: string[];
  theme: "light" | "dark";
  showValues?: boolean;
  showTooltip?: boolean;
  valueFormat?: (value: number) => string;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#06b6d4", "#ef4444", "#f97316", "#a855f7", "#ec4899"],
  theme = "light",
  showValues = true,
  showTooltip = true,
  valueFormat = (value: number) => value.toString()
}) => {
  // Create a theme based on light/dark mode
  const chartTheme = {
    background: "transparent",
    textColor: theme === "dark" ? "#e5e5e5" : "#1f2937",
    fontSize: 12,
    tooltip: {
      background: theme === "dark" ? "#1f2937" : "#fff",
      color: theme === "dark" ? "#f9fafb" : "#111827"
    }
  };

  // Transform nivo funnel data to a format we can use
  const transformData = (data: any[]) => {
    if (!data || data.length === 0) return [];

    // Sort data by value in descending order
    const sortedData = [...data].sort((a, b) => {
      const valueA = typeof a.value === 'number' ? a.value : 0;
      const valueB = typeof b.value === 'number' ? b.value : 0;
      return valueB - valueA;
    });
    
    return sortedData.map((item, index) => ({
      id: item.id || `item-${index}`,
      label: item.label || item.id || `Item ${index + 1}`,
      value: item.value || 0,
      color: item.color || colors[index % colors.length]
    }));
  };

  const processedData = transformData(data);
  
  // Calculate total width and max value for scaling
  const maxValue = Math.max(...processedData.map(item => item.value));
  
  // Custom CSS implementation of a funnel chart
  return (
    <ResponsiveContainer width="100%" height={height}>
      <div className="w-full h-full flex flex-col justify-center">
        {processedData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const leftPadding = (100 - percentage) / 2; // Center the bar
          
          return (
            <div key={item.id} className="mb-3 w-full flex flex-col items-center">
              <div 
                className="relative w-full flex items-center justify-center"
                style={{ height: `${Math.max(40, 300 / processedData.length)}px` }}
              >
                {/* Funnel segment */}
                <div 
                  className="h-full rounded-sm relative flex items-center justify-center transition-all"
                  style={{ 
                    width: `${percentage}%`, 
                    marginLeft: `${leftPadding}%`,
                    backgroundColor: item.color,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Label inside the bar */}
                  {showValues && (
                    <span 
                      className="text-white font-semibold z-10 text-center px-2 truncate"
                      style={{ fontSize: chartTheme.fontSize }}
                    >
                      {valueFormat(item.value)}
                    </span>
                  )}
                  
                  {/* Tooltip on hover */}
                  {showTooltip && (
                    <div className="absolute opacity-0 hover:opacity-100 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-200 rounded-sm">
                      <div 
                        className="p-2 rounded-md"
                        style={{ 
                          backgroundColor: chartTheme.tooltip.background,
                          color: chartTheme.tooltip.color,
                          fontSize: chartTheme.fontSize
                        }}
                      >
                        <div className="font-bold">{item.label}</div>
                        <div>{valueFormat(item.value)}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Label to the right */}
                <div 
                  className="absolute right-0 transform translate-x-[105%] truncate"
                  style={{ 
                    color: chartTheme.textColor,
                    fontSize: chartTheme.fontSize
                  }}
                >
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ResponsiveContainer>
  );
};

export default FunnelChart; 