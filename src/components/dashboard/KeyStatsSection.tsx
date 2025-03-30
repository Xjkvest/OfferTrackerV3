import React, { useState, useMemo } from "react";
import { ThumbsUp, CheckCircle, Package, Flame, ChevronDown, ChevronUp, TrendingUp, BarChart, Award, Eye, EyeOff } from "lucide-react";
import { StreakBadges } from "../StreakBadges";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MetricCard, CardVariant } from "@/components/ui/metric-card";

// Compact badge component for horizontal badges display
const CompactBadge: React.FC<{ title: string, icon: React.ReactNode, achieved: boolean }> = ({
  title,
  icon,
  achieved
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border",
            achieved 
              ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" 
              : "bg-muted/20 text-muted-foreground border-border/20 opacity-60"
          )}
        >
          <div className={cn(
            "flex items-center justify-center",
            achieved ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
          )}>
            {icon}
          </div>
          <span className="text-[10px] font-medium">{title}</span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs p-2">
        {achieved ? "Achievement unlocked!" : "Achievement locked"}
        <br />
        {title}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface KeyStatsSectionProps {
  totalOffers: number;
  csatPercentage: number;
  positiveCSAT: number;
  totalRatedOffers: number;
  conversionPercentage: number;
  conversions: number;
  streak?: number;
  compact?: boolean;
  className?: string;
  settings?: any;
}

export function KeyStatsSection({
  totalOffers,
  csatPercentage,
  positiveCSAT,
  totalRatedOffers,
  conversionPercentage,
  conversions,
  streak = 0,
  compact = false,
  className = "",
  settings
}: KeyStatsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { y: 3, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };
  
  // Layout class based on compact mode
  const layoutClass = useMemo(() => {
    if (compact) {
      return "grid grid-cols-2 gap-2 md:grid-cols-2";
    }
    
    if (expanded) {
      return "grid grid-cols-2 gap-2 md:grid-cols-3";
    }
    
    return "grid grid-cols-2 gap-2";
  }, [compact, expanded]);

  // Helper function to format workdays
  const formatWorkdays = (days: number[]): string => {
    if (arrayEquals(days, [1, 2, 3, 4, 5])) return "Mon-Fri";
    if (arrayEquals(days, [2, 3, 4, 5, 6])) return "Tue-Sat";
    if (arrayEquals(days, [0, 1, 2, 3, 4])) return "Sun-Thu";
    
    const dayNames = days.map(d => getDayOfWeekShort(d));
    return dayNames.join(', ');
  };

  const arrayEquals = (a: number[], b: number[]): boolean => {
    return a.length === b.length && a.every((val, idx) => val === b[idx]);
  };

  const getDayOfWeekShort = (day: number): string => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return days[day];
  };

  // Calculate additional derived metrics
  const additionalMetrics = useMemo(() => {
    return {
      avgCSAT: totalRatedOffers > 0 
        ? positiveCSAT / totalRatedOffers 
        : 0,
      convEfficiency: totalOffers > 0 
        ? conversions / totalOffers 
        : 0,
      csatTrend: csatPercentage > 80 ? 'up' as const : csatPercentage < 50 ? 'down' as const : 'neutral' as const,
      convTrend: conversionPercentage > 30 ? 'up' as const : conversionPercentage < 10 ? 'down' as const : 'neutral' as const,
      // Trend types for sparklines
      offerTrendType: totalOffers > 50 ? 'increase' as const : 'stable' as const,
      csatTrendType: csatPercentage > 70 ? 'increase' as const : csatPercentage < 50 ? 'decrease' as const : 'stable' as const,
      convTrendType: conversionPercentage > 25 ? 'increase' as const : conversionPercentage < 15 ? 'decrease' as const : 'stable' as const,
    };
  }, [csatPercentage, conversionPercentage, conversions, positiveCSAT, totalOffers, totalRatedOffers]);

  // Badges based on streak milestone achievements
  const streakBadges = useMemo(() => [
    { 
      title: "First Offer", 
      description: "Successfully logged your first offer", 
      icon: <Package className="h-3.5 w-3.5" />, 
      achieved: streak >= 1 
    },
    { 
      title: "One Week", 
      description: "Maintained streak for 7 days", 
      icon: <Award className="h-3.5 w-3.5" />, 
      achieved: streak >= 7 
    },
    { 
      title: "Two Weeks", 
      description: "Maintained streak for 14 days", 
      icon: <Award className="h-3.5 w-3.5" />, 
      achieved: streak >= 14 
    },
    { 
      title: "Month", 
      description: "Maintained streak for 30 days", 
      icon: <Flame className="h-3.5 w-3.5" />, 
      achieved: streak >= 30 
    },
  ], [streak]);

  // Grid metrics view - used for most displays
  const renderMetricsGrid = () => (
    <motion.div 
      className={layoutClass}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Offers */}
      <motion.div variants={itemVariants} className="h-full">
        <MetricCard
          icon={<Package />}
          variant="primary"
          title="Total Offers"
          value={totalOffers}
          href="/offers"
          sparklineType={additionalMetrics.offerTrendType}
          isCompact={compact}
        />
      </motion.div>

      {/* Positive CSAT */}
      <motion.div variants={itemVariants} className="h-full">
        <MetricCard
          icon={<ThumbsUp />}
          variant="success"
          title="CSAT Rating"
          value={`${csatPercentage}%`}
          detail={`${positiveCSAT} of ${totalRatedOffers} rated`}
          href="/offers?csat=positive"
          trend={{
            direction: additionalMetrics.csatTrend,
            value: additionalMetrics.csatTrend === 'up' ? '+5%' : additionalMetrics.csatTrend === 'down' ? '-3%' : '0%'
          }}
          sparklineType={additionalMetrics.csatTrendType}
          progress={csatPercentage}
          isCompact={compact}
        />
      </motion.div>

      {/* Conversion Rate */}
      <motion.div variants={itemVariants} className="h-full">
        <MetricCard
          icon={<CheckCircle />}
          variant="info"
          title="Conversion Rate"
          value={`${conversionPercentage}%`}
          detail={`${conversions} of ${totalOffers} offers converted`}
          href="/offers?converted=true"
          trend={{
            direction: additionalMetrics.convTrend,
            value: additionalMetrics.convTrend === 'up' ? '+2%' : additionalMetrics.convTrend === 'down' ? '-1%' : '0%'
          }}
          sparklineType={additionalMetrics.convTrendType}
          progress={conversionPercentage}
          isCompact={compact}
        />
      </motion.div>

      {/* Streak */}
      <motion.div variants={itemVariants} className="h-full">
        <MetricCard
          icon={<Flame />}
          variant="warning"
          title="Offer Streak"
          value={`${streak} days`}
          detail={
            settings?.streakSettings?.countWorkdaysOnly
              ? `Based on ${formatWorkdays(settings.streakSettings.workdays || [1, 2, 3, 4, 5])} schedule`
              : "Consecutive days with offers"
          }
          progress={Math.min(100, (streak / 30) * 100)}
          isCompact={compact}
        />
      </motion.div>

      {/* Additional metrics shown when expanded */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Monthly Average */}
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="h-full"
            >
              <MetricCard
                icon={<BarChart />}
                variant="neutral"
                title="Monthly Average"
                value={`${(Math.round(totalOffers / 30 * 100) / 100).toFixed(1)}/day`}
                detail="Average offers per day this month"
                isCompact={compact}
              />
            </motion.div>

            {/* Additional metric slot */}
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="h-full"
            >
              <MetricCard
                icon={<TrendingUp />}
                variant="primary"
                title="Weekly Growth"
                value="+12%"
                detail="Growth rate over past 7 days"
                progress={12}
                isCompact={compact}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Compact badges display
  const renderCompactBadges = () => (
    <div className="flex flex-wrap gap-1.5 py-1.5 pl-1">
      {streakBadges.map((badge, index) => (
        <CompactBadge 
          key={index}
          title={badge.title}
          icon={badge.icon}
          achieved={badge.achieved}
        />
      ))}
    </div>
  );

  // For compact mode, just show the grid without navigation/badges
  if (compact) {
    return renderMetricsGrid();
  }

  // Full featured view with toggle buttons and optional badges display
  return (
    <div className={cn(
      "relative p-2 overflow-hidden",
      "bg-gradient-to-br from-background/90 to-background border border-border/40",
      "backdrop-blur-sm rounded-lg shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-foreground/90 px-0.5">Performance Metrics</div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBadges(!showBadges)}
            className="inline-flex items-center text-[10px] text-muted-foreground hover:text-foreground transition-colors h-6 px-1.5 hover:bg-muted/50 rounded"
          >
            {showBadges ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide Badges
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show Badges
              </>
            )}
          </motion.button>
          <div className="w-px h-3.5 bg-border/60"></div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center text-[10px] text-muted-foreground hover:text-foreground transition-colors h-6 px-1.5 hover:bg-muted/50 rounded"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Less Metrics
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                More Metrics
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Show badges if toggle is on */}
      <AnimatePresence>
        {showBadges && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-2"
          >
            {renderCompactBadges()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main metrics grid */}
      {renderMetricsGrid()}
    </div>
  );
}
