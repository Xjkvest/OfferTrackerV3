import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { getDayName } from "@/utils/streakCalculation";
import { cn } from "@/lib/utils";

export function DailyGoalsSetup({ onNext }: { onNext: () => void }) {
  const { dailyGoal, setDailyGoal, settings, updateSettings } = useUser();
  const [localDailyGoal, setLocalDailyGoal] = useState(dailyGoal);
  const [workdays, setWorkdays] = useState<number[]>(
    settings.streakSettings.workdays || [1, 2, 3, 4, 5]
  );

  const handleGoalChange = (newGoal: number) => {
    setLocalDailyGoal(newGoal);
  };

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
      return;
    }
    
    setWorkdays(newWorkdays);
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
  };

  const handleNext = () => {
    setDailyGoal(localDailyGoal);
    
    // Update streak work days settings
    updateSettings({
      streakSettings: {
        ...settings.streakSettings,
        workdays: workdays
      }
    });
    
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Set Your Daily Goal</h2>
        <p className="text-muted-foreground">
          How many offers would you like to make each work day?
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center items-center gap-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full" 
            onClick={() => handleGoalChange(Math.max(1, localDailyGoal - 1))}
            disabled={localDailyGoal <= 1}
          >
            -
          </Button>
          <div className="text-4xl font-bold w-16 text-center">
            {localDailyGoal}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full" 
            onClick={() => handleGoalChange(Math.min(30, localDailyGoal + 1))}
            disabled={localDailyGoal >= 30}
          >
            +
          </Button>
        </div>
        
        <div className="text-center text-muted-foreground">
          {localDailyGoal === 1 ? (
            <p>Start with something manageable</p>
          ) : localDailyGoal <= 5 ? (
            <p>A solid goal for consistent results</p>
          ) : localDailyGoal <= 10 ? (
            <p>Ready for some impressive results!</p>
          ) : (
            <p>You're really aiming high!</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4 pt-4">
        <div>
          <Label className="text-base">Select Your Work Days</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Which days do you typically work? These days will count for your streak.
          </p>
        </div>
        
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

      <Button onClick={handleNext} className="w-full">
        Continue
      </Button>
    </div>
  );
} 
 
 