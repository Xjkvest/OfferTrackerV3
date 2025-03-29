import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckIcon, PlaneIcon, Send } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isSuccess: boolean;
  offerId?: string;
}

export function SubmitButton({ isSubmitting, isSuccess, offerId }: SubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={isSubmitting || isSuccess}
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
