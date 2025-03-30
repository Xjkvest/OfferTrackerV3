import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OfferFormValues } from "@/hooks/useOfferForm";
import { useUser } from "@/context/UserContext";

interface OfferTypeFieldProps {
  form: UseFormReturn<OfferFormValues>;
}

export function OfferTypeField({ form }: OfferTypeFieldProps) {
  const { offerTypes } = useUser();
  
  return (
    <FormField
      control={form.control}
      name="offerType"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
            Offer Type
          </FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an offer type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {offerTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
