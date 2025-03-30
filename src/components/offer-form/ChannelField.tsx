import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OfferFormValues } from "@/hooks/useOfferForm";
import { useUser } from "@/context/UserContext";

interface ChannelFieldProps {
  form: UseFormReturn<OfferFormValues>;
}

export function ChannelField({ form }: ChannelFieldProps) {
  const { channels } = useUser();
  
  return (
    <FormField
      control={form.control}
      name="channel"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1 text-muted-foreground" />
            Channel
          </FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {channels.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel}
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
