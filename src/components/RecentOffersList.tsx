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
    updateOffer(offerId, { converted });
    toast({
      title: "Conversion Status Updated",
      description: `Offer marked as ${converted ? 'converted' : 'not converted'}.`,
    });
  };

  const handleFollowupDateChange = (offerId: string, date: Date | undefined) => {
    if (date) {
      const timeString = followupTime[offerId] || new Date().toTimeString().substring(0, 5);
      const [hours, minutes] = timeString.split(':').map(Number);
      
      date.setHours(hours);
      date.setMinutes(minutes);
      
      updateOffer(offerId, {
        followupDate: date.toISOString().split('T')[0]
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

  const isFollowupDue = (date: string | undefined) => {
    if (!date) return false;
    const followupDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return followupDate <= today;
  };

  const filteredOffers = offers.filter(offer => {
    if (hideFilters) return true;
    
    switch (activeFilter) {
      case 'converted':
        return offer.converted === true;
      case 'followup':
        return !!offer.followupDate;
      case 'positive':
        return offer.csat === 'positive';
      default:
        return true;
    }
  });

  return (
    <Card className="glass-card bg-gradient-to-br from-background/80 to-background/40 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">
          Recent Offers ({offers.length})
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredOffers.map((offer) => (
              <Card 
                key={offer.id} 
                className="border border-border/50 rounded-lg overflow-hidden hover:shadow-md transition-all p-2"
                data-tutorial="recent-offer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm flex items-center gap-1 truncate">
                        <Tag className="h-3.5 w-3.5 mr-1 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{offer.offerType}</span>
                        <span className="text-muted-foreground">•</span>
                        <CaseLink caseNumber={offer.caseNumber} showHash={true} className="text-xs" iconSize={3} />
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{offer.channel}</span>
                      </div>
                      
                      {offer.notes && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1 bg-muted/30 p-1 rounded">
                          {offer.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    {isFollowupDue(offer.followupDate) && (
                      <div className="text-xs text-blue-500 flex items-center">
                        <Bell className="h-3 w-3 mr-1 text-red-500 animate-pulse" />
                        <span>Due: {format(new Date(offer.followupDate!), "MMM d")}</span>
                      </div>
                    )}
                    
                    <div className="flex ml-auto space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 rounded-full"
                              onClick={() => onOfferClick(offer.id)}
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>View details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Popover>
                        <PopoverTrigger asChild>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={`h-6 w-6 rounded-full ${offer.followupDate ? 'bg-blue-500/20' : ''}`}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p>Set follow-up</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </PopoverTrigger>
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
                            selected={offer.followupDate ? new Date(offer.followupDate) : undefined}
                            onSelect={(date) => handleFollowupDateChange(offer.id, date)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={`h-6 w-6 rounded-full ${
                                    offer.csat === 'positive' ? 'bg-success/20' : 
                                    offer.csat === 'neutral' ? 'bg-warning/20' : 
                                    offer.csat === 'negative' ? 'bg-destructive/20' : ''
                                  }`}
                                  onClick={e => e.stopPropagation()}
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
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-1" align="end">
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full bg-success/20"
                                    onClick={() => handleCSATUpdate(offer.id, 'positive')}
                                  >
                                    <ThumbsUp className="h-3.5 w-3.5 text-success" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full bg-warning/20"
                                    onClick={() => handleCSATUpdate(offer.id, 'neutral')}
                                  >
                                    <Minus className="h-3.5 w-3.5 text-warning" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full bg-destructive/20"
                                    onClick={() => handleCSATUpdate(offer.id, 'negative')}
                                  >
                                    <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Set CSAT</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-6 w-6 rounded-full ${offer.converted ? 'bg-success/20' : ''}`}
                              onClick={() => handleConversionUpdate(offer.id, !offer.converted)}
                            >
                              <ShoppingCart className={`h-3.5 w-3.5 ${offer.converted ? 'text-success' : 'text-muted-foreground'}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>{offer.converted ? 'Remove conversion' : 'Mark as converted'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </Card>
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
  );
}
