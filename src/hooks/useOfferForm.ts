
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOffers } from "@/context/OfferContext";
import { toast } from "@/hooks/use-toast";

// Define form schema with Zod - updated to include conversionDate
export const offerFormSchema = z.object({
  caseNumber: z.string().min(1, { message: "Case number is required" }),
  channel: z.string().min(1, { message: "Channel is required" }),
  offerType: z.string().min(1, { message: "Offer type is required" }),
  notes: z.string().optional(),
  followupDate: z.string().optional(),
  conversionDate: z.string().optional(),
});

export type OfferFormValues = z.infer<typeof offerFormSchema>;

interface UseOfferFormProps {
  onSuccess?: () => void;
  initialValues?: Partial<OfferFormValues & { csat?: 'positive' | 'neutral' | 'negative' | undefined; converted?: boolean }>;
  offerId?: string;
}

export function useOfferForm({ onSuccess, initialValues, offerId }: UseOfferFormProps) {
  const { addOffer, updateOffer, offers } = useOffers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Initialize form with react-hook-form
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      caseNumber: initialValues?.caseNumber || "",
      channel: initialValues?.channel || "",
      offerType: initialValues?.offerType || "",
      notes: initialValues?.notes || "",
      followupDate: initialValues?.followupDate || undefined,
      conversionDate: initialValues?.conversionDate || undefined,
    },
  });

  const checkForDuplicates = (caseNumber: string): boolean => {
    if (!offerId) {
      // Only check for duplicates when creating a new offer
      return offers.some(offer => offer.caseNumber === caseNumber);
    } else {
      // When editing, check if there's another offer (not this one) with the same case number
      return offers.some(offer => offer.caseNumber === caseNumber && offer.id !== offerId);
    }
  };

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);
    
    // Check for duplicate case numbers
    const isDuplicate = checkForDuplicates(data.caseNumber);
    if (isDuplicate) {
      toast({
        title: "Duplicate Case Number",
        description: "This case number already exists in your records.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate a slight delay for a better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      if (offerId) {
        // Update existing offer
        const updates: Partial<OfferFormValues & { csat?: 'positive' | 'neutral' | 'negative' | undefined; converted?: boolean }> = {
          ...data,
          csat: initialValues?.csat,
        };
        
        // Set converted based on conversionDate
        if (data.conversionDate) {
          updates.converted = true;
        } else if (initialValues?.converted) {
          // Only set to false if it was explicitly marked as converted before
          // and now the date is removed
          updates.converted = false;
        }
        
        updateOffer(offerId, updates);
      } else {
        // Add new offer - ensure required fields are present
        const newOffer: any = {
          caseNumber: data.caseNumber,
          channel: data.channel,
          offerType: data.offerType,
          notes: data.notes || "",
          followupDate: data.followupDate,
          csat: undefined,
          converted: false, // Default new offers to not converted
        };
        
        // Handle conversion date if provided
        if (data.conversionDate) {
          newOffer.conversionDate = data.conversionDate;
          newOffer.converted = true;
        }
        
        addOffer(newOffer);
      }
      
      setIsSuccess(true);
      
      // Reset form if it's a new offer
      if (!offerId) {
        form.reset({
          caseNumber: "",
          channel: "",
          offerType: "",
          notes: "",
          followupDate: undefined,
          conversionDate: undefined,
        });
      }
      
      // Show success state briefly
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your offer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    isSuccess,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
