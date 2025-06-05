import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { OfferDialog } from "./OfferDialog";
import { DashboardPreferences } from "./DashboardPreferences";
import { toast } from "@/hooks/use-toast";
import { DashboardItemsManager } from "./dashboard/DashboardItemsManager";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { useSimpleKeyboardShortcuts } from "@/hooks/use-simple-keyboard-shortcuts";
import { getTodayDateString } from "@/utils/dateUtils";
import { HelpButton } from "./HelpButton";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { userName } = useUser();
  const { offers, streak, isLoading } = useOffers();
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [preferenceDialogOpen, setPreferenceDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const navigate = useNavigate();
  

  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleRecentOfferClick = useCallback((offerId: string) => {
    setSelectedOfferId(offerId);
    setOfferDialogOpen(true);
  }, []);

  const handleNewOfferSuccess = useCallback(() => {
    toast({
      title: "Offer Added",
      description: "Your offer has been successfully logged.",
    });
  }, []);

  const handleNewOfferClick = useCallback(() => {
    setSelectedOfferId(null);
    setOfferDialogOpen(true);
  }, []);

  const handlePreferencesClick = useCallback(() => {
    setPreferenceDialogOpen(true);
  }, []);
  
  const handleHelpClick = useCallback(() => {
    navigate("/help");
  }, [navigate]);

  // Setup keyboard shortcuts
  useSimpleKeyboardShortcuts({
    onNewOffer: handleNewOfferClick,
    onPreferences: handlePreferencesClick,
  });

  useEffect(() => {
    // Display streak toast if streak is 3 or more days
    if (streak >= 3) {
      toast({
        title: `${streak}-Day Streak! 🔥`,
        description: "Keep up the great work with your daily offers!",
        variant: "default",
      });
    }
    
    const today = getTodayDateString();
    
    // Check both followups array and legacy followupDate
    const urgentFollowups = offers.filter(o => {
      // Check new followups array structure
      if (o.followups && o.followups.length > 0) {
        return o.followups.some(f => !f.completed && f.date <= today);
      }
      // Fall back to legacy followupDate
      return o.followupDate && (o.followupDate <= today);
    });
    
    const urgentCount = urgentFollowups.length;
    
    if (urgentCount > 0) {
      toast({
        title: "Follow-ups Due",
        description: `You have ${urgentCount} urgent follow-up${urgentCount !== 1 ? 's' : ''} today.`,
        variant: "default",
      });
    }
  }, [offers, streak]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="container max-w-4xl mx-auto p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <DashboardHeader 
        userName={userName}
        onPreferencesClick={handlePreferencesClick}
      />

      <DashboardItemsManager 
        onOfferClick={handleRecentOfferClick}
        onNewOfferClick={handleNewOfferClick}
        onNewOfferSuccess={handleNewOfferSuccess}
        streak={streak}
      />
      
      <OfferDialog 
        open={offerDialogOpen} 
        onOpenChange={setOfferDialogOpen} 
        offerId={selectedOfferId} 
      />

      <DashboardPreferences
        open={preferenceDialogOpen}
        onOpenChange={setPreferenceDialogOpen}
      />
    </motion.div>
  );
}
