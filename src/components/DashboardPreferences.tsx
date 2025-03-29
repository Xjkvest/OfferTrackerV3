
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Save, Layout, LayoutGrid, Trello, ClipboardList } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface DashboardPreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define types for dashboard elements
interface DashboardElement {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  isCore?: boolean;
  dependsOn?: string;
}

// Define the progress group and independent elements with proper typing
const PROGRESS_GROUP_ID = 'progressGroup';
const INDEPENDENT_ELEMENTS: DashboardElement[] = [
  { 
    id: 'followups', 
    label: 'Follow-ups List', 
    description: 'Shows upcoming follow-ups that need attention',
    icon: <ClipboardList className="h-4 w-4 text-indigo-500" />
  },
  { 
    id: 'recentOffers', 
    label: 'Recent Offers', 
    description: 'Displays your most recently added offers',
    icon: <Trello className="h-4 w-4 text-emerald-500" />
  },
  { 
    id: 'analytics', 
    label: 'Analytics Teaser', 
    description: 'Preview of your performance insights',
    icon: <Layout className="h-4 w-4 text-blue-500" />
  },
];

// All dashboard elements including the core group components
const DASHBOARD_ELEMENTS: DashboardElement[] = [
  { 
    id: 'progress', 
    label: 'Progress Section', 
    description: 'Shows your daily progress and goal completion',
    icon: <LayoutGrid className="h-4 w-4 text-purple-500" />,
    isCore: true 
  },
  { 
    id: 'metrics', 
    label: 'Key Metrics', 
    description: 'Displays important metrics about your offers',
    icon: <LayoutGrid className="h-4 w-4 text-purple-500" />,
    isCore: true, 
    dependsOn: 'progress' 
  },
  { 
    id: 'newOfferForm', 
    label: 'Quick Log Offer Form', 
    description: 'Enables adding new offers directly from dashboard',
    icon: <LayoutGrid className="h-4 w-4 text-purple-500" />,
    isCore: true, 
    dependsOn: 'progress' 
  },
  ...INDEPENDENT_ELEMENTS
];

export function DashboardPreferences({ open, onOpenChange }: DashboardPreferencesProps) {
  const { dashboardElements, setDashboardElements, dashboardElementsOrder, setDashboardElementsOrder } = useUser();
  const [localElements, setLocalElements] = useState<string[]>([]);
  
  useEffect(() => {
    if (open) {
      setLocalElements([...dashboardElements]);
    }
  }, [dashboardElements, open]);
  
  const handleToggle = (elementId: string, isCore: boolean = false) => {
    let newElements = [...localElements];
    
    if (isCore) {
      if (elementId === 'progress') {
        // If toggling off the main progress section, remove all core elements
        if (localElements.includes('progress')) {
          newElements = newElements.filter(id => !['progress', 'metrics', 'newOfferForm'].includes(id));
        } else {
          // If toggling on the main progress section, add all previously enabled core elements
          newElements.push('progress');
          if (dashboardElements.includes('metrics')) newElements.push('metrics');
          if (dashboardElements.includes('newOfferForm')) newElements.push('newOfferForm');
        }
      } else {
        // For metrics and newOfferForm, they depend on progress
        if (localElements.includes(elementId)) {
          newElements = newElements.filter(id => id !== elementId);
        } else {
          if (!localElements.includes('progress')) {
            // If progress is not enabled, enable it first
            newElements.push('progress');
          }
          newElements.push(elementId);
        }
      }
    } else {
      // For independent elements, simple toggle
      if (localElements.includes(elementId)) {
        newElements = newElements.filter(id => id !== elementId);
      } else {
        newElements.push(elementId);
      }
    }
    
    setLocalElements(newElements);
  };
  
  const handleSave = () => {
    setDashboardElements(localElements);
    onOpenChange(false);
    toast({
      title: "Dashboard Updated",
      description: "Your dashboard preferences have been saved.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm border-white/10 dark:border-white/5 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Dashboard Preferences</DialogTitle>
            <DialogDescription>
              Enable or disable dashboard elements. You can rearrange them by dragging and dropping directly on the dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <h3 className="font-medium text-sm bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">Progress Section Group</h3>
              <p className="text-xs text-muted-foreground">These components are grouped together</p>
              
              <div className="space-y-2 border border-border/40 rounded-md p-3 bg-secondary/10">
                {DASHBOARD_ELEMENTS.filter(e => e.isCore).map((element) => (
                  <motion.div 
                    key={element.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center space-x-3 py-2 px-2 rounded-md hover:bg-secondary/20"
                  >
                    <div className="flex-shrink-0">{element.icon}</div>
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={`toggle-${element.id}`} className="cursor-pointer font-medium">
                        {element.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">{element.description}</p>
                    </div>
                    <Switch 
                      id={`toggle-${element.id}`}
                      checked={localElements.includes(element.id)}
                      onCheckedChange={() => handleToggle(element.id, true)}
                      disabled={element.dependsOn && !localElements.includes(element.dependsOn)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <Separator className="my-2" />
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">Independent Components</h3>
              <p className="text-xs text-muted-foreground">These components can be reordered by drag and drop</p>
              
              <div className="space-y-2 border border-border/40 rounded-md p-3 bg-secondary/10">
                {INDEPENDENT_ELEMENTS.map((element) => (
                  <motion.div 
                    key={element.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center space-x-3 py-2 px-2 rounded-md hover:bg-secondary/20"
                  >
                    <div className="flex-shrink-0">{element.icon}</div>
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={`toggle-${element.id}`} className="cursor-pointer font-medium">
                        {element.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">{element.description}</p>
                    </div>
                    <Switch 
                      id={`toggle-${element.id}`}
                      checked={localElements.includes(element.id)}
                      onCheckedChange={() => handleToggle(element.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
