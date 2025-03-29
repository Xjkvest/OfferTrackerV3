
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FirstTimeTooltipsProps {
  onDismiss: () => void;
}

export function FirstTimeTooltips({ onDismiss }: FirstTimeTooltipsProps) {
  const [currentTip, setCurrentTip] = useState(0);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);

  const tips = [
    {
      selector: "[data-tutorial='dashboard-preferences']",
      content: "Click here to customize your dashboard, add or remove sections, and change their order.",
      position: "bottom-left"
    },
    {
      selector: "[data-tutorial='recent-offer']",
      content: "Click on an offer to view details. Use the action buttons to quickly update CSAT, conversion status, or set follow-up dates.",
      position: "top-right"
    },
    {
      selector: "[data-tutorial='followup-item']",
      content: "Click on a follow-up to view the offer details. Mark follow-ups as completed when done.",
      position: "top-left"
    },
    {
      selector: "[data-tutorial='urgent-followup']",
      content: "Your most urgent follow-up is displayed here for quick access.",
      position: "bottom-right"
    }
  ];

  useEffect(() => {
    // Find the element for the current tip
    const element = document.querySelector(tips[currentTip].selector) as HTMLElement;
    if (element) {
      setActiveElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTip]);

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(prev => prev + 1);
    } else {
      onDismiss();
    }
  };

  const handlePrev = () => {
    if (currentTip > 0) {
      setCurrentTip(prev => prev - 1);
    }
  };

  const getTooltipPosition = (position: string, element: HTMLElement | null) => {
    if (!element) return {};
    
    const rect = element.getBoundingClientRect();
    
    switch (position) {
      case "top-left":
        return { 
          top: `${rect.top - 10}px`, 
          left: `${rect.left}px`,
          transform: 'translateY(-100%)' 
        };
      case "top-right":
        return { 
          top: `${rect.top - 10}px`, 
          left: `${rect.right - 320}px`,
          transform: 'translateY(-100%)' 
        };
      case "bottom-left":
        return { 
          top: `${rect.bottom + 10}px`, 
          left: `${rect.left}px` 
        };
      case "bottom-right":
      default:
        return { 
          top: `${rect.bottom + 10}px`, 
          left: `${rect.right - 320}px` 
        };
    }
  };

  return (
    <AnimatePresence>
      {activeElement && (
        <>
          {/* Highlight overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 pointer-events-none"
            style={{
              maskImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='black'/%3E%3Crect x='${activeElement.getBoundingClientRect().left}' y='${activeElement.getBoundingClientRect().top}' width='${activeElement.offsetWidth}' height='${activeElement.offsetHeight}' fill='white'/%3E%3C/svg%3E")`,
              WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='black'/%3E%3Crect x='${activeElement.getBoundingClientRect().left}' y='${activeElement.getBoundingClientRect().top}' width='${activeElement.offsetWidth}' height='${activeElement.offsetHeight}' fill='white'/%3E%3C/svg%3E")`
            }}
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-4 w-80"
            style={getTooltipPosition(tips[currentTip].position, activeElement)}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6 rounded-full" 
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="text-sm mb-4 mt-1">{tips[currentTip].content}</div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {currentTip + 1} of {tips.length}
              </div>
              <div className="flex gap-2">
                {currentTip > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrev}>
                    Previous
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentTip < tips.length - 1 ? 'Next' : 'Got it!'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
