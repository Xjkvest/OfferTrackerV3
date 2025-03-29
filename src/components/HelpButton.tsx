import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Info, 
  X, 
  Home, 
  Settings2, 
  LineChart, 
  ClipboardList,
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  CheckCircle, 
  XCircle,
  Bell,
  RefreshCw,
  Calendar,
  MessageSquare,
  Eye,
  Keyboard,
  Edit,
  PlusCircle,
  Search,
  Filter,
  Download,
  Trash,
  Gauge,
  Layout,
  Palette,
  UserCircle
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface HelpButtonRef {
  open: () => void;
}

interface HelpButtonProps {
  asPopover?: boolean;
  className?: string;
}

// Create a global ref that can be imported to trigger the help dialog
const globalHelpButtonRef = {
  current: null as HelpButtonRef | null
};

export function openHelp() {
  if (globalHelpButtonRef.current) {
    globalHelpButtonRef.current.open();
  }
}

export const HelpButton = forwardRef<HelpButtonRef, HelpButtonProps>(
  ({ asPopover = true, className }, ref) => {
    const [open, setOpen] = useState(false);
    const popoverTriggerRef = useRef<HTMLButtonElement>(null);
    const sheetTriggerRef = useRef<HTMLButtonElement>(null);
    
    // Expose methods that can be called from outside
    useImperativeHandle(ref, () => ({
      open: () => {
        if (asPopover) {
          popoverTriggerRef.current?.click();
        } else {
          setOpen(true);
        }
      }
    }));
    
    // Set the global ref to this instance
    React.useEffect(() => {
      globalHelpButtonRef.current = {
        open: () => {
          if (asPopover) {
            popoverTriggerRef.current?.click();
          } else {
            setOpen(true);
          }
        }
      };
      
      return () => {
        globalHelpButtonRef.current = null;
      };
    }, [asPopover, ref]);

    const HelpContent = (
      <Tabs defaultValue="welcome" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[85vh] md:h-[65vh] pr-4">
          {/* Welcome Tab */}
          <TabsContent value="welcome" className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text mb-2">Welcome to OfferTracker</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your personal assistant for monitoring offers, tracking satisfaction, and analyzing your performance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard 
                icon={<Gauge className="h-5 w-5 text-blue-500" />}
                title="Track Your Progress"
                description="Monitor daily goals, visualize trends, and see how you're improving over time."
              />
              
              <FeatureCard 
                icon={<LineChart className="h-5 w-5 text-indigo-500" />}
                title="Analyze Performance"
                description="Get insights into your most effective channels and offer types."
              />
              
              <FeatureCard 
                icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
                title="Conversion Tracking"
                description="Record which offers convert and understand your success patterns."
              />
              
              <FeatureCard 
                icon={<ThumbsUp className="h-5 w-5 text-amber-500" />}
                title="CSAT Measurement"
                description="Track customer satisfaction to improve your approach."
              />
            </div>
            
            <div className="bg-muted/40 rounded-lg p-4 border border-border">
              <h3 className="text-md font-medium mb-2 flex items-center">
                <Keyboard className="h-4 w-4 mr-2 text-blue-500" />
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <ShortcutItem keys="⌘ N" description="Create new offer" />
                <ShortcutItem keys="⌘ O" description="Quick log offer" />
                <ShortcutItem keys="⌘ ," description="Open preferences" />
                <ShortcutItem keys="⌘ /" description="Open this help" />
              </div>
            </div>
          </TabsContent>
          
          {/* Interface Tab */}
          <TabsContent value="interface" className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Understanding the Interface</h3>
            
            <div className="space-y-5">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Layout className="h-4 w-4 mr-2 text-blue-500" />
                  Dashboard Layout
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  The dashboard is your central hub with customizable widgets:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-6">
                  <li className="flex items-start">
                    <span className="bg-blue-500/10 p-1 rounded mr-2 mt-0.5">
                      <Gauge className="h-3.5 w-3.5 text-blue-500" />
                    </span>
                    <span>
                      <strong>Progress Circle</strong>: Shows progress toward your daily offer goal with color-coded segments
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-500/10 p-1 rounded mr-2 mt-0.5">
                      <LineChart className="h-3.5 w-3.5 text-indigo-500" />
                    </span>
                    <span>
                      <strong>Performance Metrics</strong>: Key statistics about your offers and conversions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-emerald-500/10 p-1 rounded mr-2 mt-0.5">
                      <ClipboardList className="h-3.5 w-3.5 text-emerald-500" />
                    </span>
                    <span>
                      <strong>Recent Offers</strong>: Your most recently logged offers with status indicators
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-amber-500/10 p-1 rounded mr-2 mt-0.5">
                      <Bell className="h-3.5 w-3.5 text-amber-500" />
                    </span>
                    <span>
                      <strong>Follow-ups</strong>: Upcoming and overdue follow-ups for your offers
                    </span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  Common Icons
                </h4>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <IconExplanation icon={<Eye />} description="View details" />
                  <IconExplanation icon={<Edit />} description="Edit item" />
                  <IconExplanation icon={<ThumbsUp />} description="Positive CSAT" />
                  <IconExplanation icon={<ThumbsDown />} description="Negative CSAT" />
                  <IconExplanation icon={<Minus />} description="Neutral CSAT" />
                  <IconExplanation icon={<CheckCircle />} description="Converted offer" />
                  <IconExplanation icon={<XCircle />} description="Not converted" />
                  <IconExplanation icon={<Calendar />} description="Set date" />
                  <IconExplanation icon={<RefreshCw />} description="Follow-up" />
                  <IconExplanation icon={<Bell />} description="Notification" />
                  <IconExplanation icon={<Search />} description="Search" />
                  <IconExplanation icon={<Filter />} description="Filter results" />
                  <IconExplanation icon={<PlusCircle />} description="Add new item" />
                  <IconExplanation icon={<Download />} description="Export data" />
                  <IconExplanation icon={<Settings2 />} description="Preferences" />
                  <IconExplanation icon={<Trash />} description="Delete item" />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Palette className="h-4 w-4 mr-2 text-blue-500" />
                  Color Coding
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1.5 pl-6">
                  <li>
                    <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>
                    <strong className="text-emerald-500">Green</strong>: Positive CSAT, converted offers
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                    <strong className="text-amber-500">Yellow</strong>: Neutral CSAT, 0-100% of daily goal
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                    <strong className="text-rose-500">Red</strong>: Negative CSAT, missed follow-ups
                  </li>
                  <li>
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    <strong className="text-blue-500">Blue</strong>: 201-300% of daily goal, future follow-ups
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Working with Offers</h3>
            
            <div className="space-y-5">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Creating Offers
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Multiple ways to log new offers:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                  <li>Use keyboard shortcut <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">⌘ N</kbd> from anywhere</li>
                  <li>Use the Quick Log form on the dashboard (if enabled)</li>
                  <li>Use the floating action button on mobile views</li>
                  <li>Click "New Offer" in the offers page</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Required fields: case number, channel, and offer type. Follow-up dates and notes are optional.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
                  Managing CSAT
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Record customer satisfaction for each offer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <div className="bg-emerald-500/10 rounded p-2 text-center">
                    <ThumbsUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs font-medium">Positive</span>
                  </div>
                  <div className="bg-amber-500/10 rounded p-2 text-center">
                    <Minus className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-xs font-medium">Neutral</span>
                  </div>
                  <div className="bg-rose-500/10 rounded p-2 text-center">
                    <ThumbsDown className="h-4 w-4 text-rose-500 mx-auto mb-1" />
                    <span className="text-xs font-medium">Negative</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can add optional comments for each CSAT rating to track feedback patterns.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Conversion Tracking
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mark offers as converted when they result in a successful outcome. Toggle the conversion
                  status anytime from the offer details or directly from the offers list.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-blue-500" />
                  Follow-up Management
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Set follow-up dates when creating or editing offers. You'll see reminders on your dashboard
                  when follow-ups are due. Best practices:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                  <li>Schedule follow-ups at the time of creating an offer</li>
                  <li>Mark follow-ups as complete once handled</li>
                  <li>Reschedule follow-ups when needed</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Tips & Tricks</h3>
            
            <div className="space-y-5">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <UserCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Personalization
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Customize OfferTracker to work better for you:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                  <li>Open preferences (⌘ ,) to change your name, daily goal, and other settings</li>
                  <li>Use the dashboard settings to show/hide elements based on what you need</li>
                  <li>Add your own custom channels and offer types that match your workflow</li>
                  <li>Toggle between light and dark mode based on your preference</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Search className="h-4 w-4 mr-2 text-blue-500" />
                  Finding What You Need
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Quickly locate offers and information:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                  <li>Use search to find offers by case number, channel, or type</li>
                  <li>Apply filters to narrow down results by date, status, or CSAT</li>
                  <li>Sort columns in the offers table to organize your view</li>
                  <li>Use keyboard shortcuts to navigate quickly</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <LineChart className="h-4 w-4 mr-2 text-blue-500" />
                  Performance Tips
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Get the most from your performance data:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                  <li>Review your conversion rates by channel to focus on what works best</li>
                  <li>Track CSAT trends to identify areas for improvement</li>
                  <li>Use the monthly overview to set realistic goals</li>
                  <li>Export your data regularly for external analysis or reporting</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                  Best Practices
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Tips for getting the most out of OfferTracker:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                  <li>Log offers immediately after making them for accurate tracking</li>
                  <li>Use the Quick Log feature for faster entry when you're busy</li>
                  <li>Add detailed notes for better context and future reference</li>
                  <li>Review your dashboard at the start of each day to plan follow-ups</li>
                  <li>Set consistent CSAT criteria for more meaningful analytics</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    );

    if (asPopover) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              ref={popoverTriggerRef}
              variant="ghost" 
              size="icon" 
              className={cn("rounded-full h-10 w-10 bg-secondary/30 backdrop-blur-sm transition-all hover:bg-secondary/60", className)}
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            align="end" 
            className="w-[350px] md:w-[500px] glass-card bg-gradient-to-br from-background/90 to-background/80 backdrop-blur-md shadow-lg border-white/10 dark:border-white/5"
          >
            {HelpContent}
          </PopoverContent>
        </Popover>
      );
    }

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            ref={sheetTriggerRef}
            variant="ghost" 
            size="icon" 
            className={cn("rounded-full h-10 w-10 bg-secondary/30 backdrop-blur-sm transition-all hover:bg-secondary/60", className)}
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Help & Guidance</SheetTitle>
            <SheetDescription>
              Learn how to use OfferTracker effectively
            </SheetDescription>
          </SheetHeader>
          {HelpContent}
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    );
  }
);

// Helper components for better organization
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-muted/40 rounded-lg p-4 border border-border flex">
      <div className="mr-3 mt-0.5">{icon}</div>
      <div>
        <h3 className="font-medium text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ShortcutItem({ keys, description }: { keys: string, description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{description}</span>
      <kbd className="px-2 py-1 text-xs bg-muted border rounded ml-2">{keys}</kbd>
    </div>
  );
}

function IconExplanation({ icon, description }: { icon: React.ReactNode, description: string }) {
  return (
    <div className="flex items-center">
      <div className="bg-muted/50 p-1.5 rounded-md mr-2">
        <div className="h-4 w-4">{icon}</div>
      </div>
      <span className="text-xs">{description}</span>
    </div>
  );
}
