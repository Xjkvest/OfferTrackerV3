import React, { useEffect, useRef } from "react";
import { useOfferForm, OfferFormValues } from "@/hooks/useOfferForm";
import { Form } from "@/components/ui/form";
import { motion } from "framer-motion";
import { CaseNumberField } from "./offer-form/CaseNumberField";
import { ChannelField } from "./offer-form/ChannelField";
import { OfferTypeField } from "./offer-form/OfferTypeField";
import { NotesField } from "./offer-form/NotesField";
import { FollowupDateField } from "./offer-form/FollowupDateField";
import { SubmitButton } from "./offer-form/SubmitButton";
import { DuplicateCaseDialog } from "./offer-form/DuplicateCaseDialog";

interface OfferFormProps {
  onSuccess?: () => void;
  initialValues?: Partial<OfferFormValues & { csat?: 'positive' | 'neutral' | 'negative' | undefined; converted?: boolean }>;
  offerId?: string;
  className?: string;
  compact?: boolean;
}

export function OfferForm({ onSuccess, initialValues, offerId, className, compact = false }: OfferFormProps) {
  const { 
    form, 
    isSubmitting, 
    isSuccess, 
    onSubmit,
    showDuplicateDialog,
    existingOffer,
    handleForceSave,
    handleEditExisting,
    setShowDuplicateDialog,
  } = useOfferForm({
    onSuccess,
    initialValues,
    offerId,
  });

  // PWA fallback: Direct submission handler
  const handleDirectSubmit = async () => {
    console.log('Direct submit triggered as fallback');
    
    // Validate the form first
    const isValid = await form.trigger();
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }
    
    // Get form data and submit directly
    const formData = form.getValues();
    console.log('Direct submit with data:', formData);
    
    // Create a mock event for the submission
    const mockEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(mockEvent, 'preventDefault', { value: () => {} });
    Object.defineProperty(mockEvent, 'stopPropagation', { value: () => {} });
    
    // Call the submission handler directly
    await onSubmit(mockEvent as any);
  };
  
  // Create a ref for the first input field to focus it on mount
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the first input field on component mount
  useEffect(() => {
    if (firstInputRef.current && !offerId) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [offerId]);

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: compact ? 0.05 : 0.08
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" }
    }
  };

  // Enhanced submit handler for PWA compatibility
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submission triggered - PWA compatible');
    
    // onSubmit is already form.handleSubmit(handleSubmitWithDuplicateCheck)
    // so we can call it directly with the event
    onSubmit(e);
  };

  return (
    <div className={`${compact ? 'max-w-full' : 'max-w-md mx-auto'} ${className || ''}`}>
      <Form {...form}>
        <motion.form 
          onSubmit={handleFormSubmit} 
          className="space-y-3"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          aria-labelledby="offer-form-title"
          aria-describedby="offer-form-description"
        >
          <div className="sr-only">
            <h2 id="offer-form-title">{offerId ? "Edit Offer" : "New Offer"}</h2>
            <p id="offer-form-description">
              {offerId ? "Edit your offer details" : "Enter your offer details"}
            </p>
          </div>
          
          <motion.div variants={itemVariants}>
            <CaseNumberField form={form} ref={firstInputRef} offerId={offerId} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChannelField form={form} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <OfferTypeField form={form} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <NotesField form={form} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FollowupDateField form={form} />
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className="pt-2 flex justify-end"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SubmitButton 
              isSubmitting={isSubmitting} 
              isSuccess={isSuccess} 
              offerId={offerId}
              onDirectSubmit={handleDirectSubmit}
            />
          </motion.div>
        </motion.form>
      </Form>

      <DuplicateCaseDialog
        isOpen={showDuplicateDialog}
        onClose={() => setShowDuplicateDialog(false)}
        onEditExisting={handleEditExisting}
        onForceSave={handleForceSave}
        existingOffer={existingOffer}
      />
    </div>
  );
}
