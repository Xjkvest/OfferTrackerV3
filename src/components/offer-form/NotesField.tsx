
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OfferFormValues } from "@/hooks/useOfferForm";

interface NotesFieldProps {
  form: UseFormReturn<OfferFormValues>;
}

export function NotesField({ form }: NotesFieldProps) {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1 text-muted-foreground" />
            Notes (Optional)
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Add any relevant details about this offer"
              className="resize-none h-20"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
