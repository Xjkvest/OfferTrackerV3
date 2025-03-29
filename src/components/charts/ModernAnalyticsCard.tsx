import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  Info,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/context/ThemeContext';

interface ModernAnalyticsCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  gradient?: string;
  children: React.ReactNode;
  insights?: {
    title: string;
    value: string;
    description: string;
  }[];
  className?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

export function ModernAnalyticsCard({
  title,
  value,
  trend,
  icon,
  gradient = "from-blue-500/10 to-blue-500/5",
  children,
  insights,
  className,
  badge,
}: ModernAnalyticsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();

  // Extract the base color from the gradient
  const baseColor = gradient.split("-")[1] || "blue";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md flex flex-col",
        theme === 'dark' 
          ? "bg-gray-800/50 border-gray-700/50" 
          : "bg-white border-gray-200/50",
        `border-${baseColor}-500/10`,
        className
      )}
    >
      {/* Header Section */}
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "rounded-lg p-2",
              theme === 'dark'
                ? `bg-${baseColor}-500/10 text-${baseColor}-400`
                : `bg-${baseColor}-50 text-${baseColor}-600`
            )}>
              {icon}
            </div>
            <div>
              <h3 className={cn(
                "text-sm font-medium",
                theme === 'dark' ? "text-gray-300" : "text-gray-600"
              )}>
                {title}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-2xl font-bold",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  {value}
                </span>
                {trend && (
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    trend.isPositive
                      ? theme === 'dark'
                        ? "bg-green-500/10 text-green-400"
                        : "bg-green-50 text-green-700"
                      : theme === 'dark'
                        ? "bg-red-500/10 text-red-400"
                        : "bg-red-50 text-red-700"
                  )}>
                    {trend.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </div>
            </div>
          </div>
          {badge && (
            <Badge 
              variant={badge.variant || "secondary"} 
              className={cn(
                theme === 'dark' 
                  ? "bg-gray-700/50 text-gray-300" 
                  : "bg-white text-gray-700"
              )}
            >
              {badge.text}
            </Badge>
          )}
        </div>
      </div>

      {/* Chart Section - Takes remaining space */}
      <div className="flex-1 relative px-4 pb-4">
        {children}
      </div>

      {/* Insights Section - Always at bottom */}
      {insights && insights.length > 0 && (
        <div className={cn(
          "border-t",
          theme === 'dark' ? "border-gray-700/50" : "border-gray-100"
        )}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between px-4 py-2 text-sm",
              theme === 'dark'
                ? "text-gray-300 hover:bg-gray-700/50"
                : "text-gray-600 hover:bg-gray-50"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>View Insights</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 p-4 pt-0">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={cn(
                        "rounded-lg p-3",
                        theme === 'dark'
                          ? "bg-gray-700/30"
                          : "bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-medium",
                          theme === 'dark' ? "text-gray-300" : "text-gray-600"
                        )}>
                          {insight.title}
                        </span>
                        <span className={cn(
                          "text-sm font-semibold",
                          theme === 'dark' ? "text-white" : "text-gray-900"
                        )}>
                          {insight.value}
                        </span>
                      </div>
                      <p className={cn(
                        "mt-1 text-xs",
                        theme === 'dark' ? "text-gray-400" : "text-gray-500"
                      )}>
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
} 