import React from "react";
import { Offer, useOffers } from "@/context/OfferContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, differenceInDays, parseISO, isToday, isBefore } from "date-fns";
import { CalendarClock, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Minus, Pencil, Trash, X, ShoppingCart, Calendar as CalendarIcon, Zap, Clock, MessageCircle, Mail, Phone, PhoneCall, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { OfferDetails } from "./OfferDetails";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CaseLink } from "./CaseLink";
import { getConversionLagInfo } from "@/utils/dateUtils";
import { useFollowupManager } from "@/hooks/useFollowupManager";
import { useNavigate } from "react-router-dom";

interface OfferItemProps {
  offer: Offer;
  onUpdate?: () => void;
  className?: string;
}

export const OfferItem = React.memo(({ offer, onUpdate, className = "" }: OfferItemProps) => {
  const { updateOffer, deleteOffer } = useOffers();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showConversionDate, setShowConversionDate] = React.useState(false);
  const navigate = useNavigate();
  const { addNewFollowup, hasActiveFollowup, getActiveFollowupDate, markFollowupAsCompleted, getFollowupStatus, isFollowupOverdue, isFollowupDueToday } = useFollowupManager();
  
  const date = new Date(offer.date);
  const formattedDate = format(date, "MMM d");
  const formattedTime = format(date, "h:mm a");
  
  // Conversion lag calculation
  const getConversionLag = () => {
    if (!offer.converted && offer.converted !== undefined) return null;
    
    const offerDate = new Date(offer.date);
    const today = new Date();
    
    // Set both dates to midnight for accurate day comparison
    offerDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const lagDays = differenceInDays(today, offerDate);
    
    if (offer.converted && offer.conversionDate) {
      const conversionDate = new Date(offer.conversionDate);
      conversionDate.setHours(0, 0, 0, 0);
      const conversionLagDays = differenceInDays(conversionDate, offerDate);
      
      if (conversionLagDays === 0) {
        return { text: "Same day", icon: <Zap className="h-3 w-3 text-amber-500" />, fast: true };
      } else if (conversionLagDays <= 3) {
        return { 
          text: `${conversionLagDays} day${conversionLagDays > 1 ? 's' : ''}`, 
          icon: <Zap className="h-3 w-3 text-amber-500" />, 
          fast: true 
        };
      } else if (conversionLagDays > 7) {
        return { text: `${conversionLagDays} days`, icon: <Clock className="h-3 w-3 text-blue-500" />, fast: false };
      } else {
        return { text: `${conversionLagDays} days`, icon: <Clock className="h-3 w-3 text-green-500" />, fast: false };
      }
    } else if (lagDays > 30) {
      return { text: "Over 30 days", icon: <Clock className="h-3 w-3 text-red-500" />, fast: false };
    } else {
      return { text: `${30 - lagDays} days left`, icon: <Clock className="h-3 w-3 text-blue-500" />, fast: false };
    }
  };
  
  const conversionLag = getConversionLag();
  
  const handleCsatChange = (csat: 'positive' | 'neutral' | 'negative') => {
    updateOffer(offer.id, { csat });
    toast({
      title: "CSAT Updated",
      description: `CSAT rating set to ${csat}`,
    });
    onUpdate?.();
  };
  
  const handleConversionChange = (converted: boolean) => {
    if (converted) {
      setShowConversionDate(true);
      updateOffer(offer.id, { 
        converted, 
        conversionDate: new Date().toISOString().split('T')[0]
      });
    } else {
      setShowConversionDate(false);
      updateOffer(offer.id, { 
        converted,
        conversionDate: undefined
      });
    }
    
    toast({
      title: "Conversion Updated",
      description: converted ? "Offer marked as converted" : "Offer marked as not converted",
    });
    onUpdate?.();
  };

  const handleConversionDateChange = (date: Date | undefined) => {
    if (date) {
      updateOffer(offer.id, { conversionDate: date.toISOString().split('T')[0] });
      onUpdate?.();
      toast({
        title: "Conversion Date Updated",
        description: `Conversion date set to ${format(date, "PPP")}`,
      });
    }
  };

  const handleFollowupDateChange = (date: Date | undefined) => {
    if (date) {
      // If setting a new followup date
      const dateString = date.toISOString().split('T')[0];
      
      // Create a new followup item
      const newFollowup = {
        id: `followup-${Date.now()}`,
        date: dateString,
        notes: offer.notes,
        completed: false
      };
      
      // Get existing followups or initialize empty array
      const existingFollowups = offer.followups || [];
      
      // Check if there are any active followups
      const hasActive = existingFollowups.some(f => !f.completed);
      
      if (hasActive) {
        // If there's already an active followup, show a warning toast
        toast({
          title: "Active followup exists",
          description: "This offer already has an active followup scheduled.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the offer with the new followup
      updateOffer(offer.id, { 
        followups: [...existingFollowups, newFollowup],
        followupDate: dateString // Keep legacy field in sync
      });
      
      onUpdate?.();
      toast({
        title: "Follow-up Scheduled",
        description: `Follow-up scheduled for ${format(date, "PPP")}`,
      });
    } else {
      // If clearing a followup date
      // Only clear if there are no completed followups
      if (!offer.followups?.some(f => f.completed)) {
        updateOffer(offer.id, { 
          followups: [],
          followupDate: undefined 
        });
        
        onUpdate?.();
        toast({
          title: "Follow-up Removed",
          description: "Follow-up date has been removed",
        });
      } else {
        // Don't allow clearing if there are completed followups
        toast({
          title: "Cannot remove followups",
          description: "This offer has completed followups that can't be removed.",
          variant: "destructive"
        });
      }
    }
  };

  // Get channel icon
  const getChannelIcon = () => {
    const channelLower = offer.channel.toLowerCase();
    if (channelLower.includes('chat')) return <MessageCircle className="h-3.5 w-3.5" />;
    if (channelLower.includes('email')) return <Mail className="h-3.5 w-3.5" />;
    if (channelLower.includes('phone') || channelLower.includes('call')) return <Phone className="h-3.5 w-3.5" />;
    return null;
  };

  // Card background color based on CSAT
  const getCardBgColor = () => {
    if (offer.csat === 'positive') return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800/30';
    if (offer.csat === 'neutral') return 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-800/30';
    if (offer.csat === 'negative') return 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-800/30';
    return '';
  };

  // Get followup status
  const followupStatus = getFollowupStatus(offer);
  
  // Format the date
  const displayDate = format(parseISO(offer.date), "MMM dd");
  
  // Get active followup date if any
  const activeFollowupDate = getActiveFollowupDate(offer);
  
  // State for UI interactions
  const [isHovering, setIsHovering] = React.useState(false);
  
  const offerStyles = {
    base: "flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 group",
    active: "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800",
    inactive: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-900",
    followupOverdue: "border-red-200 dark:border-red-900 shadow-sm",
    followupToday: "border-yellow-200 dark:border-yellow-900 shadow-sm",
    followupActive: "border-blue-200 dark:border-blue-900",
    followupCompleted: "border-green-200 dark:border-green-900 opacity-80",
    noFollowup: "border-gray-200 dark:border-gray-800",
  };
  
  // Determine the style based on followup status
  let borderStyle = offerStyles.noFollowup;
  
  switch (followupStatus) {
    case 'overdue':
      borderStyle = offerStyles.followupOverdue;
      break;
    case 'due-today':
      borderStyle = offerStyles.followupToday;
      break;
    case 'active':
      borderStyle = offerStyles.followupActive;
      break;
    case 'completed':
      borderStyle = offerStyles.followupCompleted;
      break;
    default:
      borderStyle = offerStyles.noFollowup;
  }
  
  // Handle followup actions
  const handleFollowupClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Mark the followup as completed
      const success = await markFollowupAsCompleted(offer.id, offer);
      
      if (success) {
        toast({
          title: "Follow-up Completed",
          description: "Follow-up has been marked as completed."
        });
      }
    } catch (error) {
      console.error("Error completing followup:", error);
      toast({
        title: "Error",
        description: "Failed to mark followup as completed.",
        variant: "destructive"
      });
    }
  };
  
  // Add a followup for today
  const handleAddFollowupForToday = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Add a new followup for today
      const success = await addNewFollowup(
        offer.id, 
        offer, 
        today, 
        "Follow-up added for today"
      );
      
      if (success) {
        toast({
          title: "Follow-up Scheduled",
          description: "Follow-up has been scheduled for today."
        });
      }
    } catch (error) {
      console.error("Error scheduling followup:", error);
      toast({
        title: "Error",
        description: "Failed to schedule followup for today.",
        variant: "destructive"
      });
    }
  };
  
  // View offer details
  const handleViewOffer = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/offer/${offer.id}`);
  };
  
  // Prepare followup info for display
  let followupLabel = "";
  let followupIcon = null;
  
  switch (followupStatus) {
    case 'overdue':
      followupLabel = "Overdue";
      followupIcon = <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      break;
    case 'due-today':
      followupLabel = "Due Today";
      followupIcon = <Clock className="h-3.5 w-3.5 text-yellow-500" />;
      break;
    case 'active':
      followupLabel = "Scheduled";
      followupIcon = <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />;
      break;
    case 'completed':
      followupLabel = "Completed";
      followupIcon = <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
      break;
  }
  
  // Format due date for display in decision timeframe
  const formatDueDate = () => {
    // Don't show due date for converted offers
    if (offer.converted) return null;

    const today = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(date.getDate() + 30);
    const formattedDueDate = format(dueDate, "MMM d");
    
    // Calculate days left until 30 days pass
    const daysLeft = 30 - differenceInDays(new Date(), date);
    
    if (daysLeft <= 0) {
      // Past due date
      return (
        <div className="flex items-center text-rose-500 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Decision Overdue</span>
        </div>
      );
    } else if (daysLeft <= 7) {
      // Due within a week
      return (
        <div className="flex items-center text-amber-500 dark:text-amber-400">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">
            {daysLeft === 1 ? "Due Tomorrow" : `Due in ${daysLeft} days`}
          </span>
        </div>
      );
    } else {
      // Due in more than a week
      return (
        <div className="flex items-center text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Due {formattedDueDate}</span>
        </div>
      );
    }
  };
  
  // Update the code that's calling isFollowupOverdue() and isFollowupDueToday() without arguments
  const shouldShowFollowupDialog = () => {
    return isFollowupOverdue(offer) || isFollowupDueToday(offer);
  };
  
  // Render the component
  return (
    <TooltipProvider>
      <Card className={`${offerStyles.base} ${isHovering ? offerStyles.active : offerStyles.inactive} ${borderStyle} ${className}`}>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2.5 flex-1 min-w-0">
              {/* Top Section */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate text-base">{offer.offerType}</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-2" onClick={() => setIsOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              {/* Info Section */}
              <div className="text-xs text-muted-foreground space-y-1.5">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="flex items-center gap-1">
                    <CaseLink caseNumber={offer.caseNumber} iconSize={3} />
                  </span>
                  
                  <span className="flex items-center gap-1">
                    {getChannelIcon()}
                    <span>{offer.channel}</span>
                  </span>
                  
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>{formattedDate} • {formattedTime}</span>
                  </span>
                </div>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {/* CSAT Badge */}
                  {offer.csat && (
                    <Badge className={`
                      text-xs font-normal
                      ${offer.csat === 'positive' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 
                       offer.csat === 'neutral' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 
                       'bg-rose-500/20 text-rose-600 dark:text-rose-400'}
                    `}>
                      {offer.csat === 'positive' ? (
                        <><ThumbsUp className="h-3 w-3 mr-1" /> Positive</>
                      ) : offer.csat === 'neutral' ? (
                        <><Minus className="h-3 w-3 mr-1" /> Neutral</>
                      ) : (
                        <><ThumbsDown className="h-3 w-3 mr-1" /> Negative</>
                      )}
                    </Badge>
                  )}
                  
                  {/* Conversion Badge */}
                  {offer.converted !== undefined && (
                    <Badge className={offer.converted 
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 text-xs font-normal"
                      : "bg-muted text-muted-foreground text-xs font-normal"
                    }>
                      {offer.converted ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Converted</span>
                          {conversionLag && (
                            <span className="ml-1 flex items-center">
                              {conversionLag.icon}
                              <span className="ml-0.5">{conversionLag.text}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <><X className="h-3 w-3 mr-1" />Not Converted</>
                      )}
                    </Badge>
                  )}
                  
                  {/* Follow-up Badge */}
                  {followupStatus !== 'none' && (
                    <Badge 
                      variant="outline" 
                      className="text-xs py-0 h-5 px-1.5 flex items-center gap-1"
                    >
                      {followupIcon}
                      <span>{followupLabel}</span>
                      {activeFollowupDate && followupStatus !== 'completed' && (
                        <span className="ml-1">
                          {format(parseISO(activeFollowupDate), "MMM d")}
                        </span>
                      )}
                    </Badge>
                  )}
                </div>
                
                {/* Notes Preview */}
                {offer.notes && (
                  <div className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-white/50 dark:bg-black/20 p-2 rounded border border-border/20">
                    {offer.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-1 mt-3">
            {/* CSAT Quick Actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`h-8 w-8 rounded-full ${
                    offer.csat === 'positive' ? 'bg-emerald-500/20 text-emerald-500' : 
                    'bg-secondary/50'
                  }`}
                  onClick={() => handleCsatChange('positive')}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Positive CSAT</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`h-8 w-8 rounded-full ${
                    offer.csat === 'negative' ? 'bg-rose-500/20 text-rose-500' : 
                    'bg-secondary/50'
                  }`}
                  onClick={() => handleCsatChange('negative')}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Negative CSAT</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Conversion Quick Toggle */}
            <Popover open={showConversionDate} onOpenChange={setShowConversionDate}>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${
                        offer.converted ? 'bg-blue-500/20 text-blue-500' : 
                        'bg-secondary/50'
                      }`}
                    >
                      {offer.converted ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <ShoppingCart className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  {offer.converted ? "Update conversion" : "Mark as converted"}
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={offer.conversionDate ? new Date(offer.conversionDate) : undefined}
                  disabled={(date) => {
                    const offerDate = new Date(offer.date);
                    offerDate.setHours(0, 0, 0, 0);
                    return date < offerDate;
                  }}
                  onSelect={(date: Date | null) => {
                    if (date) {
                      const offerDate = new Date(offer.date);
                      offerDate.setHours(0, 0, 0, 0);
                      const selectedDate = new Date(date);
                      selectedDate.setHours(0, 0, 0, 0);

                      if (selectedDate < offerDate) {
                        toast({
                          title: "Invalid Date",
                          description: "Cannot convert an offer before its creation date",
                          variant: "destructive",
                        });
                        return;
                      }

                      updateOffer(offer.id, { 
                        converted: true,
                        conversionDate: date.toISOString().split('T')[0] 
                      });
                      toast({
                        title: "Offer Converted",
                        description: `Conversion date set to ${format(date, "PPP")}`,
                      });
                    } else {
                      updateOffer(offer.id, { 
                        converted: false,
                        conversionDate: undefined 
                      });
                      toast({
                        title: "Conversion Removed",
                        description: "Offer marked as not converted",
                      });
                    }
                    setShowConversionDate(false);
                    onUpdate?.();
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Follow-up Quick Action */}
            <Popover>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`h-8 w-8 rounded-full ${
                        shouldShowFollowupDialog() ? 'bg-rose-500/20 text-rose-500' :
                        hasActiveFollowup(offer) ? 'bg-blue-500/20 text-blue-500' : 
                        offer.followups?.some(f => f.completed) ? 'bg-green-500/20 text-green-500' :
                        'bg-secondary/50'
                      }`}
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  {offer.followups?.some(f => f.completed) 
                    ? "View followup history" 
                    : hasActiveFollowup(offer) 
                      ? "Update followup date" 
                      : "Set followup date"}
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-2 border-b border-border">
                  <h3 className="text-sm font-medium flex items-center">
                    <CalendarClock className="h-3.5 w-3.5 mr-1 text-blue-500" />
                    {hasActiveFollowup(offer) ? "Update Followup" : "Schedule Followup"}
                  </h3>
                  {offer.followups?.some(f => f.completed) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      This offer has {offer.followups.filter(f => f.completed).length} completed followup(s)
                    </div>
                  )}
                </div>
                <CalendarComponent
                  mode="single"
                  selected={getActiveFollowupDate(offer) ? new Date(getActiveFollowupDate(offer)!) : undefined}
                  onSelect={(date: Date | null) => {
                    handleFollowupDateChange(date || undefined);
                  }}
                  disabled={(date) => {
                    // Don't allow dates in the past
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                />
                {hasActiveFollowup(offer) && (
                  <div className="p-2 border-t border-border flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleFollowupDateChange(undefined)}
                    >
                      Clear Followup
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-secondary/50"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">View details</span>
                  •••
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View details</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Offer Details</DialogTitle>
            <DialogDescription>
              View and edit offer details including CSAT rating, conversion status, and follow-up information.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <OfferDetails 
              offer={offer} 
              onClose={() => setIsOpen(false)} 
              onUpdate={() => {
                if (onUpdate) onUpdate();
                setIsOpen(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
});
