import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ShoppingCart, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { OfferFormValues } from "@/hooks/useOfferForm";
import { toast } from "@/hooks/use-toast";

interface ConversionDateFieldProps {
  form: UseFormReturn<OfferFormValues>;
}

export function ConversionDateField({ form }: ConversionDateFieldProps) {
  const [open, setOpen] = useState(false);
  const [isConverted, setIsConverted] = useState(!!form.getValues('conversionDate'));
  
  // Update the conversion status when form value changes
  useEffect(() => {
    const conversionDate = form.getValues('conversionDate');
    setIsConverted(!!conversionDate);
  }, [form.getValues('conversionDate')]);

  const handleConversionToggle = (checked: boolean) => {
    setIsConverted(checked);
    if (checked) {
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      form.setValue('conversionDate', today);
      toast({
        title: "Marked as Converted",
        description: "Set the conversion date below",
      });
    } else {
      form.setValue('conversionDate', undefined);
      setOpen(false);
      toast({
        title: "Conversion Removed",
        description: "Offer marked as not converted",
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue('conversionDate', date.toISOString().split('T')[0]);
      toast({
        title: "Conversion Date Set",
        description: `Conversion date set to ${format(date, "PPP")}`,
      });
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.setValue('conversionDate', undefined);
    setIsConverted(false);
    toast({
      title: "Conversion Date Cleared",
      description: "Offer marked as not converted",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="flex items-center">
          <ShoppingCart className="h-4 w-4 mr-1 text-muted-foreground" />
          Conversion Status
        </FormLabel>
        <div className="flex items-center gap-2">
          <Switch
            checked={isConverted}
            onCheckedChange={handleConversionToggle}
          />
          <span className="text-sm text-muted-foreground">
            {isConverted ? "Converted" : "Not Converted"}
          </span>
        </div>
      </div>

      {isConverted && (
        <FormField
          control={form.control}
          name="conversionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Conversion Date</FormLabel>
              <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP") : "Select conversion date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={handleDateSelect}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {field.value && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleClear}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
