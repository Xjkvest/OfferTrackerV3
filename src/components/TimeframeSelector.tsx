
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TimeframeSelectorProps {
  timeframe: string;
  setTimeframe: (value: string) => void;
  className?: string;
}

export function TimeframeSelector({ timeframe, setTimeframe, className }: TimeframeSelectorProps) {
  return (
    <div className={cn("flex justify-end", className)}>
      <Tabs
        value={timeframe}
        onValueChange={setTimeframe}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1 w-full">
          <TabsTrigger
            value="week"
            className="px-3 py-1.5 text-xs whitespace-normal break-words"
          >
            Week
          </TabsTrigger>
          <TabsTrigger
            value="month"
            className="px-3 py-1.5 text-xs whitespace-normal break-words"
          >
            Month
          </TabsTrigger>
          <TabsTrigger
            value="quarter"
            className="px-3 py-1.5 text-xs whitespace-normal break-words"
          >
            Quarter
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="px-3 py-1.5 text-xs whitespace-normal break-words"
          >
            All-Time
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
