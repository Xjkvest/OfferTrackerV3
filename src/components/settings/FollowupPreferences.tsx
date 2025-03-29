
import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export function FollowupPreferences() {
  const { settings, updateSettings } = useUser();
  
  const [enableNudges, setEnableNudges] = useState(settings.enableFollowupNudges);
  const [defaultFollowupTime, setDefaultFollowupTime] = useState(settings.defaultFollowupTime);
  
  const handleToggleNudges = (checked: boolean) => {
    setEnableNudges(checked);
    updateSettings({ enableFollowupNudges: checked });
    toast({
      title: "Follow-up Nudges",
      description: checked ? "Follow-up nudges have been enabled." : "Follow-up nudges have been disabled.",
    });
  };
  
  const handleFollowupTimeChange = (value: "24" | "48" | "72" | "168") => {
    setDefaultFollowupTime(value);
    updateSettings({ defaultFollowupTime: value });
    toast({
      title: "Default Follow-up Time Updated",
      description: "Your default follow-up time has been saved.",
    });
  };

  return (
    <Card className="rounded-2xl bg-muted/10 p-2 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-bold text-teal-600 dark:text-teal-400">Follow-up Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="followupTime">Default Follow-up Time</Label>
          <Select value={defaultFollowupTime} onValueChange={handleFollowupTimeChange}>
            <SelectTrigger id="followupTime" className="bg-background/50 w-full">
              <SelectValue placeholder="Select default follow-up time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 hours</SelectItem>
              <SelectItem value="48">48 hours</SelectItem>
              <SelectItem value="72">3 days</SelectItem>
              <SelectItem value="168">1 week</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Sets the default follow-up time when creating new offers
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="followupNudges" 
              checked={enableNudges}
              onCheckedChange={handleToggleNudges}
            />
            <Label htmlFor="followupNudges">Enable Follow-up Nudges</Label>
          </div>
          <p className="text-sm text-muted-foreground pl-7">
            Shows reminders for pending follow-ups in the app interface
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
