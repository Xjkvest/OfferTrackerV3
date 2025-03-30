import { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday, 
  isSameMonth, 
  getDay, 
  getWeek,
  addMonths,
  addWeeks,
  startOfWeek,
  endOfWeek,
  addYears,
  startOfYear,
  endOfYear,
  differenceInDays,
  eachWeekOfInterval,
  isSameDay
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

// Types for calendar view
type CalendarView = "week" | "month";

// Heatmap colors based on intensity (0-10)
const getHeatmapColor = (intensity: number) => {
  if (intensity === 0) return "bg-transparent";
  if (intensity === 1) return "bg-green-50";
  if (intensity === 2) return "bg-green-100";
  if (intensity === 3) return "bg-green-200";
  if (intensity === 4) return "bg-green-300";
  if (intensity === 5) return "bg-green-400";
  if (intensity === 6) return "bg-green-500";
  if (intensity === 7) return "bg-green-600";
  if (intensity === 8) return "bg-green-700";
  if (intensity === 9) return "bg-green-800";
  return "bg-green-900";
};

export function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("week");
  const { offers, streak, streakInfo } = useOffers();
  const { settings } = useUser();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  // Calculate date ranges based on the selected view
  const dateRange = useMemo(() => {
    switch (calendarView) {
      case "week":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 })
        };
      case "month":
      default:
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
    }
  }, [currentDate, calendarView]);
  
  // Get days to display based on the selected view
  const daysToDisplay = useMemo(() => {
    return eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
  }, [dateRange]);
  
  // Get weeks for the week numbers display
  const weeksToDisplay = useMemo(() => {
    if (calendarView !== "month") return [];
    
    // For month view, calculate weeks based on the first date of each week
    // in the visible calendar (which may include days from adjacent months)
    const firstDay = dateRange.start;
    const firstWeekStart = startOfWeek(firstDay, { weekStartsOn: 0 });
    
    // Calculate how many weeks we need to display
    const firstDayOfMonth = getDay(dateRange.start);
    const daysInMonth = daysToDisplay.length;
    const totalDaysToShow = firstDayOfMonth + daysInMonth;
    const weeksNeeded = Math.ceil(totalDaysToShow / 7);
    
    // Generate array of week start dates
    return Array.from({ length: weeksNeeded }, (_, i) => {
      const weekStart = addWeeks(firstWeekStart, i);
      return weekStart;
    });
  }, [dateRange, calendarView, daysToDisplay]);
  
  // Determine if a day is a work day based on user settings
  const isWorkDay = (dayOfWeek: number) => {
    if (!settings.streakSettings.countWorkdaysOnly) return true;
    return settings.streakSettings.workdays.includes(dayOfWeek);
  };
  
  // Navigation functions based on the current view
  const navigatePrevious = () => {
    switch (calendarView) {
      case "week":
        setCurrentDate(addWeeks(currentDate, -1));
        break;
      case "month":
      default:
        setCurrentDate(addMonths(currentDate, -1));
        break;
    }
  };
  
  const navigateNext = () => {
    switch (calendarView) {
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
      default:
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };
  
  // Go to current date in the active view
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get offers for a specific day
  const getOffersForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return offers.filter(offer => offer.date.split('T')[0] === dayStr);
  };
  
  // Get performance intensity for heatmap (0-10 scale based on number of offers)
  const getPerformanceIntensity = (day: Date) => {
    const dayOffers = getOffersForDay(day);
    const count = dayOffers.length;
    
    // Calculate if any offers converted for bonus intensity
    const convertedCount = dayOffers.filter(offer => offer.converted || offer.isConverted).length;
    
    // Base intensity on count with bonus for conversions
    let intensity = count;
    if (convertedCount > 0) {
      intensity += convertedCount;
    }
    
    // Cap at 10
    return Math.min(intensity, 10);
  };
  
  // Check if a day contributed to streak
  const isStreakDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    
    // Check if there are any offers on this day
    const dayOffers = getOffersForDay(day);
    
    // A day contributes to the streak if it has offers and 
    // is either a work day or not (depending on settings)
    return dayOffers.length > 0;
  };
  
  // Get followups for a specific day
  const getFollowupsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return offers.filter(offer => {
      // Check legacy followupDate
      if (offer.followupDate && offer.followupDate.split('T')[0] === dayStr) {
        return true;
      }
      
      // Check followups array
      if (offer.followups && offer.followups.length > 0) {
        return offer.followups.some(followup => 
          !followup.completed && followup.date.split('T')[0] === dayStr
        );
      }
      
      return false;
    });
  };
  
  // Get offer types for color coding
  const getOfferTypesForDay = (day: Date) => {
    const dayOffers = getOffersForDay(day);
    const types = new Set(dayOffers.map(offer => offer.offerType));
    return Array.from(types);
  };
  
  // Check if there are any converted offers on this day
  const hasConvertedOffers = (day: Date) => {
    const dayOffers = getOffersForDay(day);
    return dayOffers.some(offer => offer.converted || offer.isConverted);
  };
  
  // Open day detail dialog
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };
  
  // Generate the day cells for the calendar
  const renderDays = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (calendarView === "month") {
      // Get the day of week for the first day of month (0 = Sunday, 6 = Saturday)
      const firstDayOfMonth = getDay(dateRange.start);
      
      // Create empty cells for days before the first of month
      const blanks = Array(firstDayOfMonth).fill(null).map((_, i) => (
        <div key={`blank-${i}`} className="h-10 md:h-14"></div>
      ));
      
      // Create cells for each day of the month
      const days = daysToDisplay.map(day => renderDayCell(day));
      
      return [...blanks, ...days];
    } else {
      // Week view: render the 7 days of the week
      return daysToDisplay.map(day => renderDayCell(day));
    }
  };
  
  // Render an individual day cell
  const renderDayCell = (day: Date) => {
    const dayOffers = getOffersForDay(day);
    const dayFollowups = getFollowupsForDay(day);
    const offerTypes = getOfferTypesForDay(day);
    const hasConverted = hasConvertedOffers(day);
    const isWorkDayValue = isWorkDay(getDay(day));
    const performanceIntensity = getPerformanceIntensity(day);
    const isStreakDayValue = isStreakDay(day);
    
    // Determine day status
    const hasOffers = dayOffers.length > 0;
    const hasFollowups = dayFollowups.length > 0;
    
    return (
      <TooltipProvider key={day.toString()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative h-10 md:h-14 p-0.5 border border-border/10 rounded-md cursor-pointer",
                isToday(day) ? "bg-primary/5 border-primary/20" : "",
                !isSameMonth(day, currentDate) && calendarView === "month" ? "opacity-40" : "",
                isWorkDayValue ? "bg-background" : "bg-muted/30",
                isStreakDayValue ? "ring-2 ring-green-500/50" : "",
                "hover:border-primary/40 hover:shadow-sm transition-all"
              )}
            >
              {/* Heatmap background */}
              <div 
                className={cn(
                  "absolute inset-0 opacity-30 rounded-md",
                  getHeatmapColor(performanceIntensity)
                )}
              />
              
              <div className="flex flex-col h-full relative">
                <div 
                  className={cn(
                    "absolute top-1 right-1.5 text-xs md:text-sm font-medium",
                    isToday(day) ? "text-primary" : "text-foreground/80"
                  )}
                >
                  {format(day, 'd')}
                </div>
                
                {isWorkDayValue && (
                  <div className="absolute bottom-1 left-1 text-[8px] md:text-[10px] bg-primary/10 rounded px-0.5 text-primary-foreground/90">
                    work day
                  </div>
                )}
                
                {/* Offer type color indicators */}
                {offerTypes.length > 0 && (
                  <div className="absolute bottom-5 left-1 flex flex-row gap-0.5">
                    {offerTypes.map((type, i) => (
                      <div 
                        key={type} 
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          type === "sales" ? "bg-green-500" :
                          type === "service" ? "bg-blue-500" :
                          type === "upsell" ? "bg-orange-500" :
                          type === "renewal" ? "bg-purple-500" :
                          "bg-gray-500"
                        )}
                      />
                    ))}
                  </div>
                )}
                
                {/* Converted indicator */}
                {hasConverted && (
                  <div className="absolute bottom-3 left-1">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                )}
                
                {/* Offer count */}
                {hasOffers && (
                  <div 
                    className={cn(
                      "absolute bottom-1 right-1 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center",
                      "rounded-full text-[10px] md:text-xs font-medium",
                      hasOffers ? "bg-green-500/90 text-white" : ""
                    )}
                  >
                    {dayOffers.length}
                  </div>
                )}
                
                {/* Followup indicator */}
                {hasFollowups && (
                  <div 
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 md:w-4 md:h-4 flex items-center justify-center",
                      "rounded-full text-[10px] md:text-xs font-medium",
                      "bg-blue-500/90 text-white"
                    )}
                  >
                    <Calendar className="h-2.5 w-2.5" />
                  </div>
                )}
                
                {/* Streak indicator */}
                {isStreakDayValue && !hasFollowups && (
                  <div 
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 md:w-4 md:h-4 flex items-center justify-center",
                      "rounded-full text-[10px] md:text-xs font-medium",
                      "bg-green-500/20 text-green-600 border border-green-500"
                    )}
                  >
                    🔥
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          
          <TooltipContent side="bottom" className="p-2 max-w-xs">
            <div className="text-sm font-medium mb-1">
              {format(day, 'EEEE, MMMM d, yyyy')}
            </div>
            
            {hasOffers && (
              <div className="mb-1">
                <span className="text-xs font-medium text-foreground/80">
                  {dayOffers.length} offer{dayOffers.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {hasFollowups && (
              <div className="mb-1">
                <span className="text-xs font-medium text-blue-500">
                  {dayFollowups.length} followup{dayFollowups.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {offerTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {offerTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-[10px] py-0">
                    {type}
                  </Badge>
                ))}
              </div>
            )}
            
            {isStreakDayValue && (
              <div className="mt-1 text-xs text-green-500 font-medium">
                🔥 Contributing to your streak
              </div>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              {calendarView === "week" ? 
                `Week of ${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}` :
                `${format(currentDate, 'MMMM yyyy')}`
              }
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* View toggle */}
          <div className="flex items-center justify-between">
            <ToggleGroup type="single" value={calendarView} onValueChange={(value) => value && setCalendarView(value as CalendarView)}>
              <ToggleGroupItem value="week" aria-label="Week view">
                <span className="text-xs">Week</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="month" aria-label="Month view">
                <span className="text-xs">Month</span>
              </ToggleGroupItem>
            </ToggleGroup>
            
            {streak > 0 && (
              <div className="text-xs font-medium text-green-500 flex items-center gap-1">
                <span>🔥 {streak} day streak</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Day headers */}
        <div className={calendarView === "month" && weeksToDisplay.length > 0 ? "ml-7" : ""}>
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                className={cn(
                  "text-xs font-medium text-muted-foreground",
                  isWorkDay(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)) 
                    ? "text-foreground/70" 
                    : ""
                )}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        
        {calendarView === "month" && weeksToDisplay.length > 0 ? (
          // Month view with week numbers
          <div className="grid grid-cols-[auto_1fr] gap-1">
            {/* Week numbers column */}
            <div className="space-y-1">
              {weeksToDisplay.map(weekDate => (
                <div 
                  key={weekDate.toString()} 
                  className="h-10 md:h-14 text-xs text-center text-muted-foreground flex items-center justify-center"
                >
                  {getWeek(weekDate)}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderDays()}
            </div>
          </div>
        ) : (
          // Week view (no week numbers)
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>
        )}
        
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-start gap-3 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-background border border-border/10 rounded-sm"></div>
            <span>Work day</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-muted/30 border border-border/10 rounded-sm"></div>
            <span>Off day</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 flex items-center justify-center bg-green-500/90 rounded-full text-[8px] text-white">
              1
            </div>
            <span>Offers made</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 flex items-center justify-center bg-blue-500/90 rounded-full">
              <Calendar className="h-2 w-2 text-white" />
            </div>
            <span>Followups</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" />
            <span>Conversion</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 flex items-center justify-center rounded-full bg-green-500/20 text-green-600 border border-green-500 text-[8px]">
              🔥
            </div>
            <span>Streak</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex space-x-0.5">
              {[1, 5, 10].map(i => (
                <div key={i} className={cn("w-2 h-2 rounded-sm", getHeatmapColor(i))}></div>
              ))}
            </div>
            <span>Activity level</span>
          </div>
        </div>
      </CardContent>
      
      {/* Day detail dialog */}
      <Dialog open={!!selectedDay} onOpenChange={(open) => {
        if (!open) setSelectedDay(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              {/* Streak info */}
              {isStreakDay(selectedDay) && (
                <div className="p-2 bg-green-500/10 rounded-md">
                  <div className="flex items-center gap-1 text-sm text-green-700">
                    <span>🔥</span>
                    <span>This day contributed to your current streak of {streak} days</span>
                  </div>
                </div>
              )}
              
              {/* Offers section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Offers</h3>
                {getOffersForDay(selectedDay).length > 0 ? (
                  <div className="space-y-2">
                    {getOffersForDay(selectedDay).map(offer => (
                      <div key={offer.id} className="p-2 bg-muted/20 rounded-md text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">#{offer.caseNumber}</div>
                            <div className="text-xs text-muted-foreground">{offer.channel} • {offer.offerType}</div>
                          </div>
                          {(offer.converted || offer.isConverted) && (
                            <Badge variant="outline" className="text-[10px] text-green-500 bg-green-500/10">Converted</Badge>
                          )}
                        </div>
                        {offer.notes && (
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{offer.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No offers for this day</div>
                )}
              </div>
              
              {/* Followups section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Followups</h3>
                {getFollowupsForDay(selectedDay).length > 0 ? (
                  <div className="space-y-2">
                    {getFollowupsForDay(selectedDay).map(offer => {
                      // Find the specific followup for this day
                      const specificFollowup = offer.followups?.find(f => 
                        !f.completed && f.date.split('T')[0] === format(selectedDay, 'yyyy-MM-dd')
                      );
                      
                      return (
                        <div key={offer.id} className="p-2 bg-blue-500/5 rounded-md text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">#{offer.caseNumber}</div>
                              <div className="text-xs text-muted-foreground">{offer.channel} • {offer.offerType}</div>
                            </div>
                            <Badge variant="outline" className="text-xs bg-blue-500/10">Followup</Badge>
                          </div>
                          {specificFollowup?.notes && (
                            <div className="mt-1 text-xs text-muted-foreground">{specificFollowup.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No followups for this day</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 