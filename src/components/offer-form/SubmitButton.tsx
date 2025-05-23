import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckIcon, PlaneIcon, Send } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isSuccess: boolean;
  offerId?: string;
  onDirectSubmit?: () => Promise<void>;
}

export function SubmitButton({ isSubmitting, isSuccess, offerId, onDirectSubmit }: SubmitButtonProps) {
  // PWA compatibility: Add click handler for debugging and fallback submission
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Submit button clicked:', { isSubmitting, isSuccess, offerId });
    
    // Check if we're in a PWA environment
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://');
    
    if (isPWA) {
      console.log('PWA button click detected');
      
      // Try the fallback direct submission first in PWA
      if (onDirectSubmit) {
        console.log('Using direct submit handler for PWA');
        e.preventDefault();
        await onDirectSubmit();
        return;
      }
      
      // If no direct submit handler, try to trigger form submission
      const form = e.currentTarget.closest('form');
      if (form) {
        console.log('Attempting to submit form from button click');
        // Create a synthetic submit event
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
    
    // Don't prevent default - let the form handle submission naturally too
  };

  return (
    <Button 
      type="submit" 
      disabled={isSubmitting || isSuccess}
      onClick={handleClick}
      className="relative w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
    >
      <span className={`flex items-center gap-2 ${isSubmitting || isSuccess ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {offerId ? 'Update Offer' : 'Save Offer'} <Send className="h-3.5 w-3.5 inline" />
      </span>
      
      {isSubmitting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      
      {isSuccess && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckIcon className="h-4 w-4" />
        </div>
      )}
    </Button>
  );
}
