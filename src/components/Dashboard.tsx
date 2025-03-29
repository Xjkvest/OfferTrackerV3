import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { OfferDialog } from "./OfferDialog";
import { DashboardPreferences } from "./DashboardPreferences";
import { toast } from "@/hooks/use-toast";
import { DashboardItemsManager } from "./dashboard/DashboardItemsManager";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { HelpButton } from "./HelpButton";
import { useToast } from "@/components/ui/use-toast";
import { openHelp } from "./HelpButton";

export function Dashboard() {
  const { userName } = useUser();
  const { offers, streak, isLoading } = useOffers();
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [preferenceDialogOpen, setPreferenceDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  
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
    openHelp();
  }, []);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    newOffer: {
      combo: { key: 'n', metaKey: true },
      handler: handleNewOfferClick,
      description: 'Create a new offer (⌘ N)',
    },
    quickOffer: {
      combo: { key: 'o', metaKey: true },
      handler: handleNewOfferClick,
      description: 'Quick log offer (⌘ O)',
    },
    preferences: {
      combo: { key: ',', metaKey: true },
      handler: handlePreferencesClick,
      description: 'Open preferences (⌘ ,)',
    },
    help: {
      combo: { key: '/', metaKey: true },
      handler: handleHelpClick,
      description: 'Show keyboard shortcuts (⌘ /)',
    },
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
    
    const today = new Date().toISOString().split('T')[0];
    const urgentFollowups = offers.filter(o => {
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
      className="container max-w-4xl mx-auto p-4 space-y-6"
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
      
      {/* Hidden help dialog for keyboard shortcut */}
      <div className="hidden">
        <HelpButton asPopover={false} />
      </div>
    </motion.div>
  );
}
