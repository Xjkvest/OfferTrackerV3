import React from "react";
import { Offer, useOffers } from "@/context/OfferContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { CalendarClock, CheckCircle, AlertCircle, ThumbsUp, ThumbsDown, Minus, Pencil, Trash, X, ShoppingCart, Calendar, Zap, Clock, MessageCircle, Mail, Phone, PhoneCall } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OfferDetails } from "./OfferDetails";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CaseLink } from "./CaseLink";
import { getConversionLagInfo } from "@/utils/dateUtils";

interface OfferItemProps {
  offer: Offer;
  onUpdate?: () => void;
}

export const OfferItem = React.memo(({ offer, onUpdate }: OfferItemProps) => {
  const { updateOffer, deleteOffer } = useOffers();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showConversionDate, setShowConversionDate] = React.useState(false);
  
  const date = new Date(offer.date);
  const formattedDate = format(date, "MMM d");
  const formattedTime = format(date, "h:mm a");
  
  // Conversion lag calculation
  const getConversionLag = () => {
    if (!offer.converted || !offer.conversionDate) return null;
    
    const offerDate = new Date(offer.date);
    const conversionDate = new Date(offer.conversionDate);
    const lagInfo = getConversionLagInfo(offerDate, conversionDate);
    
    if (lagInfo.lagDays === 0) {
      return { text: "Same day", icon: <Zap className="h-3 w-3 text-amber-500" />, fast: true };
    } else if (lagInfo.lagDays <= 3) {
      return { 
        text: `in ${lagInfo.lagDays} day${lagInfo.lagDays > 1 ? 's' : ''}`, 
        icon: <Zap className="h-3 w-3 text-amber-500" />, 
        fast: true 
      };
    } else if (lagInfo.lagDays > 7) {
      return { text: `in ${lagInfo.lagDays} days`, icon: <Clock className="h-3 w-3 text-blue-500" />, fast: false };
    } else {
      return { text: `in ${lagInfo.lagDays} days`, icon: <Clock className="h-3 w-3 text-green-500" />, fast: false };
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
    updateOffer(offer.id, { 
      followupDate: date ? date.toISOString().split('T')[0] : undefined 
    });
    onUpdate?.();
    toast({
      title: "Follow-up Date Updated",
      description: date ? `Follow-up scheduled for ${format(date, "PPP")}` : "Follow-up date removed",
    });
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

  // Check if follow-up is due today or overdue
  const isFollowupDueToday = () => {
    if (!offer.followupDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return offer.followupDate === today;
  };

  const isFollowupOverdue = () => {
    if (!offer.followupDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return offer.followupDate < today;
  };

  // Get follow-up status text and style
  const getFollowupStatus = () => {
    if (isFollowupOverdue()) {
      return {
        text: "Overdue",
        badge: <Badge variant="outline" className="text-xs font-normal text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700/50">
          <AlertCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      };
    }
    
    if (isFollowupDueToday()) {
      return {
        text: "Due Today",
        badge: <Badge variant="outline" className="text-xs font-normal text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/50">
          <Clock className="h-3 w-3 mr-1" />
          Due Today
        </Badge>
      };
    }
    
    if (offer.followupDate) {
      return {
        text: `Follow-up: ${format(new Date(offer.followupDate), "MMM d")}`,
        badge: <Badge variant="outline" className="text-xs font-normal text-blue-600 dark:text-blue-400">
          <Calendar className="h-3 w-3 mr-1" />
          {format(new Date(offer.followupDate), "MMM d")}
        </Badge>
      };
    }
    
    return { text: null, badge: null };
  };

  const followupStatus = getFollowupStatus();

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${getCardBgColor()} ${offer.converted ? 'border-blue-200 dark:border-blue-800/30' : ''}`}>
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
                  <Calendar className="h-3.5 w-3.5" />
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
                {followupStatus.badge}
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
          <TooltipProvider>
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
          </TooltipProvider>
          
          <TooltipProvider>
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
          </TooltipProvider>
          
          {/* Conversion Quick Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
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
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="end">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 px-2 ${offer.converted ? 'bg-blue-500/20 text-blue-500' : 'bg-secondary'}`}
                          onClick={() => handleConversionChange(true)}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Converted
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 px-2 ${!offer.converted ? 'bg-muted text-muted-foreground' : 'bg-secondary'}`}
                          onClick={() => handleConversionChange(false)}
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Not Converted
                        </Button>
                      </div>
                      
                      {offer.converted && (
                        <div className="pt-2 border-t border-border/30">
                          <div className="text-xs text-muted-foreground mb-1">Conversion Date:</div>
                          <CalendarComponent
                            mode="single"
                            selected={offer.conversionDate ? new Date(offer.conversionDate) : undefined}
                            onSelect={handleConversionDateChange}
                            disabled={(date) => date > new Date()}
                            className="pointer-events-auto"
                          />
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                {offer.converted ? "Update conversion" : "Mark as converted"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Follow-up Quick Action */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`h-8 w-8 rounded-full ${
                        isFollowupOverdue() ? 'bg-rose-500/20 text-rose-500' :
                        isFollowupDueToday() ? 'bg-amber-500/20 text-amber-500' :
                        offer.followupDate ? 'bg-blue-500/20 text-blue-500' : 
                        'bg-secondary/50'
                      }`}
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-2">
                      <CalendarComponent
                        mode="single"
                        selected={offer.followupDate ? new Date(offer.followupDate) : undefined}
                        onSelect={handleFollowupDateChange}
                        disabled={(date) => date < new Date()}
                        className="pointer-events-auto"
                      />
                      {offer.followupDate && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleFollowupDateChange(undefined)}
                        >
                          Clear follow-up date
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                {isFollowupOverdue() ? "Overdue follow-up" : 
                 isFollowupDueToday() ? "Due today" : 
                 offer.followupDate ? "Update follow-up" : "Set follow-up"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Details Button */}
          <TooltipProvider>
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
          </TooltipProvider>
        </div>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
          </DialogHeader>
          <OfferDetails 
            offer={offer} 
            onClose={() => setIsOpen(false)} 
            onUpdate={() => {
              if (onUpdate) onUpdate();
              setIsOpen(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
});
