import React, { useEffect } from "react";
import { useOfferForm, OfferFormValues } from "@/hooks/useOfferForm";
import { Form } from "@/components/ui/form";
import { motion } from "framer-motion";
import { CaseNumberField } from "./offer-form/CaseNumberField";
import { ChannelField } from "./offer-form/ChannelField";
import { OfferTypeField } from "./offer-form/OfferTypeField";
import { NotesField } from "./offer-form/NotesField";
import { FollowupDateField } from "./offer-form/FollowupDateField";
import { SubmitButton } from "./offer-form/SubmitButton";
import { useRef } from "react";

interface OfferFormProps {
  onSuccess?: () => void;
  initialValues?: Partial<OfferFormValues & { csat?: 'positive' | 'neutral' | 'negative' | undefined; converted?: boolean }>;
  offerId?: string;
  className?: string;
  compact?: boolean;
}

export function OfferForm({ onSuccess, initialValues, offerId, className, compact = false }: OfferFormProps) {
  const { form, isSubmitting, isSuccess, onSubmit } = useOfferForm({
    onSuccess,
    initialValues,
    offerId,
  });
  
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

  return (
    <div className={`${compact ? 'max-w-full' : 'max-w-md mx-auto'} ${className || ''}`}>
      <Form {...form}>
        <motion.form 
          onSubmit={onSubmit} 
          className="space-y-3"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <CaseNumberField form={form} ref={firstInputRef} />
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
            />
          </motion.div>
        </motion.form>
      </Form>
    </div>
  );
}
