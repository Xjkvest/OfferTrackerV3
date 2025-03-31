import React, { useState, useEffect, useCallback, useRef } from "react";
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
  offerId?: string;
  onSetupComplete?: () => void;
}

// Create a singleton dialog manager with enhanced functionality
const dialogManager = {
  activeDialog: null as string | null,
  listeners: new Set<(offerId: string | null) => void>(),
  
  // Main dialog instance reference (set by the main OfferDialog component)
  mainDialogInstance: null as ((offerId: string) => void) | null,
  
  subscribe(listener: (offerId: string | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  setActiveDialog(offerId: string | null) {
    this.activeDialog = offerId;
    
    // If we have a specific offerId and a main dialog instance is registered,
    // directly call that instance to open the dialog
    if (offerId && this.mainDialogInstance) {
      this.mainDialogInstance(offerId);
    }
    
    // Still notify other listeners
    this.listeners.forEach(listener => listener(offerId));
  },
  
  getActiveDialog() {
    return this.activeDialog;
  },
  
  // Register the main dialog instance that should handle opening offers
  registerMainDialog(handler: (offerId: string) => void) {
    this.mainDialogInstance = handler;
    return () => {
      if (this.mainDialogInstance === handler) {
        this.mainDialogInstance = null;
      }
    };
  }
};

export function OfferDialog({ open, onOpenChange, offerId, onSetupComplete }: OfferDialogProps) {
  const { userName } = useUser();
  const { offers } = useOffers();
  const [showSetup, setShowSetup] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<typeof offers[number] | null>(null);
  
  // Check if setup is needed
  useEffect(() => {
    setShowSetup(!userName);
  }, [userName]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    onOpenChange(false);
    setSelectedOffer(null);
    // Always clear the active dialog when closing
    dialogManager.setActiveDialog(null);
  }, [onOpenChange]);
  
  // Handle setup completion
  const handleSetupComplete = useCallback(() => {
    setShowSetup(false);
    if (onSetupComplete) {
      onSetupComplete();
    }
  }, [onSetupComplete]);

  // Register this component as the main dialog handler
  useEffect(() => {
    // Create a handler function that opens a specific offer
    const handleOpenOffer = (offerId: string) => {
      const offer = offers.find(o => o.id === offerId);
      if (offer) {
        setSelectedOffer(offer);
        onOpenChange(true);
      }
    };
    
    // Register this component as the main dialog handler
    const unregister = dialogManager.registerMainDialog(handleOpenOffer);
    
    return unregister;
  }, [offers, onOpenChange]);

  // Keep selected offer updated with the latest data
  useEffect(() => {
    if (selectedOffer) {
      const updatedOffer = offers.find(o => o.id === selectedOffer.id);
      if (updatedOffer && JSON.stringify(updatedOffer) !== JSON.stringify(selectedOffer)) {
        setSelectedOffer(updatedOffer);
      }
    }
  }, [offers, selectedOffer]);

  // Handle offerId prop changes
  useEffect(() => {
    if (offerId && open) {
      const offer = offers.find(o => o.id === offerId);
      if (offer) {
        setSelectedOffer(offer);
        // Don't set active dialog here to prevent reopening loop
      }
    } else if (!open) {
      setSelectedOffer(null);
    }
  }, [offerId, offers, open]);
  
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
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          {showSetup ? (
            <>
              <DialogDescription>
                Set up your profile and preferences to get started.
              </DialogDescription>
              <FirstTimeSetup onComplete={handleSetupComplete} />
            </>
          ) : selectedOffer ? (
            <>
              <DialogDescription>
                View and manage details for this offer
              </DialogDescription>
              <OfferDetails offer={selectedOffer} onClose={handleClose} />
            </>
          ) : (
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-5 rounded-lg">
              <DialogDescription className="text-sm text-muted-foreground">
                Quickly add a new offer to your tracker.
              </DialogDescription>
              <OfferForm onSuccess={handleClose} className="pt-2" />
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

// Export the dialog manager for use in other components
export { dialogManager };
