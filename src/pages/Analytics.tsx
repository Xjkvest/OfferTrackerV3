import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { FilterProvider } from "@/context/FilterContext";
import { MonthlyGoalSummary } from "@/components/performance-studio/MonthlyGoalSummary";
import { PerformanceStudio } from "@/components/performance-studio/PerformanceStudio";

const Analytics = () => {
  const { theme } = useTheme();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <FilterProvider>
      <div className="flex flex-col min-h-screen">
        <motion.main 
          className="flex-1 container max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="py-6 px-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Performance Studio</h1>
              <p className="text-muted-foreground">
                Analyze your offer data and track your performance over time
              </p>
            </div>
            
            {/* Monthly Goal Summary Card */}
            <div className="mb-6">
              <MonthlyGoalSummary />
            </div>
            
            {/* Performance Studio */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pt-2 pb-3 border-b">
              <PerformanceStudio />
            </div>
          </div>
        </motion.main>
      </div>
    </FilterProvider>
  );
};

export default Analytics;
