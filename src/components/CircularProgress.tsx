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
  const percentage = Math.floor((value / goal) * 100);
  
  // Radius for the circle (accounting for stroke width)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Get background color for different segments
  const getBackgroundSegments = () => {
    return (
      <>
        {/* Segment 1 (0-100%) - Yellow background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-amber-500/20"
          strokeDasharray={circumference}
          strokeDashoffset={0}
        />
        
        {/* Segment 2 (100-200%) - Green background (only visible if percentage > 100) */}
        {percentage >= 100 && (
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
        
        {/* Segment 3 (200-300%) - Blue background (only visible if percentage > 200) */}
        {percentage >= 200 && (
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
        
        {/* Segment 4 (300%+) - Purple background (only visible if percentage > 300) */}
        {percentage >= 300 && (
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
    
    if (percentage < 100) {
      // Just first segment filling
      segment1Fill = circumference - (circumference * percentage) / 100;
      segment2Fill = circumference; // Start empty
    } else if (percentage === 100) {
      // First segment is full, second is empty
      segment1Fill = 0;
      segment2Fill = circumference; // Start empty
    } else if (percentage < 200) {
      // First segment is full, second is partially filled
      segment1Fill = 0;
      segment2Fill = circumference - (circumference * (percentage - 100)) / 100;
      segment3Fill = circumference; // Start empty
    } else if (percentage === 200) {
      // First and second segments are full, third is empty
      segment1Fill = 0;
      segment2Fill = 0;
      segment3Fill = circumference; // Start empty
    } else if (percentage < 300) {
      // First and second segments are full, third is partially filled
      segment1Fill = 0;
      segment2Fill = 0;
      segment3Fill = circumference - (circumference * (percentage - 200)) / 100;
      segment4Fill = circumference; // Start empty
    } else if (percentage === 300) {
      // First, second, and third segments are full, fourth is empty
      segment1Fill = 0;
      segment2Fill = 0;
      segment3Fill = 0;
      segment4Fill = circumference; // Start empty
    } else {
      // All segments are partially or fully filled
      segment1Fill = 0;
      segment2Fill = 0;
      segment3Fill = 0;
      segment4Fill = circumference - (circumference * (percentage - 300)) / 100;
    }
    
    return (
      <>
        {/* Segment 1 (0-100%) - Yellow fill */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: segment1Fill }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-amber-500"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
        
        {/* Segment 2 (100-200%) - Green fill */}
        {percentage >= 100 && (
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: segment2Fill }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-emerald-500"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        )}
        
        {/* Segment 3 (200-300%) - Blue fill */}
        {percentage >= 200 && (
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: segment3Fill }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-blue-500"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        )}
        
        {/* Segment 4 (300%+) - Purple fill */}
        {percentage >= 300 && (
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
