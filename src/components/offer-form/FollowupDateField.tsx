import React, { useState, useEffect } from "react";
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
import { toast } from "@/hooks/use-toast";
import { toISODateString, combineDateAndTime } from "@/utils/dateUtils";

interface FollowupDateFieldProps {
  form: UseFormReturn<OfferFormValues>;
}

export function FollowupDateField({ form }: FollowupDateFieldProps) {
  const { settings } = useUser();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    form.getValues('followupDate') ? new Date(form.getValues('followupDate')) : undefined
  );
  const [followupTime, setFollowupTime] = useState<string>(() => {
    // Default to 9:00 AM or current time
    if (form.getValues('followupDate')) {
      const d = new Date();
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return "09:00";
  });

  // Update the selectedDate when the form value changes
  useEffect(() => {
    const followupDate = form.getValues('followupDate');
    if (followupDate) {
      setSelectedDate(new Date(followupDate));
    } else {
      setSelectedDate(undefined);
    }
  }, [form.getValues('followupDate')]);

  const handleSaveDateTime = () => {
    if (selectedDate) {
      // Parse the date string to a Date object
      const date = new Date(selectedDate);
      // Add the time component
      const [hours, minutes] = followupTime.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      // Update the form value with the new date including time
      form.setValue('followupDate', toISODateString(date));
      
      toast({
        title: "Follow-up Scheduled",
        description: `Follow-up set for ${format(date, "PPP")} at ${followupTime}`,
      });
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.setValue('followupDate', undefined);
    setSelectedDate(undefined);
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
    setSelectedDate(defaultDate);
    form.setValue('followupDate', toISODateString(defaultDate));
  };

  // Handle direct calendar selection
  const handleCalendarSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Combine the selected date with the time from the input
      const combined = combineDateAndTime(date, followupTime);
      form.setValue('followupDate', toISODateString(combined));
    } else {
      form.setValue('followupDate', undefined);
    }
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
                  selected={selectedDate}
                  onSelect={handleCalendarSelect}
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
