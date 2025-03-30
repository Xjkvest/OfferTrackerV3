import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DashboardPreferences as DashboardPreferencesDialog } from "@/components/DashboardPreferences";
import { toast } from "@/hooks/use-toast";
import { LayoutDashboard, Sparkles, Gauge, Activity, Calendar } from "lucide-react";

export function DashboardPreferences() {
  const { settings, updateSettings, dashboardElements, setDashboardElements, dashboardElementsOrder, setDashboardElementsOrder } = useUser();
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  
  const [showStreaks, setShowStreaks] = useState(settings.showOfferStreaks);
  const [showMotivational, setShowMotivational] = useState(settings.showMotivationalMessages);
  const [showCalendar, setShowCalendar] = useState(dashboardElements.includes('calendar'));
  
  // Handle resetting the dashboard layout to the recommended order
  const handleResetLayout = () => {
    // Recommended dashboard order
    const recommendedOrder = ['followups', 'progress', 'calendar', 'recentOffers', 'analytics'];
    
    // Ensure all enabled elements are included in the order
    const currentEnabled = [...dashboardElements];
    const newOrder = [...recommendedOrder];
    
    // Add any enabled elements that aren't in the recommended order
    currentEnabled.forEach(element => {
      if (!newOrder.includes(element) && element !== 'metrics' && element !== 'newOfferForm') {
        newOrder.push(element);
      }
    });
    
    // Update the order
    setDashboardElementsOrder(newOrder);
    
    toast({
      title: "Dashboard Layout Reset",
      description: "Your dashboard layout has been reset to the recommended order.",
    });
  };
  
  const handleToggleStreaks = (checked: boolean) => {
    setShowStreaks(checked);
    updateSettings({ showOfferStreaks: checked });
    toast({
      title: "Dashboard Setting Updated",
      description: `Offer Streaks will ${checked ? "be shown" : "not be shown"} on your dashboard.`,
    });
  };
  
  const handleToggleMotivational = (checked: boolean) => {
    setShowMotivational(checked);
    updateSettings({ showMotivationalMessages: checked });
    toast({
      title: "Dashboard Setting Updated",
      description: `Motivational messages will ${checked ? "be shown" : "not be shown"} on your dashboard.`,
    });
  };
  
  const handleToggleCalendar = (checked: boolean) => {
    setShowCalendar(checked);
    
    // Update dashboard elements
    if (checked && !dashboardElements.includes('calendar')) {
      setDashboardElements([...dashboardElements, 'calendar']);
      toast({
        title: "Dashboard Element Added",
        description: "Calendar view will now be shown on your dashboard.",
      });
    } else if (!checked && dashboardElements.includes('calendar')) {
      setDashboardElements(dashboardElements.filter(item => item !== 'calendar'));
      toast({
        title: "Dashboard Element Removed",
        description: "Calendar view has been removed from your dashboard.",
      });
    }
  };

  return (
    <>
      <Card className="rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 p-2 shadow-sm border border-border/40">
        <CardHeader className="py-4">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-purple-500" />
            Dashboard Preferences
          </CardTitle>
          <CardDescription>
            Customize your dashboard experience and layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="streaks" 
                checked={showStreaks}
                onCheckedChange={handleToggleStreaks}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="streaks" className="font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  Show Offer Streaks
                </Label>
                <p className="text-sm text-muted-foreground">
                  Displays your current and best offer tracking streaks
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="motivational" 
                checked={showMotivational}
                onCheckedChange={handleToggleMotivational}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="motivational" className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Show Motivational Messages
                </Label>
                <p className="text-sm text-muted-foreground">
                  Displays encouraging messages based on your performance
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="calendar" 
                checked={showCalendar}
                onCheckedChange={handleToggleCalendar}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="calendar" className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  Show Calendar View
                </Label>
                <p className="text-sm text-muted-foreground">
                  Displays a calendar with your work days and offer counts
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="grid gap-1.5 leading-none">
                <Label className="font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-emerald-500" />
                  Dashboard Elements
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose which elements appear on your dashboard
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleResetLayout}
                >
                  Reset Layout
                </Button>
                <Button 
                  onClick={() => setShowPreferencesDialog(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Customize
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DashboardPreferencesDialog 
        open={showPreferencesDialog} 
        onOpenChange={setShowPreferencesDialog} 
      />
    </>
  );
}
