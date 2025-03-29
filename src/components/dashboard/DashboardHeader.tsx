import React from "react";
import { motion } from "framer-motion";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeBasedGreeting } from "../TimeBasedGreeting";

interface DashboardHeaderProps {
  userName: string;
  onPreferencesClick: () => void;
}

export function DashboardHeader({ userName, onPreferencesClick }: DashboardHeaderProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <div className="flex justify-between items-center mb-6">
        <TimeBasedGreeting 
          name={userName} 
          className="text-xl font-medium" 
        />
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-secondary/30 hover:bg-secondary/60 rounded-full w-10 h-10 min-w-10"
            onClick={onPreferencesClick}
            data-tutorial="dashboard-preferences"
            aria-label="Dashboard Preferences"
          >
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Dashboard Preferences</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
