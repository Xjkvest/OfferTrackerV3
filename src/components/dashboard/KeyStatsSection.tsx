
import React from "react";
import { Link } from "react-router-dom";
import { ThumbsUp, CheckCircle, Package, Flame } from "lucide-react";
import { StreakBadges } from "../StreakBadges";
import { motion } from "framer-motion";

interface KeyStatsSectionProps {
  totalOffers: number;
  csatPercentage: number;
  positiveCSAT: number;
  totalRatedOffers: number;
  conversionPercentage: number;
  conversions: number;
  streak?: number; // Optional streak value
  compact?: boolean; // For embedded view vs standalone
  className?: string;
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
  className = ""
}: KeyStatsSectionProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  // Layout class based on compact mode
  const layoutClass = compact
    ? "grid grid-cols-2 gap-3 md:grid-cols-2"
    : "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <motion.div 
      className={`${layoutClass} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Total Offers */}
      <motion.div variants={itemVariants}>
        <Link to="/offers" className="group block">
          <div className="flex items-start space-x-2 group-hover:bg-background/50 rounded-md transition-all p-2">
            <div className="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-2.5 rounded-full">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium flex items-center">
                Total Offers
              </div>
              <div className="font-bold text-blue-600 dark:text-blue-400">{totalOffers}</div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Positive CSAT */}
      <motion.div variants={itemVariants}>
        <Link to="/offers?csat=positive" className="group block">
          <div className="flex items-start space-x-2 group-hover:bg-background/50 rounded-md transition-all p-2">
            <div className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-full">
              <ThumbsUp className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium flex items-center">
                Positive CSAT
              </div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">{csatPercentage}%</div>
              <div className="text-xs text-muted-foreground">
                {positiveCSAT} of {totalRatedOffers} rated
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Conversion Rate */}
      <motion.div variants={itemVariants}>
        <Link to="/offers?converted=true" className="group block">
          <div className="flex items-start space-x-2 group-hover:bg-background/50 rounded-md transition-all p-2">
            <div className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-full">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium flex items-center">
                Conversion Rate
              </div>
              <div className="font-bold text-indigo-600 dark:text-indigo-400">{conversionPercentage}%</div>
              <div className="text-xs text-muted-foreground">
                {conversions} of {totalOffers} offers
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Streak */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start space-x-2 p-2">
          <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-2.5 rounded-full">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium flex items-center">
              Offer Streak
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-bold text-amber-600 dark:text-amber-400">{streak}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <div className="mt-1">
              <StreakBadges streak={streak} size="xs" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
