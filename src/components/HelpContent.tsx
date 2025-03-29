import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ClipboardCheck, 
  LineChart, 
  User, 
  Home, 
  FileEdit, 
  Settings, 
  LayoutDashboard, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Tag, 
  SlidersHorizontal, 
  PlusCircle, 
  Trash, 
  Filter, 
  Download,
  Eye,
  RefreshCw,
  BarChart3,
  CalendarClock,
  Keyboard,
  Bell
} from "lucide-react";

export function HelpContent() {
  return (
    <div className="space-y-6 py-2">
      <h2 className="text-xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">OfferTracker Help Guide</h2>
      
      <div className="space-y-2">
        <h3 className="text-md font-semibold flex items-center">
          <User className="h-4 w-4 mr-2 text-blue-500" />
          First-time Setup
        </h3>
        <p className="text-sm text-muted-foreground">
          When you first launch OfferTracker, you'll be guided through a setup process to:
        </p>
        <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
          <li>Set your name (only first name will be used throughout the app)</li>
          <li>Define your daily offer goal</li>
          <li>Customize offer channels</li>
          <li>Add common offer types</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          You can always change these settings later in the Preferences dialog.
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-md font-semibold flex items-center">
          <LayoutDashboard className="h-4 w-4 mr-2 text-blue-500" />
          Dashboard Overview
        </h3>
        <p className="text-sm text-muted-foreground">
          The Dashboard is your central hub showing:
        </p>
        <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
          <li>Today's progress toward your daily goal</li>
          <li>Monthly goal progress and trend visualization</li>
          <li>Key performance metrics and charts</li>
          <li>Recent offers you've logged</li>
          <li>Optional quick offer entry form</li>
          <li>Scheduled follow-ups</li>
        </ul>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-md font-semibold flex items-center">
          <Keyboard className="h-4 w-4 mr-2 text-blue-500" />
          Keyboard Shortcuts
        </h3>
        <p className="text-sm text-muted-foreground">
          Use these Mac keyboard shortcuts to work faster:
        </p>
        <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
          <li><span className="font-medium">⌘ N</span> - Create a new offer</li>
          <li><span className="font-medium">⌘ O</span> - Quick log offer</li>
          <li><span className="font-medium">⌘ ,</span> - Open preferences</li>
          <li><span className="font-medium">⌘ /</span> - Show this help dialog</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          These shortcuts work from anywhere in the application except when typing in text fields.
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-md font-semibold flex items-center">
          <Eye className="h-4 w-4 mr-2 text-blue-500" />
          Understanding App Icons
        </h3>
        <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
          <li><span className="font-medium">Eye icon</span> - View offer details, add notes, or update CSAT</li>
          <li><span className="font-medium">Check icon</span> - Mark offers as converted or not converted</li>
          <li><span className="font-medium">Refresh icon</span> - Set or update follow-up reminders</li>
          <li><span className="font-medium">Thumbs up/down</span> - Record customer satisfaction ratings</li>
          <li><span className="font-medium">Plus icon</span> - Add new offers or items</li>
          <li><span className="font-medium">Bell icon</span> - Notification for follow-ups or reminders</li>
        </ul>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-md font-semibold flex items-center">
          <ClipboardCheck className="h-4 w-4 mr-2 text-blue-500" />
          Logging Offers
        </h3>
        <p className="text-sm text-muted-foreground">
          There are multiple ways to log a new offer:
        </p>
        <ol className="list-decimal text-sm text-muted-foreground pl-6 space-y-1">
          <li>Use keyboard shortcut ⌘ N or ⌘ O from anywhere in the app</li>
          <li>Click the "Quick Log Offer" button in the dashboard (if enabled)</li>
          <li>Use the floating action button on mobile views</li>
        </ol>
        <p className="text-sm text-muted-foreground mt-2">
          Required fields include case number, channel, and offer type. Follow-up dates and notes are optional.
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-md font-semibold flex items-center">
          <Bell className="h-4 w-4 mr-2 text-blue-500" />
          Follow-up Reminders
        </h3>
        <p className="text-sm text-muted-foreground">
          OfferTracker helps you stay on top of follow-ups:
        </p>
        <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
          <li>Set follow-up dates when creating or editing offers</li>
          <li>View upcoming follow-ups on your dashboard</li>
          <li>Receive notifications when follow-ups are due</li>
          <li>Mark follow-ups as complete or reschedule them</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-md font-semibold flex items-center">
              <Home className="h-4 w-4 mr-2 text-blue-500" />
              Customizing Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Personalize your dashboard by clicking the gear icon and selecting which elements to display, including the Quick Log Form.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-md font-semibold flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-blue-500" />
              Preferences
            </h3>
            <p className="text-sm text-muted-foreground">
              Use ⌘ , to open preferences where you can adjust channels, offer types, daily goals, and more.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-md font-semibold flex items-center">
              <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
              CSAT Tracking
            </h3>
            <p className="text-sm text-muted-foreground">
              Record customer satisfaction with positive, neutral, or negative ratings and optional comments to track success over time.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="text-md font-semibold flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
              Performance Metrics
            </h3>
            <p className="text-sm text-muted-foreground">
              View your performance trends, conversion rates, and CSAT scores to identify what's working best for you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
