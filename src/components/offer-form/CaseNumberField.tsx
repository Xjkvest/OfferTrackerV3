import React, { forwardRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ClipboardList } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OfferFormValues } from "@/hooks/useOfferForm";

interface CaseNumberFieldProps {
  form: UseFormReturn<OfferFormValues>;
}

export const CaseNumberField = forwardRef<HTMLInputElement, CaseNumberFieldProps>(
  ({ form }, ref) => {
    return (
      <FormField
        control={form.control}
        name="caseNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-1 text-muted-foreground" />
              Case Number
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter case number" {...field} ref={ref} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);
