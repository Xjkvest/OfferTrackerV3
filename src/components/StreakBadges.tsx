
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgesProps {
  streak: number;
  size?: "xs" | "sm" | "md";
  className?: string;
  showDays?: boolean; // Added this property
}

export function StreakBadges({ 
  streak, 
  size = "sm", 
  className,
  showDays = true // Default to true for backward compatibility
}: StreakBadgesProps) {
  // Determine which badges to show based on streak
  const hasBasicStreak = streak >= 2;
  const hasBronzeStreak = streak >= 5;
  const hasSilverStreak = streak >= 10;
  const hasGoldStreak = streak >= 20;
  const hasPlatinumStreak = streak >= 30;

  // Apply size classes
  const sizeClasses = {
    xs: "text-[10px] py-0 px-1.5 h-4",
    sm: "text-xs py-0.5 px-2 h-5",
    md: "text-sm py-1 px-2.5 h-6"
  };
  
  const iconSize = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5"
  };

  // If no streak, don't render anything
  if (streak < 2) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {hasBasicStreak && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/20",
            sizeClasses[size]
          )}
        >
          <Flame className={cn("mr-0.5 text-amber-500", iconSize[size])} /> 
          {streak >= 2 && streak < 5 ? streak : "2+"} {showDays ? "Days" : ""}
        </Badge>
      )}

      {hasBronzeStreak && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-gradient-to-r from-amber-600/10 to-amber-700/10 border-amber-700/20",
            sizeClasses[size]
          )}
        >
          <Flame className={cn("mr-0.5 text-amber-600", iconSize[size])} /> 
          5+ {showDays ? "Days" : ""}
        </Badge>
      )}

      {hasSilverStreak && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-gradient-to-r from-slate-300/10 to-slate-400/10 border-slate-400/20",
            sizeClasses[size]
          )}
        >
          <Flame className={cn("mr-0.5 text-slate-400", iconSize[size])} /> 
          10+ {showDays ? "Days" : ""}
        </Badge>
      )}

      {hasGoldStreak && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border-yellow-500/20",
            sizeClasses[size]
          )}
        >
          <Flame className={cn("mr-0.5 text-yellow-500", iconSize[size])} /> 
          20+ {showDays ? "Days" : ""}
        </Badge>
      )}

      {hasPlatinumStreak && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-gradient-to-r from-purple-400/10 to-indigo-500/10 border-purple-500/20",
            sizeClasses[size]
          )}
        >
          <Flame className={cn("mr-0.5 text-purple-500", iconSize[size])} /> 
          30+ {showDays ? "Days" : ""}
        </Badge>
      )}
    </div>
  );
}
