import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { MotivationalMessage } from "../MotivationalMessage";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CircularProgress } from "../CircularProgress";
import { CondensedMetrics } from "../CondensedMetrics";
import { OfferForm } from "../OfferForm";
import { KeyStatsSection } from "./KeyStatsSection";
import { motion } from "framer-motion";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format,
  isToday
} from "date-fns";
import { useTheme } from '@/context/ThemeContext';
import { LineChartComponent } from "@/components/charts/LineChartComponent";

interface DashboardProgressGroupProps {
  onNewOfferClick: () => void;
  onNewOfferSuccess: () => void;
  onClose?: () => void;
  streak?: number;
}

export function DashboardProgressGroup({ onNewOfferClick, onNewOfferSuccess, onClose, streak: customStreak }: DashboardProgressGroupProps) {
  const { dailyGoal, dashboardElements, settings = {} } = useUser();
  const { todaysOffers, offers, streak = customStreak || 0 } = useOffers();
  const { theme } = useTheme();
  
  // Calculate metrics
  const positiveCSAT = offers.filter(o => o.csat === 'positive').length;
  const totalRatedOffers = offers.filter(o => o.csat).length;
  const csatPercentage = totalRatedOffers > 0 
    ? Math.round((positiveCSAT / totalRatedOffers) * 100) 
    : 0;
    
  const conversions = offers.filter(o => o.converted).length;
  const conversionPercentage = offers.length > 0 
    ? Math.round((conversions / offers.length) * 100) 
    : 0;
  
  const showQuickLogOffer = dashboardElements.includes('newOfferForm');
  const showKeyMetrics = dashboardElements.includes('metrics');
  const showProgress = dashboardElements.includes('progress');

  // Generate current month overview data
  const generateMonthlyOverviewData = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return days.map(day => {
      const dayOffers = offers.filter(
        offer => new Date(offer.date).toDateString() === day.toDateString()
      );
      
      const dayConversions = dayOffers.filter(offer => offer.converted).length;
      const dayPositiveCSAT = dayOffers.filter(offer => offer.csat === 'positive').length;
      const dayNegativeCSAT = dayOffers.filter(offer => offer.csat === 'negative').length;
      
      return {
        date: format(day, 'd'),
        offers: dayOffers.length,
        conversions: dayConversions,
        positiveCSAT: dayPositiveCSAT,
        negativeCSAT: dayNegativeCSAT,
        goal: dailyGoal,
        isToday: isToday(day)
      };
    });
  };
  
  const monthlyData = generateMonthlyOverviewData();
  const chartData = [
    {
      id: 'Offers',
      color: 'rgba(59, 130, 246, 0.8)',
      data: monthlyData.map(d => ({ 
        x: d.date, 
        y: d.offers,
        isToday: d.isToday
      }))
    },
    {
      id: 'Conversions',
      color: 'rgba(16, 185, 129, 0.8)',
      data: monthlyData.map(d => ({ 
        x: d.date, 
        y: d.conversions,
        isToday: d.isToday
      }))
    },
    {
      id: 'Positive CSAT',
      color: 'rgba(6, 182, 212, 0.8)',
      data: monthlyData.map(d => ({ 
        x: d.date, 
        y: d.positiveCSAT,
        isToday: d.isToday
      }))
    },
    {
      id: 'Negative CSAT',
      color: 'rgba(239, 68, 68, 0.8)',
      data: monthlyData.map(d => ({ 
        x: d.date, 
        y: d.negativeCSAT,
        isToday: d.isToday
      }))
    }
  ];
  const currentMonth = format(new Date(), 'MMMM yyyy');

  if (!showProgress && !showQuickLogOffer && !showKeyMetrics) {
    return null;
  }

  // Determine layout based on which elements are showing
  const showCombinedProgressAndMetrics = showProgress && showKeyMetrics && showQuickLogOffer;
  const showStandaloneMetricsWithChart = showKeyMetrics && !showQuickLogOffer && showProgress;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {showProgress && (
        <div className={`flex flex-col h-full ${(!showQuickLogOffer && !showKeyMetrics) ? 'lg:col-span-2' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
          >
            <Card className="flex-1 glass-card bg-gradient-to-br from-background/80 to-background/40 shadow-sm dark:shadow-inner hover:shadow-md transition-all flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="pb-2 flex flex-col items-center justify-center flex-grow gap-4">
                <div className="flex flex-col items-center">
                  <CircularProgress 
                    value={todaysOffers.length} 
                    goal={dailyGoal}
                    strokeWidth={16}
                    size={160}
                  />
                  <div className="mt-4 text-center">
                    <MotivationalMessage />
                  </div>
                </div>
                
                {/* Only show embedded Key Stats when Quick Log Offer is enabled and metrics are enabled */}
                {showCombinedProgressAndMetrics && (
                  <div className="w-full mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Key Stats for {currentMonth}</h3>
                    <KeyStatsSection
                      totalOffers={offers.length}
                      csatPercentage={csatPercentage}
                      positiveCSAT={positiveCSAT}
                      totalRatedOffers={totalRatedOffers}
                      conversionPercentage={conversionPercentage}
                      conversions={conversions}
                      streak={streak}
                      settings={settings}
                      compact={true}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!showQuickLogOffer && (
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    onClick={onNewOfferClick}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Log New Offer
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
      
      {/* Only show separate metrics card when Quick Log Offer is disabled but metrics are enabled */}
      {showStandaloneMetricsWithChart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full"
        >
          <Card className="glass-card bg-gradient-to-br from-background/80 to-background/40 shadow-sm hover:shadow-md transition-all h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Key Metrics for {currentMonth}</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              {/* Overview Chart - only shown when standalone metrics card is visible */}
              <div className="mb-6 h-44 px-0">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Monthly Overview</h3>
                <div style={{ height: "220px" }} className="w-full">
                  <LineChartComponent
                    data={chartData}
                    height={220}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    showLegend={true}
                    xAxisDataKey="x"
                    colors={[
                      'rgba(59, 130, 246, 1)', // Blue for offers
                      'rgba(16, 185, 129, 1)',  // Green for conversions
                      'rgba(6, 182, 212, 1)',   // Cyan for positive CSAT
                      'rgba(239, 68, 68, 1)'    // Red for negative CSAT
                    ]}
                  />
                </div>
              </div>
              
              {/* Key Metrics - adding more spacing between chart and metrics */}
              <div className="mt-2">
                <KeyStatsSection
                  totalOffers={offers.length}
                  csatPercentage={csatPercentage}
                  positiveCSAT={positiveCSAT}
                  totalRatedOffers={totalRatedOffers}
                  conversionPercentage={conversionPercentage}
                  conversions={conversions}
                  streak={streak}
                  settings={settings}
                  compact={false}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {showQuickLogOffer && (
        <div className={`flex flex-col h-full ${(!showProgress && !showKeyMetrics) ? 'lg:col-span-2' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-indigo-500/5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Quick Log Offer</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex-grow">
                <OfferForm 
                  onSuccess={onNewOfferSuccess}
                  compact={true}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
