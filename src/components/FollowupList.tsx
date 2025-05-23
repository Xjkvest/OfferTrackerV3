import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOffers, Offer } from "@/context/OfferContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, ChevronDown, ChevronUp, CheckCircle, ArrowRight, Eye, AlertTriangle, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FollowupItem } from "./FollowupItem";
import { formatFollowupDate } from "@/utils/dateUtils";
import { CaseLink } from "./CaseLink";
import { useFollowupManager } from "@/hooks/useFollowupManager";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FollowupListProps {
  onOfferClick?: (offerId: string) => void;
}

export function FollowupList({ onOfferClick }: FollowupListProps) {
  const { offers } = useOffers();
  const {
    markFollowupAsCompleted,
    addNewFollowup,
    getCategorizedFollowups,
    getMostRecentFollowup,
    popoverOpen,
    handlePopoverOpenChange,
    followupTime,
    handleTimeChange,
    getAllFollowableOffers,
    hasActiveFollowup,
    hasAnyFollowups,
    hasOnlyCompletedFollowups
  } = useFollowupManager();
  
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [isAddingFollowup, setIsAddingFollowup] = useState(false);
  
  // Get categorized followups
  const { 
    overdue: overdueFollowups, 
    today: todaysFollowups, 
    upcoming: upcomingFollowups,
    completed: completedFollowups, 
    all: allFollowups 
  } = getCategorizedFollowups();
  
  // Get all offers that could have followups (for the "Add New" section)
  const followableOffers = getAllFollowableOffers();
  
  // Filter followable offers into categories manually
  const offersWithCompletedFollowups = offers.filter(offer => 
    !hasActiveFollowup(offer) && offer.followups?.some(f => f.completed)
  );
  
  const offersWithNoFollowups = offers.filter(offer => 
    !hasAnyFollowups(offer)
  );
  
  const offersWithActiveFollowups = offers.filter(offer =>
    hasActiveFollowup(offer)
  );
  
  const totalCount = allFollowups.length;
  const urgentCount = todaysFollowups.length + overdueFollowups.length;
  const hasActiveFollowups = overdueFollowups.length > 0 || todaysFollowups.length > 0 || upcomingFollowups.length > 0;

  const mostUrgentFollowup = overdueFollowups[0] || todaysFollowups[0] || upcomingFollowups[0];
  const mostUrgentFollowupItem = mostUrgentFollowup ? getMostRecentFollowup(mostUrgentFollowup) : null;
  const isOverdue = mostUrgentFollowupItem && mostUrgentFollowupItem.date < today;
  
  const handleMarkAsCompleted = async (offer: Offer, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Marking followup as completed for offer:', offer.id);
    
    await markFollowupAsCompleted(offer.id, offer);
    
    // Close popover if open
    if (popoverOpen[offer.id]) {
      handlePopoverOpenChange(offer.id, false);
    }
  };

  const handleOfferClick = (offer: Offer) => {
    if (onOfferClick) {
      onOfferClick(offer.id);
    }
  };

  const handleFollowupDateChange = (offerId: string, date: Date | undefined) => {
    console.log('Date changed for offer:', offerId, date);
    
    if (date) {
      setSelectedDate(date);
      setSelectedOfferId(offerId);
    }
  };

  const handleSaveFollowup = async () => {
    if (selectedOfferId && selectedDate) {
      const offer = offers.find(o => o.id === selectedOfferId);
      if (offer) {
        const dateString = selectedDate.toISOString().split('T')[0];
        await addNewFollowup(selectedOfferId, offer, dateString);
        
        // Reset state
        setSelectedOfferId(null);
        setIsAddingFollowup(false);
      }
    }
  };

  const openAddFollowupModal = (offerId: string) => {
    setSelectedOfferId(offerId);
    setIsAddingFollowup(true);
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
            {urgentCount > 0 ? (
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500 flex-shrink-0" />
            ) : (
              <CalendarClock className="mr-2 h-5 w-5 text-blue-500 flex-shrink-0" />
            )}
            <CardTitle className="text-lg font-medium mr-2 flex-shrink-0">Follow-ups</CardTitle>
            
            {urgentCount > 0 && (
              <Badge className={`mr-2 ${overdueFollowups.length > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'} flex-shrink-0`}>
                {urgentCount} need action
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
                    ? `Follow-up was due on ${formatFollowupDate(mostUrgentFollowupItem?.date || '')}`
                    : `Follow-up scheduled for ${formatFollowupDate(mostUrgentFollowupItem?.date || '')}`
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOfferClick) {
                            onOfferClick(mostUrgentFollowup.id);
                          }
                        }}
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
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddFollowupModal(mostUrgentFollowup.id);
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Follow-up</p>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsCompleted(mostUrgentFollowup, e);
                        }}
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
                  {/* Action Needed section - combines overdue and today's followups */}
                  {(overdueFollowups.length > 0 || todaysFollowups.length > 0) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold flex items-center text-amber-500">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Action Needed
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Show overdue items first */}
                        {overdueFollowups.map((offer) => {
                          // Get the most urgent (earliest) active followup
                          const mostUrgentFollowup = getMostRecentFollowup(offer);
                          
                          return (
                            <FollowupItem 
                              key={offer.id} 
                              offer={offer} 
                              followup={mostUrgentFollowup}
                              onComplete={(e) => handleMarkAsCompleted(offer, e)} 
                              onClick={() => handleOfferClick(offer)}
                              isUrgent 
                              isOverdue
                              onAddNewFollowup={() => openAddFollowupModal(offer.id)}
                            />
                          );
                        })}
                        
                        {/* Then show today's items */}
                        {todaysFollowups.map((offer) => {
                          // Get the most urgent (earliest) active followup
                          const mostUrgentFollowup = getMostRecentFollowup(offer);
                            
                          return (
                            <FollowupItem 
                              key={offer.id} 
                              offer={offer} 
                              followup={mostUrgentFollowup}
                              onComplete={(e) => handleMarkAsCompleted(offer, e)} 
                              onClick={() => handleOfferClick(offer)}
                              isUrgent 
                              onAddNewFollowup={() => openAddFollowupModal(offer.id)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Upcoming followups section - limited to 4 items */}
                  {upcomingFollowups.length > 0 && (
                    <div className="space-y-2">
                      {(overdueFollowups.length > 0 || todaysFollowups.length > 0) && <Separator />}
                      <h3 className="text-sm font-semibold flex items-center text-blue-500">
                        <ArrowRight className="h-3.5 w-3.5 mr-1" /> Upcoming
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {upcomingFollowups.slice(0, 4).map((offer) => {
                          // Get the most urgent (earliest) active followup
                          const mostUrgentFollowup = getMostRecentFollowup(offer);
                            
                          return (
                            <FollowupItem 
                              key={offer.id} 
                              offer={offer} 
                              followup={mostUrgentFollowup}
                              onComplete={(e) => handleMarkAsCompleted(offer, e)}
                              onClick={() => handleOfferClick(offer)}
                              onAddNewFollowup={() => openAddFollowupModal(offer.id)}
                            />
                          );
                        })}
                      </div>
                      {upcomingFollowups.length > 4 && (
                        <div className="text-xs text-center text-muted-foreground pt-1">
                          +{upcomingFollowups.length - 4} more upcoming follow-ups
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Recent Completions section - limited to 2 items */}
                  {completedFollowups.length > 0 && (
                    <div className="space-y-2">
                      {(todaysFollowups.length > 0 || overdueFollowups.length > 0 || upcomingFollowups.length > 0) && <Separator />}
                      <h3 className="text-sm font-semibold flex items-center text-green-500">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Recent Completions
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {completedFollowups.slice(0, 2).map((offer) => {
                          // For completed items, ensure we're passing in a completed followup
                          const followup = offer.followups?.find(f => f.completed) || {
                            id: 'completed',
                            date: offer.followupDate || '',
                            completed: true,
                            completedAt: new Date().toISOString()
                          };
                          
                          return (
                            <FollowupItem 
                              key={offer.id} 
                              offer={offer} 
                              followup={followup}
                              onComplete={(e) => {}} // Empty function for completed items
                              onClick={() => handleOfferClick(offer)}
                              onAddNewFollowup={() => openAddFollowupModal(offer.id)}
                            />
                          );
                        })}
                      </div>
                      {completedFollowups.length > 2 && (
                        <div className="text-xs text-center text-muted-foreground pt-1">
                          +{completedFollowups.length - 2} more completed follow-ups
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Add New Followup section */}
                  <div className="space-y-2 mt-4">
                    <Separator />
                    <h3 className="text-sm font-semibold flex items-center text-purple-500">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Suggested Follow-ups
                    </h3>
                    
                    {/* New offers without followups */}
                    {offersWithNoFollowups.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">New cases without follow-ups:</h4>
                        <div className="flex flex-wrap gap-2">
                          {offersWithNoFollowups
                            .filter(offer => {
                              // Only show offers less than 30 days old
                              const offerDate = new Date(offer.date);
                              const daysOld = Math.floor((Date.now() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
                              return daysOld < 30;
                            })
                            .map((offer) => (
                              <Button 
                                key={offer.id}
                                variant="outline" 
                                size="sm" 
                                className="flex items-center justify-start gap-2 h-auto py-1.5 text-left"
                                onClick={() => openAddFollowupModal(offer.id)}
                              >
                                <PlusCircle className="h-3 w-3 text-blue-500 shrink-0" />
                                <div className="truncate">
                                  <span className="font-medium text-xs">{offer.offerType}</span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    #{offer.caseNumber}
                                  </span>
                                </div>
                              </Button>
                            ))
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Offers with completed followups more than 10 days ago */}
                    {offersWithCompletedFollowups.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Cases needing follow-up:</h4>
                        <div className="flex flex-wrap gap-2">
                          {offersWithCompletedFollowups
                            .filter(offer => {
                              // Only show offers less than 30 days old
                              const offerDate = new Date(offer.date);
                              const daysOld = Math.floor((Date.now() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
                              if (daysOld >= 30) return false;

                              // Check if the last followup was completed more than 10 days ago
                              if (!offer.followups || offer.followups.length === 0) return false;
                              
                              // Find the most recent completed followup
                              const sortedFollowups = [...offer.followups]
                                .filter(f => f.completed)
                                .sort((a, b) => {
                                  const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
                                  const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
                                  return dateB.getTime() - dateA.getTime();
                                });
                              
                              if (sortedFollowups.length === 0) return false;
                              
                              const lastCompletedFollowup = sortedFollowups[0];
                              const completedDate = new Date(lastCompletedFollowup.completedAt || new Date(0));
                              const daysSinceCompletion = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
                              
                              return daysSinceCompletion >= 10;
                            })
                            .map((offer) => (
                              <Button 
                                key={offer.id}
                                variant="outline" 
                                size="sm" 
                                className="flex items-center justify-start gap-2 h-auto py-1.5 text-left bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30"
                                onClick={() => openAddFollowupModal(offer.id)}
                              >
                                <PlusCircle className="h-3 w-3 text-green-500 shrink-0" />
                                <div className="truncate">
                                  <span className="font-medium text-xs">{offer.offerType}</span>
                                  <span className="text-xs text-muted-foreground ml-1">
                                    #{offer.caseNumber}
                                  </span>
                                </div>
                              </Button>
                            ))
                          }
                        </div>
                        {offersWithCompletedFollowups.filter(offer => {
                          // Only show offers less than 30 days old with followups completed more than 10 days ago
                          const offerDate = new Date(offer.date);
                          const daysOld = Math.floor((Date.now() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
                          if (daysOld >= 30) return false;

                          if (!offer.followups || offer.followups.length === 0) return false;
                          
                          const sortedFollowups = [...offer.followups]
                            .filter(f => f.completed)
                            .sort((a, b) => {
                              const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
                              const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
                              return dateB.getTime() - dateA.getTime();
                            });
                          
                          if (sortedFollowups.length === 0) return false;
                          
                          const lastCompletedFollowup = sortedFollowups[0];
                          const completedDate = new Date(lastCompletedFollowup.completedAt || new Date(0));
                          const daysSinceCompletion = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
                          
                          return daysSinceCompletion >= 10;
                        }).length === 0 && (
                          <div className="text-xs text-center text-muted-foreground pt-1">
                            No cases need additional follow-up at this time
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* For clarity, show a message when all cases are over 30 days */}
                    {offersWithNoFollowups.filter(offer => {
                      const offerDate = new Date(offer.date);
                      const daysOld = Math.floor((Date.now() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
                      return daysOld < 30;
                    }).length === 0 && offersWithCompletedFollowups.filter(offer => {
                      const offerDate = new Date(offer.date);
                      const daysOld = Math.floor((Date.now() - offerDate.getTime()) / (1000 * 60 * 60 * 24));
                      return daysOld < 30;
                    }).length === 0 && (
                      <div className="text-xs text-center text-muted-foreground p-2 bg-muted/20 rounded-md">
                        All cases are either being followed up or past the 30-day window
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Add New Followup Dialog */}
      <Dialog open={isAddingFollowup} onOpenChange={setIsAddingFollowup}>
        <DialogContent className="sm:max-w-[350px] p-0 overflow-hidden border-none shadow-lg mx-auto">
          <DialogHeader className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border-b">
            <DialogTitle className="text-lg flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-500" />
              Schedule Follow-up
            </DialogTitle>
            {selectedOfferId && (
              <div className="mt-2 space-y-1.5">
                <p className="text-sm font-medium">
                  {offers.find(o => o.id === selectedOfferId)?.offerType}
                  <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                    #{offers.find(o => o.id === selectedOfferId)?.caseNumber}
                  </span>
                </p>
                {selectedOfferId && hasActiveFollowup(offers.find(o => o.id === selectedOfferId)!) && (
                  <div className="p-2 rounded bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    This offer already has an active follow-up
                  </div>
                )}
                {selectedOfferId && hasOnlyCompletedFollowups(offers.find(o => o.id === selectedOfferId)!) && (
                  <div className="p-2 rounded bg-green-500/10 text-xs text-green-600 dark:text-green-400 flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    All previous follow-ups are completed
                  </div>
                )}
                <div className="p-2 rounded bg-blue-500/10 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Adding a new follow-up will preserve existing history
                </div>
              </div>
            )}
          </DialogHeader>
          <div className="px-3 py-4 bg-card flex justify-center items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="w-full"
              classNames={{
                day_selected: "bg-blue-500 text-primary-foreground hover:bg-blue-600 hover:text-primary-foreground focus:bg-blue-600 focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                root: "w-full",
                month: "space-y-3",
                caption_label: "text-sm font-medium",
                table: "w-full border-collapse space-y-1",
                head_cell: "text-muted-foreground font-normal text-[0.8rem] w-9",
                cell: "text-center p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                nav_button: "h-7 w-7 bg-transparent hover:bg-accent p-0 opacity-50 hover:opacity-100",
                nav: "space-x-1 flex items-center",
              }}
            />
          </div>
          <DialogFooter className="flex px-4 py-3 border-t bg-muted/30">
            <Button 
              size="sm" 
              variant="outline" 
              className="mr-2 h-9"
              onClick={() => setIsAddingFollowup(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="h-9 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              onClick={handleSaveFollowup}
              disabled={!selectedDate || !selectedOfferId}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Add Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
