import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOffers } from "@/context/OfferContext";
import { toast } from "@/hooks/use-toast";
import { Offer } from "@/context/OfferContext";
import { dialogManager } from "@/components/OfferDialog";

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
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [existingOffer, setExistingOffer] = useState<Offer | null>(null);
  const [pendingData, setPendingData] = useState<OfferFormValues | null>(null);
  
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

  const findDuplicateOffer = (caseNumber: string): Offer | null => {
    if (!offerId) {
      // Only check for duplicates when creating a new offer
      return offers.find(offer => offer.caseNumber === caseNumber) || null;
    } else {
      // When editing, only check if case number has been changed from original
      const originalOffer = offers.find(offer => offer.id === offerId);
      if (originalOffer && originalOffer.caseNumber !== caseNumber) {
        // Check if another offer (not this one) has the same case number
        return offers.find(offer => offer.caseNumber === caseNumber && offer.id !== offerId) || null;
      }
      return null;
    }
  };

  const handleEditExisting = () => {
    if (existingOffer) {
      // Clear state before dispatching event to prevent multiple triggers
      setShowDuplicateDialog(false);
      setPendingData(null);

      // Use the dialog manager to notify about the edit
      dialogManager.setActiveDialog(existingOffer.id);
      
      // Trigger any onSuccess callback to close current form if needed
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
      
      // Clear existing offer after setting the active dialog
      setExistingOffer(null);
    }
  };

  const handleForceSave = async () => {
    if (pendingData) {
      await handleSubmit(pendingData);
      setPendingData(null);
    }
    setShowDuplicateDialog(false);
    setExistingOffer(null);
  };

  const handleSubmitWithDuplicateCheck = async (data: OfferFormValues) => {
    setIsSubmitting(true);
    
    // Check for duplicate case numbers
    const duplicate = findDuplicateOffer(data.caseNumber);
    if (duplicate) {
      setExistingOffer(duplicate);
      setPendingData(data);
      setShowDuplicateDialog(true);
      setIsSubmitting(false);
      return;
    }
    
    await handleSubmit(data);
  };

  const handleSubmit = async (data: OfferFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create an immutable copy of the form data
      const immutableData = JSON.parse(JSON.stringify(data));
      
      if (offerId) {
        // Handle update case
        const updates: Partial<OfferFormValues & { 
          csat?: 'positive' | 'neutral' | 'negative' | undefined; 
          converted?: boolean;
          csatComment?: string;
        }> = {
          ...immutableData,
        };
        
        // Preserve CSAT rating
        if (initialValues?.csat !== undefined) {
          updates.csat = initialValues.csat;
        }
        
        // Handle conversion status
        if (immutableData.conversionDate) {
          updates.converted = true;
        } else if (initialValues?.converted) {
          updates.converted = false;
        }

        // Preserve comments
        const existingOffer = offers.find(offer => offer.id === offerId);
        if (existingOffer?.csatComment) {
          updates.csatComment = existingOffer.csatComment;
        }
        
        // Update the offer
        await updateOffer(offerId, updates);
        
        // Reset form to show the updated values
        form.reset(immutableData);
      } else {
        // Handle create case
        const newOffer: any = {
          caseNumber: immutableData.caseNumber,
          channel: immutableData.channel,
          offerType: immutableData.offerType,
          notes: immutableData.notes || "",
          followupDate: immutableData.followupDate,
          csat: undefined,
          converted: false,
        };
        
        if (immutableData.conversionDate) {
          newOffer.conversionDate = immutableData.conversionDate;
          newOffer.converted = true;
        }
        
        await addOffer(newOffer);
        
        // Reset form to empty values
        form.reset({
          caseNumber: "",
          channel: "",
          offerType: "",
          notes: "",
          followupDate: undefined,
          conversionDate: undefined,
        });
      }
      
      // Show success state but briefly
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
      }, 300); 
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
    showDuplicateDialog,
    existingOffer,
    onSubmit: form.handleSubmit(handleSubmitWithDuplicateCheck),
    handleForceSave,
    handleEditExisting,
    setShowDuplicateDialog,
  };
}
