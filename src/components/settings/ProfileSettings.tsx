
import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export function ProfileSettings() {
  const { userName, setUserName, dailyGoal, setDailyGoal, settings, updateSettings } = useUser();
  
  const [nameInput, setNameInput] = useState(userName);
  const [goalInput, setGoalInput] = useState(dailyGoal);
  const [greetingStyle, setGreetingStyle] = useState(settings.greetingStyle);
  
  // Autosave name when it changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (nameInput.trim() && nameInput !== userName) {
        setUserName(nameInput.trim());
        toast({
          title: "Name Updated",
          description: "Your name has been updated.",
        });
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [nameInput, userName, setUserName]);
  
  // Autosave goal when it changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (goalInput !== dailyGoal) {
        setDailyGoal(goalInput);
        toast({
          title: "Goal Updated",
          description: `Your daily offer goal has been set to ${goalInput}.`,
        });
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [goalInput, dailyGoal, setDailyGoal]);
  
  const handleGreetingChange = (value: "auto" | "fixed" | "none") => {
    setGreetingStyle(value);
    updateSettings({ greetingStyle: value });
    toast({
      title: "Greeting Style Updated",
      description: "Your greeting style preference has been saved.",
    });
  };

  return (
    <Card className="rounded-2xl bg-muted/10 p-2 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-bold text-blue-600 dark:text-blue-400">Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter your name"
            className="bg-background/50 w-full"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="dailyGoal">Daily Offer Goal: {goalInput}</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Slider
              id="dailyGoal"
              value={[goalInput]}
              onValueChange={(values) => setGoalInput(values[0])}
              min={1}
              max={20}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(parseInt(e.target.value) || 1)}
              className="w-16 text-center"
              min={1}
              max={20}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Sets your target number of offers to track each day
          </p>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="greetingStyle">Greeting Style</Label>
          <Select value={greetingStyle} onValueChange={handleGreetingChange}>
            <SelectTrigger id="greetingStyle" className="bg-background/50 w-full">
              <SelectValue placeholder="Select greeting style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (based on time of day)</SelectItem>
              <SelectItem value="fixed">Fixed ("Hi [Name]")</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Controls how the app greets you on the dashboard
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
