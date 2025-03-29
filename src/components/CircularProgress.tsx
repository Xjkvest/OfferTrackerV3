
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  value,
  goal,
  size = 160,
  strokeWidth = 16,
  className,
}: CircularProgressProps) {
  // Calculate percentage against goal (100% = daily goal)
  const percentage = Math.min(Math.floor((value / goal) * 100), 300);
  
  // Radius for the circle (accounting for stroke width)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Get color based on completion percentage
  const getColor = () => {
    if (percentage <= 25) return "stroke-amber-400/90"; // Yellow for up to 25%
    if (percentage <= 50) return "stroke-amber-500"; // Darker yellow for 26-50%
    if (percentage <= 75) return "stroke-emerald-400"; // Light green for 51-75%
    if (percentage <= 100) return "stroke-emerald-500"; // Green for 76-100%
    if (percentage <= 150) return "stroke-blue-400"; // Light blue for 101-150%
    if (percentage <= 200) return "stroke-blue-500"; // Blue for 151-200%
    if (percentage <= 300) return "stroke-purple-500"; // Purple for 201-300%
    return "stroke-purple-600"; // Dark purple for >300%
  };
  
  // Get background color for different segments
  const getBackgroundSegments = () => {
    return (
      <>
        {/* Segment 1 (0-100%) - Yellow/Green background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-amber-400/20"
          strokeDasharray={circumference}
          strokeDashoffset={0}
        />
        
        {/* Segment 2 (100-200%) - Blue background (only visible if percentage > 100) */}
        {percentage > 100 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-emerald-500/20"
            strokeDasharray={circumference}
            strokeDashoffset={0}
          />
        )}
        
        {/* Segment 3 (200-300%) - Purple background (only visible if percentage > 200) */}
        {percentage > 200 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-blue-500/20"
            strokeDashoffset={0}
          />
        )}
        
        {/* Segment 4 (300%+) - Royal Purple background (only visible if percentage > 300) */}
        {percentage > 300 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-purple-600/20"
            strokeDashoffset={0}
          />
        )}
      </>
    );
  };
  
  // Compute how much to fill each segment
  const getFillSegments = () => {
    // Calculate dashoffset for different percentage ranges
    let segment1Fill = 0; // 0-100%
    let segment2Fill = 0; // 100-200%
    let segment3Fill = 0; // 200-300%
    let segment4Fill = 0; // 300%+
    
    if (percentage <= 100) {
      // Just first segment filling
      segment1Fill = circumference - (circumference * percentage) / 100;
    } else if (percentage <= 200) {
      // First segment is full, second is partially filled
      segment1Fill = 0;
      segment2Fill = circumference - (circumference * (percentage - 100)) / 100;
    } else if (percentage <= 300) {
      // First and second segments are full, third is partially filled
      segment1Fill = 0;
      segment2Fill = 0;
      segment3Fill = circumference - (circumference * (percentage - 200)) / 100;
    } else {
      // All segments are full
      segment1Fill = 0;
      segment2Fill = 0;
      segment3Fill = 0;
      segment4Fill = 0;
    }
    
    return (
      <>
        {/* Segment 1 (0-100%) - Yellow/Green fill */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: segment1Fill }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={percentage <= 100 ? getColor() : "stroke-emerald-500"}
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
        
        {/* Segment 2 (100-200%) - Blue fill */}
        {percentage > 100 && (
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: segment2Fill }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={percentage <= 200 ? getColor() : "stroke-blue-500"}
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        )}
        
        {/* Segment 3 (200-300%) - Purple fill */}
        {percentage > 200 && (
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: segment3Fill }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={percentage <= 300 ? getColor() : "stroke-purple-500"}
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        )}
        
        {/* Segment 4 (300%+) - Royal Purple fill */}
        {percentage > 300 && (
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: segment4Fill }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-purple-600"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        )}
      </>
    );
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)} aria-label={`Progress: ${value} out of ${goal} offers (${percentage}%)`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {getBackgroundSegments()}
        {getFillSegments()}
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent">{value}</span>
        <span className="text-muted-foreground text-sm">of {goal}</span>
      </div>
    </div>
  );
}
