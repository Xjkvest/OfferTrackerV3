
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutGrid, MonitorSmartphone, Moon, Sun } from "lucide-react";

export function AppearanceLayout() {
  const { 
    fontSize, 
    setFontSize, 
    appDensity, 
    setAppDensity,
    showAppearancePreview,
    setShowAppearancePreview 
  } = useTheme();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-blue-500" />
          Appearance & Layout
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
            value={fontSize}
            onValueChange={setFontSize}
            className="grid grid-cols-3 gap-4"
          >
            <div className="cursor-pointer">
              <RadioGroupItem
                value="text-sm"
                id="text-sm"
                className="peer sr-only"
              />
              <Label
                htmlFor="text-sm"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-sm">Small</span>
              </Label>
            </div>
            
            <div className="cursor-pointer">
              <RadioGroupItem
                value="text-base"
                id="text-base"
                className="peer sr-only"
              />
              <Label
                htmlFor="text-base"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-base">Medium</span>
              </Label>
            </div>
            
            <div className="cursor-pointer">
              <RadioGroupItem
                value="text-lg"
                id="text-lg"
                className="peer sr-only"
              />
              <Label
                htmlFor="text-lg"
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
            value={appDensity}
            onValueChange={setAppDensity}
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
