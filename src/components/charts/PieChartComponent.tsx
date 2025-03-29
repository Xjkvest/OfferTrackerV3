
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieDataPoint } from "@/utils/chartDataUtils";

interface PieChartComponentProps {
  data: PieDataPoint[];
  title: string;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, title }) => {
  // Chart customization
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const RADIAN = Math.PI / 180;

  // Custom pie chart label renderer
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, index, id }: any) => {
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return value > 0 ? (
      <text 
        x={x} 
        y={y} 
        fill="#888"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="11"
      >
        {`${id}: ${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    ) : null;
  };

  // Render legends for pie charts
  const renderLegend = (data: PieDataPoint[]) => {
    return (
      <div className="flex flex-col space-y-1 mt-2 text-sm">
        {data.map((entry, index) => {
          // Calculate the percentage - safely handle division by zero
          const totalValue = data.reduce((sum, item) => sum + item.value, 0);
          const percentage = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(0) : '0';
          
          return (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
              />
              <span>{entry.id}: {entry.value} ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="h-64 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              cornerRadius={6}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]} 
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '8px' 
              }}
              formatter={(value: any, name: any) => {
                const totalValue = data.reduce((sum, item) => sum + item.value, 0);
                const percentage = totalValue > 0 ? ((Number(value) / totalValue) * 100).toFixed(0) : '0';
                return [`${value} (${percentage}%)`, name];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {renderLegend(data.map((entry, index) => ({
        ...entry,
        color: entry.color || COLORS[index % COLORS.length]
      })))}
    </>
  );
};
