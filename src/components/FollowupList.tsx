
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOffers, Offer } from "@/context/OfferContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, ChevronDown, ChevronUp, CheckCircle, ArrowRight, Eye, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FollowupItem } from "./FollowupItem";
import { formatFollowupDate } from "@/utils/dateUtils";
import { CaseLink } from "./CaseLink";

interface FollowupListProps {
  onOfferClick?: (offerId: string) => void;
}

export function FollowupList({ onOfferClick }: FollowupListProps) {
  const { offers, updateOffer } = useOffers();
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [followupTime, setFollowupTime] = useState<Record<string, string>>({});
  const [popoverOpen, setPopoverOpen] = useState<Record<string, boolean>>({});
  
  const followups = offers.filter(o => o.followupDate).sort((a, b) => {
    return new Date(a.followupDate!).getTime() - new Date(b.followupDate!).getTime();
  });
  
  const todaysFollowups = followups.filter(o => o.followupDate === today);
  
  const overdueFollowups = followups.filter(o => {
    return o.followupDate! < today;
  });
  
  const upcomingFollowups = followups.filter(o => {
    return o.followupDate! > today;
  });
  
  const allFollowups = [...todaysFollowups, ...overdueFollowups, ...upcomingFollowups];
  const totalCount = allFollowups.length;
  const urgentCount = todaysFollowups.length + overdueFollowups.length;

  const mostUrgentFollowup = overdueFollowups[0] || todaysFollowups[0] || upcomingFollowups[0];
  const isOverdue = mostUrgentFollowup && mostUrgentFollowup.followupDate! < today;
  
  const handleMarkAsCompleted = (offer: Offer, e: React.MouseEvent) => {
    e.stopPropagation();
    updateOffer(offer.id, { followupDate: undefined });
    toast({
      title: "Follow-up Completed",
      description: `Follow-up for Case #${offer.caseNumber} has been marked as completed.`,
    });
  };

  const handleOfferClick = (offer: Offer) => {
    if (onOfferClick) {
      onOfferClick(offer.id);
    }
  };

  const handleFollowupDateChange = (offerId: string, date: Date | undefined) => {
    if (date) {
      const currentOffer = offers.find(o => o.id === offerId);
      if (currentOffer) {
        updateOffer(offerId, {
          followupDate: date.toISOString().split('T')[0]
        });
      }
    }
  };

  const handleSaveDateTime = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer && offer.followupDate) {
      const timeString = followupTime[offerId] || new Date().toTimeString().substring(0, 5);
      const [hours, minutes] = timeString.split(':').map(Number);
      
      const date = new Date(offer.followupDate);
      date.setHours(hours);
      date.setMinutes(minutes);
      
      updateOffer(offerId, {
        followupDate: date.toISOString().split('T')[0]
      });

      toast({
        title: "Follow-up Date Set",
        description: `Follow-up scheduled for ${format(date, "PPP")} at ${timeString}`,
      });
    }
    
    setPopoverOpen({...popoverOpen, [offerId]: false});
  };

  const handleTimeChange = (offerId: string, time: string) => {
    setFollowupTime(prev => ({ ...prev, [offerId]: time }));
  };
  
  if (totalCount === 0) return null;
  
  return (
    <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-indigo-500/5 shadow-sm hover:shadow-md transition-all">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center flex-1 min-w-0 overflow-hidden">
            {overdueFollowups.length > 0 ? (
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0" />
            ) : (
              <CalendarClock className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
            )}
            <CardTitle className="text-lg font-medium mr-2 flex-shrink-0">Follow-ups</CardTitle>
            
            {overdueFollowups.length > 0 && (
              <Badge className="mr-2 bg-red-500 hover:bg-red-600 flex-shrink-0">
                {overdueFollowups.length} overdue
              </Badge>
            )}
            
            {todaysFollowups.length > 0 && (
              <Badge className="mr-2 bg-amber-500 hover:bg-amber-600 flex-shrink-0">
                {todaysFollowups.length} today
              </Badge>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="ml-auto bg-secondary/20 hover:bg-secondary/40 flex-shrink-0"
            >
              {isOpen ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
          </CollapsibleTrigger>
        </div>

        {!isOpen && mostUrgentFollowup && (
          <div className="px-4 pb-3">
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-md ${
              isOverdue ? 'bg-red-500/10' : 'bg-secondary/10'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <span className="font-medium">{mostUrgentFollowup.offerType}</span>
                  <span className="text-xs ml-1 whitespace-nowrap">
                    (<CaseLink caseNumber={mostUrgentFollowup.caseNumber} showHash={false} />)
                  </span>
                </div>
                <div className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {isOverdue 
                    ? `Follow-up was due on ${formatFollowupDate(mostUrgentFollowup.followupDate!)}`
                    : `Follow-up scheduled for ${formatFollowupDate(mostUrgentFollowup.followupDate!)}`
                  }
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleOfferClick(mostUrgentFollowup)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Offer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                        onClick={(e) => handleMarkAsCompleted(mostUrgentFollowup, e)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Mark as Completed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  {/* Overdue followups section - prioritized to top */}
                  {overdueFollowups.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold flex items-center text-red-500">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Overdue
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {overdueFollowups.map((offer) => (
                          <FollowupItem 
                            key={offer.id} 
                            offer={offer} 
                            onComplete={(e) => handleMarkAsCompleted(offer, e)} 
                            onClick={() => handleOfferClick(offer)}
                            isUrgent 
                            onTimeChange={(time) => handleTimeChange(offer.id, time)}
                            onDateChange={(date) => handleFollowupDateChange(offer.id, date)}
                            onSaveDateTime={() => handleSaveDateTime(offer.id)}
                            timeValue={followupTime[offer.id]}
                            isPopoverOpen={popoverOpen[offer.id] || false}
                            onPopoverOpenChange={(open) => setPopoverOpen({...popoverOpen, [offer.id]: open})}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {todaysFollowups.length > 0 && (
                    <div className="space-y-2">
                      {overdueFollowups.length > 0 && <Separator />}
                      <h3 className="text-sm font-semibold flex items-center text-amber-500">
                        <CalendarClock className="h-3.5 w-3.5 mr-1" /> Today
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {todaysFollowups.map((offer) => (
                          <FollowupItem 
                            key={offer.id} 
                            offer={offer} 
                            onComplete={(e) => handleMarkAsCompleted(offer, e)} 
                            onClick={() => handleOfferClick(offer)}
                            isUrgent 
                            onTimeChange={(time) => handleTimeChange(offer.id, time)}
                            onDateChange={(date) => handleFollowupDateChange(offer.id, date)}
                            onSaveDateTime={() => handleSaveDateTime(offer.id)}
                            timeValue={followupTime[offer.id]}
                            isPopoverOpen={popoverOpen[offer.id] || false}
                            onPopoverOpenChange={(open) => setPopoverOpen({...popoverOpen, [offer.id]: open})}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {upcomingFollowups.length > 0 && (
                    <div className="space-y-2">
                      {(todaysFollowups.length > 0 || overdueFollowups.length > 0) && <Separator />}
                      <h3 className="text-sm font-semibold flex items-center text-blue-500">
                        <ArrowRight className="h-3.5 w-3.5 mr-1" /> Upcoming
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {upcomingFollowups.slice(0, 4).map((offer) => (
                          <FollowupItem 
                            key={offer.id} 
                            offer={offer} 
                            onComplete={(e) => handleMarkAsCompleted(offer, e)}
                            onClick={() => handleOfferClick(offer)}
                            onTimeChange={(time) => handleTimeChange(offer.id, time)}
                            onDateChange={(date) => handleFollowupDateChange(offer.id, date)}
                            onSaveDateTime={() => handleSaveDateTime(offer.id)}
                            timeValue={followupTime[offer.id]}
                            isPopoverOpen={popoverOpen[offer.id] || false}
                            onPopoverOpenChange={(open) => setPopoverOpen({...popoverOpen, [offer.id]: open})}
                          />
                        ))}
                      </div>
                      {upcomingFollowups.length > 4 && (
                        <div className="text-xs text-center text-muted-foreground pt-1">
                          +{upcomingFollowups.length - 4} more upcoming follow-ups
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
