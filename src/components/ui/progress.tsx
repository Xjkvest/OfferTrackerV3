
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Get color based on percentage
  const getColorClass = () => {
    const percentage = value || 0;
    if (percentage <= 25) return "bg-amber-400";
    if (percentage <= 50) return "bg-amber-500";
    if (percentage <= 75) return "bg-emerald-400";
    if (percentage <= 100) return "bg-emerald-500";
    if (percentage <= 150) return "bg-blue-400";
    if (percentage <= 200) return "bg-blue-500";
    return "bg-purple-500";
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary/50",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all", getColorClass())}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
