
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { BarChartComponent } from "./charts/BarChartComponent";
import { PieChartComponent } from "./charts/PieChartComponent";
import { ChartCard } from "./charts/ChartCard";
import { TimeframeSelector } from "./charts/TimeframeSelector";
import {
  getLast7DaysData,
  getWeekData,
  getMonthData,
  getChannelData,
  getOfferTypeData,
  getCsatData,
  getConversionData
} from "@/utils/chartDataUtils";
import { format } from "date-fns";

export function ProgressChart() {
  const { offers } = useOffers();
  const { dailyGoal, channels, offerTypes } = useUser();
  const [timeframe, setTimeframe] = useState("week");
  
  // Data transformations using utility functions
  const last7DaysData = React.useMemo(() => getLast7DaysData(offers, dailyGoal), [offers, dailyGoal]);
  const weekData = React.useMemo(() => getWeekData(offers, dailyGoal), [offers, dailyGoal]);
  const monthData = React.useMemo(() => getMonthData(offers, dailyGoal), [offers, dailyGoal]);
  const channelData = React.useMemo(() => getChannelData(offers, channels), [offers, channels]);
  const offerTypeData = React.useMemo(() => getOfferTypeData(offers, offerTypes), [offers, offerTypes]);
  const csatData = React.useMemo(() => getCsatData(offers), [offers]);
  const conversionData = React.useMemo(() => getConversionData(offers), [offers]);
  
  const getTimeframeData = () => {
    switch (timeframe) {
      case "week":
        return weekData;
      case "7days":
        return last7DaysData;
      case "month":
        return monthData;
      default:
        return weekData;
    }
  };

  const chartData = getTimeframeData();
  const currentTimeframeText = timeframe === "month" 
    ? format(new Date(), 'MMMM yyyy') 
    : timeframe === "week" 
      ? "This Week" 
      : "Last 7 Days";
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 24 }
        }
      }}>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Offers Over Time: {currentTimeframeText}
              </CardTitle>
              <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={chartData} />
          </CardContent>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Offers by Channel" 
          gradient="from-teal-500 to-emerald-600"
        >
          <PieChartComponent data={channelData} title="Offers by Channel" />
        </ChartCard>
        
        <ChartCard 
          title="Offers by Type" 
          gradient="from-purple-500 to-pink-600"
        >
          <PieChartComponent data={offerTypeData} title="Offers by Type" />
        </ChartCard>
        
        <ChartCard 
          title="CSAT Distribution" 
          gradient="from-amber-500 to-yellow-600"
        >
          <PieChartComponent data={csatData} title="CSAT Distribution" />
        </ChartCard>
        
        <ChartCard 
          title="Conversion Rate" 
          gradient="from-green-500 to-emerald-600"
        >
          <PieChartComponent data={conversionData} title="Conversion Rate" />
        </ChartCard>
      </div>
    </motion.div>
  );
}
