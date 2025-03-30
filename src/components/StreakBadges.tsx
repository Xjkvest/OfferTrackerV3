import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useOffers } from "@/context/OfferContext";
import { Flame } from "lucide-react";

interface StreakBadgesProps {
  streak?: number;
  size?: "xs" | "sm" | "md";
  showDays?: boolean;
  className?: string;
}

/**
 * Displays achievement badges for user streaks
 */
export function StreakBadges({
  streak,
  size = "md",
  showDays = true,
  className,
}: StreakBadgesProps) {
  // Pull streakInfo for the enhanced badges
  const { streakInfo } = useOffers();
  
  // Fallback to using passed streak for backward compatibility
  const actualStreak = streak !== undefined ? streak : streakInfo.current;
  
  // Get achievement badges from streakInfo if available
  const enhancedBadges = streakInfo?.badges || [];
  
  // Determine which badges to show based on streak for backward compatibility
  const hasBasicStreak = actualStreak >= 2;
  const hasBronzeStreak = actualStreak >= 5;
  const hasSilverStreak = actualStreak >= 10;
  const hasGoldStreak = actualStreak >= 20;
  const hasPlatinumStreak = actualStreak >= 30;

  // Generate size classes
  const sizeClasses = {
    xs: "h-4 px-1 text-[10px]",
    sm: "h-5 px-2 text-xs",
    md: "h-6 px-2 text-sm",
  };

  // If no streak, don't render anything
  if (actualStreak < 2) return null;
  
  // Display streak preservation tokens if available
  const hasTokens = streakInfo?.preservationTokens > 0;
  
  // Show vacation badge if active
  const isOnVacation = streakInfo?.hasActiveVacation;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      <TooltipProvider>
        {/* Basic streak badge (always show) */}
        {hasBasicStreak && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900",
                  sizeClasses[size]
                )}
              >
                <span className="mr-0.5">🔥</span>
                {actualStreak >= 2 && actualStreak < 5 ? actualStreak : "2+"} {showDays ? "Days" : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Streak of 2+ days!</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Bronze streak badge */}
        {hasBronzeStreak && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800",
                  sizeClasses[size]
                )}
              >
                <span className="mr-0.5">🥉</span>
                5+ {showDays ? "Days" : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Streak of 5+ days!</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Silver streak badge */}
        {hasSilverStreak && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
                  sizeClasses[size]
                )}
              >
                <span className="mr-0.5">🥈</span>
                10+ {showDays ? "Days" : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Streak of 10+ days! Fantastic consistency!</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Gold streak badge */}
        {hasGoldStreak && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800",
                  sizeClasses[size]
                )}
              >
                <span className="mr-0.5">🥇</span>
                20+ {showDays ? "Days" : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Streak of 20+ days! Outstanding achievement!</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Platinum streak badge */}
        {hasPlatinumStreak && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800",
                  sizeClasses[size]
                )}
              >
                <span className="mr-0.5">💎</span>
                30+ {showDays ? "Days" : ""}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Streak of 30+ days! You're a legend!</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Enhanced badges from streakInfo */}
        {enhancedBadges.map(badge => {
          let badgeIcon = "🏆";
          let badgeColor = "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800";
          let tooltip = badge;
          
          // Special badge styling
          if (badge === "Off-Day Hustler") {
            badgeIcon = "🦸";
            badgeColor = "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800";
            tooltip = "You make offers on your off days too! Above and beyond!";
          } else if (badge === "Perfect Month") {
            badgeIcon = "📅";
            badgeColor = "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800";
            tooltip = "Hit your goal every workday for a month!";
          } else if (badge === "Seven Day Streak") {
            badgeIcon = "7️⃣";
            badgeColor = "bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900 dark:text-violet-300 dark:hover:bg-violet-800";
            tooltip = "Made offers 7 days in a row!";
          } else if (badge === "Legend") {
            badgeIcon = "👑";
            badgeColor = "bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-300 dark:hover:bg-pink-800";
            tooltip = "50+ day streak! Absolutely legendary!";
          }
          
          // Skip badges that are covered by the original badges to avoid duplication
          if (["Consistent", "Dedicated", "Professional", "Master"].includes(badge)) {
            return null;
          }
          
          return (
            <Tooltip key={badge}>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className={cn(
                    badgeColor,
                    sizeClasses[size]
                  )}
                >
                  <span className="mr-0.5">{badgeIcon}</span>
                  {badge}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {/* Preservation tokens */}
        {hasTokens && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-300 dark:hover:bg-cyan-800",
                  sizeClasses[size]
                )}
              >
                <span className="mr-0.5">🎫</span>
                {streakInfo.preservationTokens} {streakInfo.preservationTokens === 1 ? "Token" : "Tokens"}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>You have {streakInfo.preservationTokens} streak preservation {streakInfo.preservationTokens === 1 ? "token" : "tokens"}!</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Vacation mode */}
        {isOnVacation && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800",
                  sizeClasses[size]
                )}
              >
                <span className="mr-0.5">🏝️</span>
                Vacation
                {streakInfo.vacationDaysRemaining !== undefined && streakInfo.vacationDaysRemaining > 0 && 
                  `: ${streakInfo.vacationDaysRemaining}d`
                }
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {streakInfo.vacationDaysRemaining !== undefined && streakInfo.vacationDaysRemaining > 0
                  ? `Vacation mode: ${streakInfo.vacationDaysRemaining} days remaining`
                  : "Vacation mode active"
                }
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}
