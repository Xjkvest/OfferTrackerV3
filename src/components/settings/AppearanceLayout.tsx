import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutGrid, MonitorSmartphone, Moon, Sun } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AppearanceLayout() {
  const { 
    appDensity, 
    setAppDensity,
    showAppearancePreview,
    setShowAppearancePreview 
  } = useTheme();
  
  const { settings, updateSettings } = useUser();

  // Convert between UserContext font size format and ThemeContext format
  const fontSizeToClass = {
    small: "text-sm",
    medium: "text-base", 
    large: "text-lg"
  } as const;

  const classToFontSize = {
    "text-sm": "small",
    "text-base": "medium",
    "text-lg": "large"
  } as const;

  const handleFontSizeChange = (newSize: "small" | "medium" | "large") => {
    updateSettings({ fontSizePreference: newSize });
    
    // Also update ThemeContext for immediate effect
    const className = fontSizeToClass[newSize];
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    document.documentElement.classList.add(className);
    
    toast({
      title: "Font Size Updated",
      description: `Font size has been set to ${newSize}.`,
    });
  };

  // Convert UserContext density format to ThemeContext format
  const densityToClass = {
    compact: "density-compact",
    comfortable: "density-comfortable",
    cozy: "density-cozy"
  } as const;

  const handleDensityChange = (newDensity: "density-compact" | "density-comfortable" | "density-cozy") => {
    const userDensity = newDensity.replace("density-", "") as "compact" | "comfortable" | "cozy";
    updateSettings({ dashboardDensity: userDensity });
    setAppDensity(newDensity);
    
    toast({
      title: "UI Density Updated", 
      description: `Interface density has been set to ${userDensity}.`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-blue-500" />
          Appearance
        </CardTitle>
        <CardDescription>
          Customize the visual appearance of the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Theme</Label>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Font Size</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust the size of text throughout the app
            </p>
          </div>
          
          <RadioGroup
            value={settings.fontSizePreference}
            onValueChange={handleFontSizeChange}
            className="grid grid-cols-3 gap-4"
          >
            <div className="cursor-pointer">
              <RadioGroupItem
                value="small"
                id="small"
                className="peer sr-only"
              />
              <Label
                htmlFor="small"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-sm">Small</span>
              </Label>
            </div>
            
            <div className="cursor-pointer">
              <RadioGroupItem
                value="medium"
                id="medium"
                className="peer sr-only"
              />
              <Label
                htmlFor="medium"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-base">Medium</span>
              </Label>
            </div>
            
            <div className="cursor-pointer">
              <RadioGroupItem
                value="large"
                id="large"
                className="peer sr-only"
              />
              <Label
                htmlFor="large"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-lg">Large</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">UI Density</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Control how compact or spacious the interface feels
            </p>
          </div>
          
          <RadioGroup
            value={densityToClass[settings.dashboardDensity]}
            onValueChange={handleDensityChange}
            className="grid grid-cols-3 gap-4"
          >
            <div className="cursor-pointer">
              <RadioGroupItem
                value="density-compact"
                id="density-compact"
                className="peer sr-only"
              />
              <Label
                htmlFor="density-compact"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-xs mb-1">Compact</span>
                <div className="w-full space-y-1">
                  <div className="w-full h-1.5 bg-primary/20 rounded-full" />
                  <div className="w-full h-1.5 bg-primary/20 rounded-full" />
                  <div className="w-full h-1.5 bg-primary/20 rounded-full" />
                </div>
              </Label>
            </div>
            
            <div className="cursor-pointer">
              <RadioGroupItem
                value="density-comfortable"
                id="density-comfortable"
                className="peer sr-only"
              />
              <Label
                htmlFor="density-comfortable"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-xs mb-1">Comfortable</span>
                <div className="w-full space-y-2">
                  <div className="w-full h-2 bg-primary/20 rounded-full" />
                  <div className="w-full h-2 bg-primary/20 rounded-full" />
                  <div className="w-full h-2 bg-primary/20 rounded-full" />
                </div>
              </Label>
            </div>
            
            <div className="cursor-pointer">
              <RadioGroupItem
                value="density-cozy"
                id="density-cozy"
                className="peer sr-only"
              />
              <Label
                htmlFor="density-cozy"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-xs mb-1">Cozy</span>
                <div className="w-full space-y-3">
                  <div className="w-full h-2.5 bg-primary/20 rounded-full" />
                  <div className="w-full h-2.5 bg-primary/20 rounded-full" />
                  <div className="w-full h-2.5 bg-primary/20 rounded-full" />
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
