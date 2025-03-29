
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarClock, X, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { OfferFormValues } from "@/hooks/useOfferForm";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";

interface FollowupDateFieldProps {
  form: UseFormReturn<OfferFormValues>;
}

export function FollowupDateField({ form }: FollowupDateFieldProps) {
  const { settings } = useUser();
  const [open, setOpen] = useState(false);
  const [followupTime, setFollowupTime] = useState<string>(() => {
    // Default to 9:00 AM or current time
    if (form.getValues('followupDate')) {
      const d = new Date();
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return "09:00";
  });

  const handleSaveDateTime = () => {
    const dateValue = form.getValues('followupDate');
    if (dateValue) {
      // Parse the date string to a Date object
      const date = new Date(dateValue);
      // Add the time component
      const [hours, minutes] = followupTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      // Update the form value with the new date including time
      form.setValue('followupDate', date.toISOString().split('T')[0]);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.setValue('followupDate', undefined);
  };
  
  // Add a default follow-up date based on settings
  const setDefaultFollowup = () => {
    const today = new Date();
    let daysToAdd = 3; // Default to 3 days
    
    // Use the user's preferred follow-up time setting
    switch (settings.defaultFollowupTime) {
      case "24":
        daysToAdd = 1;
        break;
      case "48":
        daysToAdd = 2;
        break;
      case "72": 
        daysToAdd = 3;
        break;
      case "168":
        daysToAdd = 7;
        break;
    }
    
    // Set the default follow-up date
    const defaultDate = new Date(today);
    defaultDate.setDate(today.getDate() + daysToAdd);
    form.setValue('followupDate', defaultDate.toISOString().split('T')[0]);
  };

  return (
    <FormField
      control={form.control}
      name="followupDate"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-1 text-muted-foreground" />
            Follow-up Date (Optional)
          </FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    <span className="flex items-center justify-between w-full">
                      {format(new Date(field.value), "PPP")}
                      <X 
                        className="h-4 w-4 opacity-50 hover:opacity-100" 
                        onClick={handleClear}
                      />
                    </span>
                  ) : (
                    <span>Select follow-up date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={followupTime}
                    onChange={(e) => setFollowupTime(e.target.value)}
                    className="h-8"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={setDefaultFollowup}
                    className="ml-auto text-xs"
                  >
                    Default ({settings.defaultFollowupTime === "24" ? "1 day" : 
                              settings.defaultFollowupTime === "48" ? "2 days" : 
                              settings.defaultFollowupTime === "72" ? "3 days" : "1 week"})
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(date.toISOString().split('T')[0]);
                    } else {
                      field.onChange(undefined);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
                <div className="flex justify-end p-3 border-t border-border">
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={handleSaveDateTime}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
