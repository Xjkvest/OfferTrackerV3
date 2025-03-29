import React from 'react';
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  className,
}) => {
  const [startDate, setStartDate] = React.useState<string>(
    dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""
  );
  const [endDate, setEndDate] = React.useState<string>(
    dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""
  );

  // Update local state when prop changes
  React.useEffect(() => {
    if (dateRange?.from) {
      setStartDate(format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange?.to) {
      setEndDate(format(dateRange.to, "yyyy-MM-dd"));
    }
  }, [dateRange]);

  const handleDateInputChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      if (value && endDate) {
        onDateRangeChange({
          from: new Date(value),
          to: new Date(endDate)
        });
      }
    } else {
      setEndDate(value);
      if (value && startDate) {
        onDateRangeChange({
          from: new Date(startDate),
          to: new Date(value)
        });
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => handleDateInputChange('start', e.target.value)}
          className="w-[140px] pr-8"
          placeholder="Start date"
        />
      </div>
      <span className="text-muted-foreground">to</span>
      <div className="relative">
        <Input
          type="date"
          value={endDate}
          onChange={(e) => handleDateInputChange('end', e.target.value)}
          className="w-[140px] pr-8"
          placeholder="End date"
        />
      </div>
    </div>
  );
}; 