
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { KeyStatsSection } from "./dashboard/KeyStatsSection";
import { format } from "date-fns";

interface CondensedMetricsProps {
  csatPercentage: number;
  positiveCSAT: number;
  totalRatedOffers: number;
  conversionPercentage: number;
  conversions: number;
  totalOffers: number;
  streak?: number;
  className?: string;
}

export function CondensedMetrics({
  csatPercentage,
  positiveCSAT,
  totalRatedOffers,
  conversionPercentage,
  conversions,
  totalOffers,
  streak = 0,
  className = ""
}: CondensedMetricsProps) {
  const currentMonth = format(new Date(), 'MMMM yyyy');
  
  return (
    <Card className={`w-full glass-card bg-gradient-to-br from-background/80 to-background/40 shadow-sm hover:shadow-md transition-all ${className}`}>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Key Stats for {currentMonth}</h3>
        <KeyStatsSection
          totalOffers={totalOffers}
          csatPercentage={csatPercentage}
          positiveCSAT={positiveCSAT}
          totalRatedOffers={totalRatedOffers}
          conversionPercentage={conversionPercentage}
          conversions={conversions}
          streak={streak}
          compact={false}
        />
      </CardContent>
    </Card>
  );
}
