import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Offer, useOffers } from "@/context/OfferContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  CalendarClock, 
  CheckCircle, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  Eye,
  Bell,
  Tag,
  ShoppingCart
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { CaseLink } from "./CaseLink";
import { differenceInDays } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

interface RecentOffersListProps {
  offers: Offer[];
  onOfferClick: (offerId: string) => void;
  hideFilters?: boolean;
}

type FilterType = 'all' | 'converted' | 'followup' | 'positive';

export function RecentOffersList({ offers, onOfferClick, hideFilters = false }: RecentOffersListProps) {
  const { updateOffer } = useOffers();
  const [followupTime, setFollowupTime] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleCSATUpdate = (offerId: string, csat: 'positive' | 'neutral' | 'negative') => {
    updateOffer(offerId, { csat });
    toast({
      title: "CSAT Updated",
      description: "Customer satisfaction rating has been updated.",
    });
  };

  const handleConversionUpdate = (offerId: string, converted: boolean) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    if (converted) {
      updateOffer(offerId, { 
        converted: true,
        conversionDate: new Date().toISOString().split('T')[0]
      });
      toast({
        title: "Conversion Status Updated",
        description: "Offer marked as converted. Click again to change the date.",
      });
    } else {
      updateOffer(offerId, { 
        converted: false,
        conversionDate: undefined
      });
      toast({
        title: "Conversion Status Updated",
        description: "Offer marked as not converted.",
      });
    }
  };

  const handleConversionDateChange = (offerId: string, date: Date | undefined) => {
    if (date) {
      updateOffer(offerId, { 
        converted: true,
        conversionDate: date.toISOString().split('T')[0]
      });
      toast({
        title: "Offer Converted",
        description: `Marked as converted on ${format(date, "PPP")}`,
      });
    }
  };

  const handleFollowupDateChange = (offerId: string, date: Date | undefined) => {
    if (date) {
      const timeString = followupTime[offerId] || new Date().toTimeString().substring(0, 5);
      const [hours, minutes] = timeString.split(':').map(Number);
      
      date.setHours(hours);
      date.setMinutes(minutes);
      
      // Convert date to YYYY-MM-DD format
      const dateString = date.toISOString().split('T')[0];

      // Get the current offer to update
      const offer = offers.find(o => o.id === offerId);
      if (!offer) return;
      
      // Create a copy of existing followups array or initialize empty array
      const updatedFollowups = [...(offer.followups || [])];
      
      // Check if there's already an active followup with the same date
      const hasDuplicateDate = updatedFollowups.some(
        f => !f.completed && f.date === dateString
      );
      
      if (hasDuplicateDate) {
        toast({
          title: "Duplicate Date",
          description: "A follow-up is already scheduled for this date.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the new followup to the array
      updatedFollowups.push({
        id: uuidv4(),
        date: dateString,
        notes: offer.notes,
        completed: false
      });

      // Update the offer with both formats
      updateOffer(offerId, {
        followups: updatedFollowups,
        followupDate: dateString // Keep legacy field in sync
      });

      toast({
        title: "Follow-up Date Set",
        description: `Follow-up scheduled for ${format(date, "PPP")}`,
      });
    }
  };

  const handleTimeChange = (offerId: string, time: string) => {
    setFollowupTime(prev => ({ ...prev, [offerId]: time }));
  };

  const hasActiveFollowup = (offer: Offer): boolean => {
    // Check followups array
    if (offer.followups && offer.followups.length > 0) {
      return offer.followups.some(followup => !followup.completed);
    }
    // Check legacy followupDate
    return !!offer.followupDate;
  };

  const getNextFollowupDate = (offer: Offer): string | undefined => {
    // Check followups array first
    if (offer.followups && offer.followups.length > 0) {
      const activeFollowups = offer.followups
        .filter(followup => !followup.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (activeFollowups.length > 0) {
        return activeFollowups[0].date;
      }
    }
    
    // Fall back to legacy followupDate
    return offer.followupDate;
  };

  const isFollowupDue = (offer: Offer): boolean => {
    const nextFollowupDate = getNextFollowupDate(offer);
    if (!nextFollowupDate) return false;
    
    const followupDate = new Date(nextFollowupDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return followupDate <= today;
  };

  const filteredOffers = offers.filter(offer => {
    // Filter by date - only show offers from the last 10 days
    const offerDate = new Date(offer.date);
    const today = new Date();
    const daysSince = differenceInDays(today, offerDate);
    if (daysSince > 10) return false;
    
    if (hideFilters) return true;
    
    switch (activeFilter) {
      case 'converted':
        return offer.converted === true;
      case 'followup':
        return hasActiveFollowup(offer);
      case 'positive':
        return offer.csat === 'positive';
      default:
        return true;
    }
  });

  // Helper to get status badges for an offer
  const getStatusBadges = (offer: Offer) => {
    const badges = [];
    
    if (offer.converted) {
      badges.push(
        <Badge key="converted" variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">
          <ShoppingCart className="h-2.5 w-2.5 mr-1" />
          Converted
        </Badge>
      );
    }
    
    if (isFollowupDue(offer)) {
      badges.push(
        <Badge key="due" variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">
          <Bell className="h-2.5 w-2.5 mr-1" />
          Due
        </Badge>
      );
    } else if (hasActiveFollowup(offer)) {
      badges.push(
        <Badge key="followup" variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px]">
          <CalendarClock className="h-2.5 w-2.5 mr-1" />
          Follow-up
        </Badge>
      );
    }
    
    if (offer.csat) {
      const csatInfo = {
        positive: { color: 'success', icon: <ThumbsUp className="h-2.5 w-2.5 mr-1" /> },
        neutral: { color: 'warning', icon: <Minus className="h-2.5 w-2.5 mr-1" /> },
        negative: { color: 'destructive', icon: <ThumbsDown className="h-2.5 w-2.5 mr-1" /> }
      };
      
      const info = csatInfo[offer.csat];
      
      badges.push(
        <Badge key="csat" variant="outline" className={`bg-${info.color}/10 text-${info.color} border-${info.color}/20 text-[10px]`}>
          {info.icon}
          {offer.csat.charAt(0).toUpperCase() + offer.csat.slice(1)}
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <TooltipProvider>
      <Card className="glass-card bg-gradient-to-br from-background/80 to-background/40 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Last 10 Days ({filteredOffers.length})
          </CardTitle>
          {!hideFilters && (
            <div className="flex space-x-1 text-xs">
              <Badge 
                variant={activeFilter === 'all' ? "default" : "outline"} 
                className="cursor-pointer text-xs px-2 py-0.5 rounded-full"
                onClick={() => setActiveFilter('all')}
              >
                All
              </Badge>
              <Badge 
                variant={activeFilter === 'converted' ? "default" : "outline"} 
                className="cursor-pointer text-xs px-2 py-0.5 rounded-full"
                onClick={() => setActiveFilter('converted')}
              >
                Converted
              </Badge>
              <Badge 
                variant={activeFilter === 'followup' ? "default" : "outline"} 
                className="cursor-pointer text-xs px-2 py-0.5 rounded-full"
                onClick={() => setActiveFilter('followup')}
              >
                Follow-up
              </Badge>
              <Badge 
                variant={activeFilter === 'positive' ? "default" : "outline"} 
                className="cursor-pointer text-xs px-2 py-0.5 rounded-full"
                onClick={() => setActiveFilter('positive')}
              >
                Positive
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="pb-2 px-4">
          {filteredOffers.length > 0 ? (
            <div className="space-y-1 overflow-hidden">
              {filteredOffers.map((offer) => (
                <div 
                  key={offer.id} 
                  className="flex items-center justify-between py-2 px-3 border-b border-border/30 hover:bg-secondary/10 transition-all rounded-md"
                  data-tutorial="recent-offer"
                >
                  {/* Offer info - left side */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOfferClick(offer.id)}>
                    <div className="flex items-center">
                      <div className="font-medium text-sm truncate">
                        {offer.offerType}
                        <span className="ml-1 text-xs text-muted-foreground">
                          (<CaseLink caseNumber={offer.caseNumber} showHash={false} iconSize={3} />)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {getStatusBadges(offer).map(badge => badge)}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <span>{offer.channel}</span>
                      {isFollowupDue(offer) && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-red-500">
                            Due: {format(new Date(getNextFollowupDate(offer)!), "MMM d")}
                          </span>
                        </>
                      )}
                      {offer.notes && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="truncate">{offer.notes.length > 20 ? offer.notes.substring(0, 20) + '...' : offer.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons - right side */}
                  <div className="flex items-center space-x-1 ml-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full"
                          onClick={() => onOfferClick(offer.id)}
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>View details</p>
                      </TooltipContent>
                    </Tooltip>

                    <Popover>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`h-7 w-7 rounded-full ${hasActiveFollowup(offer) ? 'bg-blue-500/20' : ''}`}
                              >
                                <CalendarClock className={`h-3.5 w-3.5 ${hasActiveFollowup(offer) ? 'text-blue-500' : 'text-muted-foreground'}`} />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Set follow-up</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <PopoverContent className="w-auto p-0" align="end">
                        <div className="p-2 border-b border-border flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Set time:</span>
                          <Input
                            type="time"
                            value={followupTime[offer.id] || new Date().toTimeString().substring(0, 5)}
                            onChange={(e) => handleTimeChange(offer.id, e.target.value)}
                            className="h-7 w-24"
                          />
                        </div>
                        <Calendar
                          mode="single"
                          selected={getNextFollowupDate(offer) ? new Date(getNextFollowupDate(offer)!) : undefined}
                          onSelect={(date) => handleFollowupDateChange(offer.id, date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <Tooltip>
                        <PopoverTrigger asChild>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-7 w-7 rounded-full ${
                                offer.csat === 'positive' ? 'bg-success/20' : 
                                offer.csat === 'neutral' ? 'bg-warning/20' : 
                                offer.csat === 'negative' ? 'bg-destructive/20' : ''
                              }`}
                            >
                              {offer.csat === 'positive' ? (
                                <ThumbsUp className="h-3.5 w-3.5 text-success" />
                              ) : offer.csat === 'neutral' ? (
                                <Minus className="h-3.5 w-3.5 text-warning" />
                              ) : offer.csat === 'negative' ? (
                                <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                              ) : (
                                <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </TooltipTrigger>
                        </PopoverTrigger>
                        <TooltipContent side="left">
                          <p>Set CSAT rating</p>
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent className="w-auto p-2 flex flex-col gap-2" align="end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2 justify-start"
                          onClick={() => handleCSATUpdate(offer.id, 'positive')}
                        >
                          <ThumbsUp className="h-4 w-4 text-success" />
                          <span>Positive</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2 justify-start"
                          onClick={() => handleCSATUpdate(offer.id, 'neutral')}
                        >
                          <Minus className="h-4 w-4 text-warning" />
                          <span>Neutral</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2 justify-start"
                          onClick={() => handleCSATUpdate(offer.id, 'negative')}
                        >
                          <ThumbsDown className="h-4 w-4 text-destructive" />
                          <span>Negative</span>
                        </Button>
                      </PopoverContent>
                    </Popover>

                    {/* Simplified Conversion Button */}
                    {offer.converted ? (
                      // If converted, click removes conversion
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-full bg-success/20"
                            onClick={() => handleConversionUpdate(offer.id, false)}
                          >
                            <ShoppingCart className="h-3.5 w-3.5 text-success" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>Remove conversion</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      // If not converted, click opens date picker
                      <Popover>
                        <Tooltip>
                          <PopoverTrigger asChild>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-full"
                              >
                                <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                          </PopoverTrigger>
                          <TooltipContent side="left">
                            <p>Mark as converted</p>
                          </TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-auto p-0" align="end">
                          <div className="p-3 space-y-2">
                            <div className="text-sm font-medium">Select Conversion Date</div>
                            <Calendar
                              mode="single"
                              selected={undefined}
                              onSelect={(date) => handleConversionDateChange(offer.id, date)}
                              disabled={(date) => {
                                const offerDate = new Date(offer.date);
                                offerDate.setHours(0, 0, 0, 0);
                                return date < offerDate;
                              }}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p>No offers match your filter.</p>
              <p className="text-sm text-muted-foreground mb-4">Try another filter or add more offers.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 pb-3 px-4">
          {offers.length > 0 && (
            <Button variant="outline" className="w-full group hover:bg-secondary/80" asChild>
              <Link to="/offers">
                View All Offers 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
