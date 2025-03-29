import React from "react";
import { ResponsiveContainer } from "recharts";

interface HeatMapComponentProps {
  data: any[];
  height?: number | string;
  colors?: string[];
  theme: "light" | "dark";
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const HeatMapComponent: React.FC<HeatMapComponentProps> = ({
  data,
  height = 300,
  colors = ["#f7fafc", "#3b82f6"],
  theme = "light",
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel
}) => {
  // Create a theme based on light/dark mode
  const chartTheme = {
    background: "transparent",
    textColor: theme === "dark" ? "#e5e5e5" : "#1f2937",
    fontSize: 12,
    cellBorder: theme === "dark" ? "#2d3748" : "#e2e8f0",
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

  // Transform nivo data format to a format we can use
  const transformData = (data: any[]) => {
    if (!data || data.length === 0) return { rows: [], columns: [], cells: [] };
    
    // Extract row and column ids
    const rows = Array.from(new Set(data.map(cell => cell.yKey || cell.y)));
    const columns = Array.from(new Set(data.map(cell => cell.xKey || cell.x)));
    
    // Create cell data
    const cells = data.map(cell => ({
      x: cell.xKey || cell.x,
      y: cell.yKey || cell.y,
      value: cell.value || cell.data?.value,
      formattedValue: cell.formattedValue,
      data: cell.data
    }));
    
    return { rows, columns, cells };
  };

  const { rows, columns, cells } = transformData(data);

  // Get color scale
  const getColorForValue = (value: number, min: number, max: number) => {
    if (min === max) return colors[0];
    
    const normalizedValue = (value - min) / (max - min);
    
    // Simple interpolation for a gradual spectrum
    const r = parseInt(colors[0].substring(1, 3), 16) + normalizedValue * (parseInt(colors[1].substring(1, 3), 16) - parseInt(colors[0].substring(1, 3), 16));
    const g = parseInt(colors[0].substring(3, 5), 16) + normalizedValue * (parseInt(colors[1].substring(3, 5), 16) - parseInt(colors[0].substring(3, 5), 16));
    const b = parseInt(colors[0].substring(5, 7), 16) + normalizedValue * (parseInt(colors[1].substring(5, 7), 16) - parseInt(colors[0].substring(5, 7), 16));
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  // Find min and max values for color mapping
  const cellValues = cells.map(cell => typeof cell.value === 'number' ? cell.value : 0);
  const minValue = Math.min(...cellValues);
  const maxValue = Math.max(...cellValues);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <div className="w-full h-full flex flex-col">
        {/* Header - X axis labels */}
        <div className="flex mb-1">
          <div className="w-20"></div> {/* Empty corner cell */}
          <div className="flex-1 flex">
            {columns.map((column, i) => (
              <div 
                key={`col-${i}`} 
                className="flex-1 px-1 text-center truncate" 
                style={{ color: chartTheme.textColor, fontSize: chartTheme.fontSize }}
              >
                {column}
              </div>
            ))}
          </div>
        </div>
        
        {/* Heatmap body */}
        <div className="flex-1 flex flex-col">
          {rows.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex flex-1">
              {/* Y axis label */}
              <div 
                className="w-20 flex items-center justify-end pr-2 truncate" 
                style={{ color: chartTheme.textColor, fontSize: chartTheme.fontSize }}
              >
                {row}
              </div>
              
              {/* Cell row */}
              <div className="flex-1 flex">
                {columns.map((column, colIndex) => {
                  const cell = cells.find(c => c.x === column && c.y === row);
                  const value = cell?.value || 0;
                  const formattedValue = cell?.formattedValue || value;
                  
                  return (
                    <div 
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="flex-1 relative flex items-center justify-center m-0.5 rounded-sm"
                      style={{ 
                        backgroundColor: getColorForValue(value as number, minValue, maxValue),
                        border: `1px solid ${chartTheme.cellBorder}`,
                        cursor: 'pointer'
                      }}
                      title={showTooltip ? `${row} - ${column}: ${formattedValue}` : undefined}
                    >
                      <span 
                        className="text-xs font-semibold"
                        style={{
                          color: value > (minValue + maxValue) / 2 ? '#fff' : '#000',
                          fontSize: 10
                        }}
                      >
                        {formattedValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="mt-4 flex justify-center items-center">
            <div 
              className="text-xs mr-2" 
              style={{ color: chartTheme.textColor }}
            >
              {minValue}
            </div>
            <div 
              className="w-40 h-3 rounded-sm" 
              style={{ 
                background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})` 
              }}
            ></div>
            <div 
              className="text-xs ml-2" 
              style={{ color: chartTheme.textColor }}
            >
              {maxValue}
            </div>
          </div>
        )}
        
        {/* Axis Labels */}
        {(xAxisLabel || yAxisLabel) && (
          <div className="mt-2 flex justify-between">
            {yAxisLabel && (
              <div 
                className="text-xs transform -rotate-90 origin-left" 
                style={{ color: chartTheme.textColor }}
              >
                {yAxisLabel}
              </div>
            )}
            {xAxisLabel && (
              <div 
                className="text-xs text-center w-full" 
                style={{ color: chartTheme.textColor }}
              >
                {xAxisLabel}
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default HeatMapComponent; 