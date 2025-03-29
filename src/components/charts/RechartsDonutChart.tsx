import React, { useState, useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from "recharts";

interface RechartsDonutChartProps {
  data: any[];
  height?: number | string;
  colors?: string[];
  theme: "light" | "dark";
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  dataKey?: string;
  nameKey?: string;
  showTotal?: boolean;
  legendPosition?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    width?: string;
  };
}

// Custom active shape component for hover effect
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill
  } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
        cornerRadius={2}
      />
    </g>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload, theme }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={`p-3 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`}
           style={{ maxWidth: '200px', zIndex: 1000 }}>
        <p className="font-medium text-sm mb-1">{data.name}</p>
        <div className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.fill }}
          />
          <p className="text-sm">
            <span className="font-semibold">{data.value}</span>
            <span className="text-xs opacity-75 ml-1">({(data.payload.percent * 100).toFixed(1)}%)</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const RechartsDonutChart: React.FC<RechartsDonutChartProps> = ({
  data,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#06b6d4", "#ef4444", "#f97316", "#a855f7", "#ec4899"],
  theme = "light",
  innerRadius = 0,
  outerRadius = 80,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  dataKey = "value",
  nameKey = "label",
  showTotal = false,
  legendPosition = { top: 0, left: 0, width: "25%" }
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartHeight = typeof height === 'number' ? height : 300;

  // Create a theme based on light/dark mode
  const chartTheme = {
    background: "transparent",
    textColor: theme === "dark" ? "#e5e5e5" : "#1f2937",
    fontSize: 12,
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

  // Debug input data
  useEffect(() => {
    console.log("RechartsDonutChart received data:", {
      dataLength: data?.length,
      hasData: Array.isArray(data) && data.length > 0,
      firstItem: data && data.length > 0 ? data[0] : null,
      height,
      innerRadius,
      outerRadius,
      showLegend
    });
  }, [data, height, innerRadius, outerRadius, showLegend]);

  // Transform data to Recharts format based on its structure
  const transformData = (data: any[]): any[] => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("RechartsDonutChart: No data provided or empty array");
      return [];
    }
    
    // Check if the data has actual values
    const hasValues = data.some(item => 
      item && typeof item === 'object' && 
      (
        (typeof item.value === 'number' && item.value > 0) || 
        (typeof item[dataKey] === 'number' && item[dataKey] > 0)
      )
    );
    
    if (!hasValues) {
      console.log("RechartsDonutChart: No valid values found in data");
      return [];
    }
    
    // Calculate total for percentages
    const total = data.reduce((sum, item) => {
      if (!item || typeof item !== 'object') return sum;
      const value = item.value !== undefined ? item.value : (item[dataKey] || 0);
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    
    console.log("RechartsDonutChart: Total value calculated:", total);
    
    const transformed = data.map((item, index) => {
      if (!item || typeof item !== 'object') return {
        name: 'Unknown',
        [dataKey]: 0,
        percent: 0
      };
      
      // Extract value - handle both direct value property and dataKey property
      const value = item.value !== undefined ? item.value : (item[dataKey] || 0);
      
      // Extract name - handle both name, label, or id properties
      const name = item.name || item.label || item.id || `Item ${index + 1}`;
      
      return {
        name: name,
        [dataKey]: typeof value === 'number' ? value : 0,
        color: item.color,
        percent: total > 0 ? (typeof value === 'number' ? value : 0) / total : 0,
        ...(item.rating !== undefined && { rating: item.rating })
      };
    }).filter(item => item[dataKey] > 0); // Only include items with positive values
    
    console.log("RechartsDonutChart: Transformed data:", transformed);
    return transformed;
  };

  const transformedData = transformData(data);
  
  // Check if we have valid data to display
  const hasValidData = transformedData && transformedData.length > 0 && transformedData.some(item => item[dataKey] > 0);
  
  // Calculate total value for center text
  const totalValue = hasValidData 
    ? transformedData.reduce((sum, item) => sum + (item[dataKey] || 0), 0)
    : 0;

  // Custom label renderer
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Handle mouse enter/leave for active slice
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    
    if (!payload || payload.length === 0) {
      console.log("RechartsDonutChart: No legend payload");
      return null;
    }
    
    // Limit the number of legend items to display
    const maxLegendItems = 4;
    const displayPayload = payload.slice(0, maxLegendItems);
    const hasMoreItems = payload.length > maxLegendItems;
    
    return (
      <div className="flex flex-col items-start">
        <ul className="flex flex-col gap-y-0.5">
          {displayPayload.map((entry, index) => (
            <li key={`legend-${index}`} 
                className="flex items-center text-[9px] cursor-pointer"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}>
              <div 
                className="h-1.5 w-1.5 rounded-full mr-1" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} truncate max-w-[60px]`}>
                {entry.value}
              </span>
            </li>
          ))}
          {hasMoreItems && (
            <li className="text-[8px] text-muted-foreground mt-0.5">
              +{payload.length - maxLegendItems} more
            </li>
          )}
        </ul>
      </div>
    );
  };

  // If no valid data, show a message
  if (!hasValidData) {
    return (
      <div 
        ref={containerRef}
        className="w-full flex items-center justify-center text-center p-4"
        style={{ height: chartHeight }}
      >
        <div className="text-muted-foreground text-sm">
          No data available
        </div>
      </div>
    );
  }

  // Fixed position values for chart elements
  const chartCx = "45%";
  const chartCy = "50%";

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: chartHeight, maxHeight: chartHeight }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
          <Pie
            data={transformedData}
            cx={chartCx}
            cy={chartCy}
            labelLine={false}
            label={showLabels ? renderCustomizedLabel : undefined}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey="name"
            paddingAngle={1}
            cornerRadius={2}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {transformedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || colors[index % colors.length]} 
              />
            ))}
          </Pie>
          
          {showTooltip && (
            <Tooltip 
              content={<CustomTooltip theme={theme} />} 
              wrapperStyle={{ outline: 'none' }}
            />
          )}
          
          {showLegend && (
            <Legend 
              content={renderLegend}
              layout="vertical"
              verticalAlign="middle" 
              align="left"
              wrapperStyle={legendPosition}
            />
          )}
          
          {/* Total Value Display in Center */}
          {showTotal && innerRadius > 0 && (
            <text 
              x={chartCx}
              y={chartCy}
              textAnchor="middle" 
              dominantBaseline="middle"
              style={{ fontSize: '13px', fontWeight: 600, fill: theme === 'dark' ? '#e5e5e5' : '#1f2937' }}
            >
              {totalValue}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsDonutChart; 