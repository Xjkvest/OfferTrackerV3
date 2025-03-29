import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useOffers } from "@/context/OfferContext";
import { OfferForm } from "./OfferForm";
import { FirstTimeSetup } from "./FirstTimeSetup";
import { useUser } from "@/context/UserContext";
import { OfferDetails } from "./OfferDetails";
import { motion } from "framer-motion";

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerId?: string | null;
  onSetupComplete?: () => void;
}

export function OfferDialog({ open, onOpenChange, offerId, onSetupComplete }: OfferDialogProps) {
  const { userName } = useUser();
  const { offers } = useOffers();
  const [showSetup, setShowSetup] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<typeof offers[number] | null>(null);
  
  // Check if setup is needed
  useEffect(() => {
    setShowSetup(!userName);
  }, [userName]);
  
  // Find the selected offer when offerId changes
  useEffect(() => {
    if (offerId) {
      const offer = offers.find(o => o.id === offerId);
      setSelectedOffer(offer || null);
    } else {
      setSelectedOffer(null);
    }
  }, [offerId, offers]);
  
  // Handle dialog close
  const handleClose = () => {
    onOpenChange(false);
  };
  
  // Handle setup completion
  const handleSetupComplete = () => {
    setShowSetup(false);
    if (onSetupComplete) {
      onSetupComplete();
    }
  };
  
  // Get the appropriate dialog title
  const getDialogTitle = () => {
    if (showSetup) return "Welcome to Offer Tracker";
    if (selectedOffer) return "Offer Details";
    return "Quick Log Offer";
  };

  // Adjust dialog max width based on content
  const getDialogClass = () => {
    if (showSetup) return "sm:max-w-md md:max-w-lg p-6 pb-6 overflow-visible"; 
    if (selectedOffer) return "sm:max-w-md md:max-w-xl";
    return "sm:max-w-md p-0 overflow-hidden";
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={getDialogClass()}>
        {showSetup ? (
          <FirstTimeSetup onComplete={handleSetupComplete} />
        ) : selectedOffer ? (
          <OfferDetails offer={selectedOffer} onClose={handleClose} />
        ) : (
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-5 rounded-lg">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-medium">{getDialogTitle()}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Quickly add a new offer to your tracker.
              </DialogDescription>
            </DialogHeader>
            <OfferForm onSuccess={handleClose} className="pt-2" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
