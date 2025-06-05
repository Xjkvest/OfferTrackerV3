import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle, AlertTriangle, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Offer, FollowupItem as FollowupItemType } from "@/context/OfferContext";
import { getTodayDateString } from "@/utils/dateUtils";
import { CaseLink } from "./CaseLink";
import { Badge } from "@/components/ui/badge";

interface FollowupItemProps {
  offer: Offer;
  followup: FollowupItemType | null;
  onComplete: (e: React.MouseEvent) => void;
  onClick: () => void;
  isUrgent?: boolean;
  isOverdue?: boolean;
  onAddNewFollowup: () => void;
}

export function FollowupItem({ 
  offer, 
  followup, 
  onComplete, 
  onClick, 
  isUrgent,
  isOverdue,
  onAddNewFollowup
}: FollowupItemProps) {
  const today = getTodayDateString();
  
  // If we don't have a followup, try to use the legacy format
  const followupDate = followup?.date || offer.followupDate || '';
  const isActuallyOverdue = isOverdue || (followupDate && followupDate < today);
  
  // Only check if THIS specific followup is completed, not any followup in the offer
  const isCompleted = followup?.completed === true || !!followup?.completedAt;
  
  return (
    <div 
      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-md ${
        isCompleted ? 'bg-green-500/5 hover:bg-green-500/10' :
        isActuallyOverdue ? 'bg-red-500/10 hover:bg-red-500/15' : 
        isUrgent ? 'bg-amber-500/10 hover:bg-amber-500/15' : 
        'bg-secondary/20 hover:bg-secondary/30'
      } transition-colors cursor-pointer relative`}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Main content */}
        <div className="flex items-center justify-between">
          {/* Left side - Type and Case */}
          <div className="font-medium flex items-center text-sm truncate">
            {offer.offerType}
            <span className="ml-1 text-xs text-muted-foreground inline-flex items-center whitespace-nowrap">
              (<CaseLink caseNumber={offer.caseNumber} showHash={false} iconSize={2} />)
            </span>
          </div>
          
          {/* Status badge */}
          {isCompleted ? (
            <Badge variant="outline" className="shrink-0 bg-green-500/10 text-green-600 border-green-500/20 text-[9px] h-4 px-1">
              <CheckCircle className="h-2 w-2 mr-0.5" />
              Completed
            </Badge>
          ) : isActuallyOverdue ? (
            <Badge variant="outline" className="shrink-0 bg-red-500/10 text-red-600 border-red-500/20 text-[9px] h-4 px-1">
              <AlertTriangle className="h-2 w-2 mr-0.5" />
              Overdue
            </Badge>
          ) : null}
        </div>
        
        {/* Date and channel info */}
        <div className="text-xs text-muted-foreground flex items-center mt-0.5">
          <CalendarClock className="mr-1 h-3 w-3 shrink-0" />
          <span className={isActuallyOverdue && !isCompleted ? "text-red-500" : ""}>
            {followupDate ? format(new Date(followupDate), "MMM d") : "No date"}
          </span>
          {/* Show total follow-up count if there are multiple active ones */}
          {offer.followups && offer.followups.filter(f => !f.completed).length > 1 && (
            <span className="mx-1 text-blue-500 text-[10px] bg-blue-100 dark:bg-blue-900/30 px-1 rounded">
              +{offer.followups.filter(f => !f.completed).length - 1} more
            </span>
          )}
          <span className="mx-1">•</span>
          {offer.channel}
          
          {followup?.completedAt && (
            <>
              <span className="mx-1">•</span>
              <span className="text-green-500 flex items-center">
                <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                {format(new Date(followup.completedAt), "MMM d")}
              </span>
            </>
          )}
        </div>
        
        {/* Notes (if any) */}
        {(followup?.notes || offer.notes) && (
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 break-words">
            {followup?.notes || offer.notes}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex shrink-0 items-center ml-2">
        {/* Only show Mark as Completed button if not completed */}
        {!isCompleted && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 rounded-full hover:bg-green-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(e);
                  }}
                >
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark as completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-6 w-6 rounded-full hover:bg-blue-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNewFollowup();
                }}
              >
                <PlusCircle className="h-3 w-3 text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Schedule new follow-up</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
