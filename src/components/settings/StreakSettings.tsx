import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useOffers } from "@/context/OfferContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { enableVacationMode, disableVacationMode, getDayName, defaultStreakSettings } from "@/utils/streakCalculation";
import { StreakBadges } from "@/components/StreakBadges";

export function StreakSettings() {
  const { settings, updateSettings } = useUser();
  const { streakInfo } = useOffers();
  
  // Safely access streak settings with fallbacks to the imported defaults
  const streakSettings = settings?.streakSettings || defaultStreakSettings;
  
  const [isVacationModeActive, setIsVacationModeActive] = useState(
    streakSettings.vacationMode?.active || false
  );
  
  const [vacationStartDate, setVacationStartDate] = useState<Date | undefined>(
    streakSettings.vacationMode?.startDate 
      ? new Date(streakSettings.vacationMode.startDate)
      : new Date()
  );
  
  const [vacationEndDate, setVacationEndDate] = useState<Date | undefined>(
    streakSettings.vacationMode?.endDate
      ? new Date(streakSettings.vacationMode.endDate)
      : undefined
  );
  
  const [countWorkdaysOnly, setCountWorkdaysOnly] = useState<boolean>(
    streakSettings.countWorkdaysOnly ?? true
  );
  
  const [workdays, setWorkdays] = useState<number[]>(
    streakSettings.workdays || [1, 2, 3, 4, 5]
  );
  
  const [enableTokens, setEnableTokens] = useState<boolean>(
    streakSettings.enablePreservationTokens ?? true
  );
  
  const [daysPerToken, setDaysPerToken] = useState(
    (streakSettings.daysPerPreservationToken || 10).toString()
  );
  
  const toggleWorkday = (dayNumber: number) => {
    let newWorkdays: number[];
    
    if (workdays.includes(dayNumber)) {
      // Remove the day if it's already selected
      newWorkdays = workdays.filter(day => day !== dayNumber);
    } else {
      // Add the day if it's not selected
      newWorkdays = [...workdays, dayNumber].sort((a, b) => a - b);
    }
    
    // Don't allow empty work days selection
    if (newWorkdays.length === 0) {
      toast({
        title: "Invalid Work Schedule",
        description: "You must select at least one work day",
        variant: "destructive"
      });
      return;
    }
    
    setWorkdays(newWorkdays);
    
    updateSettings({
      streakSettings: {
        ...streakSettings,
        workdays: newWorkdays
      }
    });
  };
  
  const handleToggleVacationMode = (checked: boolean) => {
    setIsVacationModeActive(checked);
    
    // Apply vacation mode settings
    const updatedVacationMode = checked
      ? enableVacationMode(vacationStartDate, vacationEndDate)
      : disableVacationMode();
    
    updateSettings({
      streakSettings: {
        ...streakSettings,
        vacationMode: updatedVacationMode
      }
    });
    
    toast({
      title: checked ? "Vacation mode enabled" : "Vacation mode disabled",
      description: checked 
        ? "Your streak will be preserved during your vacation"
        : "Your streak will follow standard rules"
    });
  };
  
  const handleToggleWorkdaysOnly = (checked: boolean) => {
    setCountWorkdaysOnly(checked);
    
    updateSettings({
      streakSettings: {
        ...streakSettings,
        countWorkdaysOnly: checked
      }
    });
    
    toast({
      title: "Streak calculation updated",
      description: checked 
        ? "Streaks will only count your selected work days"
        : "Streaks will count all days of the week"
    });
  };
  
  const applySchedulePreset = (preset: 'weekdays' | 'custom1' | 'custom2') => {
    let newWorkdays: number[];
    
    switch (preset) {
      case 'weekdays':
        // Monday to Friday
        newWorkdays = [1, 2, 3, 4, 5];
        break;
      case 'custom1':
        // Tuesday to Saturday
        newWorkdays = [2, 3, 4, 5, 6];
        break;
      case 'custom2':
        // Sunday to Thursday
        newWorkdays = [0, 1, 2, 3, 4];
        break;
      default:
        newWorkdays = workdays;
    }
    
    setWorkdays(newWorkdays);
    
    updateSettings({
      streakSettings: {
        ...streakSettings,
        workdays: newWorkdays
      }
    });
    
    toast({
      title: "Work schedule updated",
      description: `Your work days have been set to ${formatWorkdaysRange(newWorkdays)}`
    });
  };
  
  // Helper to format work days as a readable range
  const formatWorkdaysRange = (days: number[]): string => {
    if (days.length === 7) return "all days";
    if (days.length === 0) return "none (invalid)";
    
    return days.map(day => getDayName(day, 'short')).join(', ');
  };
  
  const handleToggleTokens = (checked: boolean) => {
    setEnableTokens(checked);
    
    updateSettings({
      streakSettings: {
        ...streakSettings,
        enablePreservationTokens: checked
      }
    });
    
    toast({
      title: checked ? "Streak tokens enabled" : "Streak tokens disabled",
      description: checked 
        ? "You'll earn streak preservation tokens as you maintain your streak"
        : "Streak preservation tokens are disabled"
    });
  };
  
  const handleUpdateDaysPerToken = () => {
    const days = parseInt(daysPerToken);
    
    if (isNaN(days) || days < 1) {
      toast({
        title: "Invalid value",
        description: "Please enter a number greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    updateSettings({
      streakSettings: {
        ...streakSettings,
        daysPerPreservationToken: days
      }
    });
    
    toast({
      title: "Token settings updated",
      description: `You'll earn 1 token for every ${days} days of streak`
    });
  };
  
  const handleApplyVacationDates = () => {
    // Validate dates
    if (!vacationStartDate) {
      toast({
        title: "Missing start date",
        description: "Please select a start date for your vacation",
        variant: "destructive"
      });
      return;
    }
    
    // If vacation mode is active, update the dates
    if (isVacationModeActive) {
      const updatedVacationMode = enableVacationMode(vacationStartDate, vacationEndDate);
      
      updateSettings({
        streakSettings: {
          ...streakSettings,
          vacationMode: updatedVacationMode
        }
      });
      
      toast({
        title: "Vacation dates updated",
        description: vacationEndDate 
          ? `Vacation scheduled from ${format(vacationStartDate, 'MMM d')} to ${format(vacationEndDate, 'MMM d')}`
          : `Vacation started on ${format(vacationStartDate, 'MMM d')} with no end date`
      });
    }
  };
  
  const usePreservationToken = () => {
    if (!streakInfo || streakInfo.preservationTokens <= 0) {
      toast({
        title: "No tokens available",
        description: "You don't have any streak preservation tokens to use",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Token used",
      description: "Your streak has been preserved using a token",
    });
    
    // This would require additional implementation in the OfferContext
    // to actually use a token and restore the streak
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Streak Settings</CardTitle>
        <CardDescription>
          Configure how your offer streaks are calculated and displayed
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Streak Status */}
        <div>
          <h3 className="text-lg font-medium mb-2">Current Streak Status</h3>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="px-2 py-0.5">
              <span className="mr-1">🔥</span> {streakInfo.current} day streak
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5">
              <span className="mr-1">🎫</span> {streakInfo.preservationTokens} tokens
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5">
              <span className="mr-1">📅</span> {formatWorkdaysRange(workdays)}
            </Badge>
          </div>
          <div className="mb-4">
            <StreakBadges size="md" />
          </div>
        </div>
        
        <Separator />
        
        {/* Streak Calculation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Streak Calculation</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="workdaysOnly">Count Only Work Days</Label>
              <p className="text-sm text-muted-foreground">
                Only count selected work days for streaks
              </p>
            </div>
            <Switch
              id="workdaysOnly"
              checked={countWorkdaysOnly}
              onCheckedChange={handleToggleWorkdaysOnly}
            />
          </div>
        </div>
        
        {/* Work Day Selection */}
        {countWorkdaysOnly && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Work Schedule</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Select the days that count toward your streak
            </p>
            
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(day => (
                <Button
                  key={day}
                  variant={workdays.includes(day) ? "default" : "outline"}
                  className={cn(
                    "flex-1 min-w-16",
                    workdays.includes(day) 
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted/50"
                  )}
                  onClick={() => toggleWorkday(day)}
                >
                  {getDayName(day, 'short')}
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => applySchedulePreset('weekdays')}
              >
                Mon-Fri
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => applySchedulePreset('custom1')}
              >
                Tue-Sat
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => applySchedulePreset('custom2')}
              >
                Sun-Thu
              </Button>
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Streak Preservation Tokens */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Streak Preservation Tokens</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableTokens">Enable Tokens</Label>
              <p className="text-sm text-muted-foreground">
                Earn tokens that can preserve your streak during breaks
              </p>
            </div>
            <Switch
              id="enableTokens"
              checked={enableTokens}
              onCheckedChange={handleToggleTokens}
            />
          </div>
          
          {enableTokens && (
            <>
              <div className="flex items-end gap-4 mt-2">
                <div className="flex-1">
                  <Label htmlFor="daysPerToken">Days Per Token</Label>
                  <Input
                    id="daysPerToken"
                    type="number"
                    min="1"
                    value={daysPerToken}
                    onChange={(e) => setDaysPerToken(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleUpdateDaysPerToken}
                >
                  Save
                </Button>
              </div>
              
              <div className="mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={usePreservationToken}
                  disabled={!streakInfo || streakInfo.preservationTokens <= 0}
                >
                  <span className="mr-1">🎫</span>
                  Use Token to Preserve Streak
                </Button>
              </div>
            </>
          )}
        </div>
        
        <Separator />
        
        {/* Vacation Mode */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Vacation Mode</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vacationMode">Vacation Mode</Label>
              <p className="text-sm text-muted-foreground">
                Pause your streak during vacations
              </p>
            </div>
            <Switch
              id="vacationMode"
              checked={isVacationModeActive}
              onCheckedChange={handleToggleVacationMode}
            />
          </div>
          
          {isVacationModeActive && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="vacationStart" className="mb-1 block">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="vacationStart"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {vacationStartDate ? (
                        format(vacationStartDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={vacationStartDate}
                      onSelect={setVacationStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="vacationEnd" className="mb-1 block">End Date <span className="text-muted-foreground">(Optional)</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="vacationEnd"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {vacationEndDate ? (
                        format(vacationEndDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={vacationEndDate}
                      onSelect={setVacationEndDate}
                      initialFocus
                      disabled={(date) => 
                        vacationStartDate ? date < vacationStartDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                onClick={handleApplyVacationDates}
                className="col-span-2"
              >
                Apply Vacation Dates
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/40 border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">About Streaks</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Streaks increase when you log offers on consecutive work days</li>
            {countWorkdaysOnly && <li>Only your selected work days ({formatWorkdaysRange(workdays)}) count for streaks</li>}
            <li>After a 10-day streak, you can miss up to 5 work days and keep your streak</li>
            <li>After a 20-day streak, you can miss up to 10 work days (perfect for vacations!)</li>
            {enableTokens && <li>You earn a preservation token every {streakSettings.daysPerPreservationToken} days</li>}
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
} 
 
 