
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Offer } from "@/context/OfferContext";
import { CaseLink } from "./CaseLink";

interface FollowupItemProps {
  offer: Offer;
  onComplete: (e: React.MouseEvent) => void;
  onClick: () => void;
  isUrgent?: boolean;
  isOverdue?: boolean;
  onTimeChange: (time: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onSaveDateTime: () => void;
  timeValue?: string;
  isPopoverOpen: boolean;
  onPopoverOpenChange: (open: boolean) => void;
}

export function FollowupItem({ 
  offer, 
  onComplete, 
  onClick, 
  isUrgent,
  isOverdue,
  onTimeChange,
  onDateChange,
  onSaveDateTime,
  timeValue,
  isPopoverOpen,
  onPopoverOpenChange
}: FollowupItemProps) {
  const defaultTime = timeValue || new Date().toTimeString().substring(0, 5);
  const today = new Date().toISOString().split('T')[0];
  
  // Determine if overdue based on date comparison
  const isActuallyOverdue = isOverdue || (offer.followupDate && offer.followupDate < today);
  
  return (
    <div 
      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-md ${
        isActuallyOverdue ? 'bg-red-500/10' : 
        isUrgent ? 'bg-amber-500/10' : 
        'bg-secondary/20'
      } hover:bg-secondary/40 transition-colors cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="font-medium flex items-center text-sm truncate">
          {offer.offerType}
          <span className="ml-1 text-xs text-muted-foreground inline-flex items-center whitespace-nowrap">
            (<CaseLink caseNumber={offer.caseNumber} showHash={false} iconSize={2} />)
          </span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center">
          {isActuallyOverdue ? (
            <AlertTriangle className="mr-1 h-3 w-3 text-red-500 shrink-0" />
          ) : (
            <CalendarClock className="mr-1 h-3 w-3 shrink-0" />
          )}
          <span className={isActuallyOverdue ? "text-red-500" : ""}>
            {format(new Date(offer.followupDate!), "MMM d")}
          </span>
          <span className="mx-1">•</span>
          {offer.channel}
        </div>
        {offer.notes && (
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 break-words">
            {offer.notes}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center ml-2">
        <Popover open={isPopoverOpen} onOpenChange={onPopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <CalendarClock className="h-3 w-3 text-blue-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end" onClick={(e) => e.stopPropagation()}>
            <div className="p-2 border-b border-border flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Set time:</span>
              <Input
                type="time"
                value={defaultTime}
                onChange={(e) => onTimeChange(e.target.value)}
                className="h-7 w-24"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <Calendar
              mode="single"
              selected={offer.followupDate ? new Date(offer.followupDate) : undefined}
              onSelect={onDateChange}
              initialFocus
            />
            <div className="flex justify-end p-2 border-t border-border">
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveDateTime();
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirm
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 rounded-full hover:bg-green-500/20"
                onClick={onComplete}
              >
                <CheckCircle className="h-3 w-3 text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark as completed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
