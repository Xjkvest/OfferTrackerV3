import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  HelpCircle,
  Info,
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
  UserCircle,
  ChevronRight,
  Tag,
  BarChart3,
  Users,
  Clock,
  PieChart,
  List,
  Target,
  Link,
  FileJson,
  MousePointer,
  Smartphone
} from "lucide-react";

// Helper components
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="hover:bg-accent/50 transition-colors">
    <CardContent className="p-4">
      <div className="flex gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="space-y-3 mb-8">
    <h3 className="text-lg font-medium flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

const Subsection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="space-y-2 mb-4">
    <h4 className="font-medium flex items-center gap-2">
      {icon}
      {title}
    </h4>
    {children}
  </div>
);

const IconExplanation = ({ icon, description }: { icon: React.ReactNode, description: string }) => (
  <div className="flex items-center gap-2.5">
    <div className="bg-accent/50 rounded-full p-1.5">{icon}</div>
    <span className="text-sm">{description}</span>
  </div>
);

const ShortcutItem = ({ keys, description }: { keys: string, description: string }) => (
  <div className="flex flex-col gap-1">
    <kbd className="inline-flex gap-1 px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted rounded border">{keys}</kbd>
    <span className="text-xs">{description}</span>
  </div>
);

const Help: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className="flex-1 container max-w-6xl mx-auto py-6 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Help & Documentation</h1>
        <p className="text-muted-foreground">
          Learn how to get the most out of OfferTracker
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
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
            
            <FeatureCard
              icon={<Calendar className="h-5 w-5 text-violet-500" />}
              title="Follow-up Management"
              description="Never miss a follow-up with automated reminders and scheduling."
            />
            
            <FeatureCard
              icon={<Users className="h-5 w-5 text-rose-500" />}
              title="Personalized Experience"
              description="Customize your workspace with preferences and settings."
            />
          </div>

          <Section icon={<Layout className="h-5 w-5 text-blue-500" />} title="Application Structure">
            <div className="space-y-3">
              <Subsection icon={<Home className="h-4 w-4 text-blue-500" />} title="Dashboard">
                <p className="text-sm text-muted-foreground">
                  The central hub showing your daily progress, key metrics, and upcoming follow-ups.
                </p>
              </Subsection>
              
              <Subsection icon={<Tag className="h-4 w-4 text-blue-500" />} title="Offers">
                <p className="text-sm text-muted-foreground">
                  View, filter and manage all your offers with comprehensive list and detail views.
                </p>
              </Subsection>
              
              <Subsection icon={<BarChart3 className="h-4 w-4 text-blue-500" />} title="Analytics">
                <p className="text-sm text-muted-foreground">
                  Visualize your performance with charts and insights to identify trends and opportunities.
                </p>
              </Subsection>
              
              <Subsection icon={<Bell className="h-4 w-4 text-blue-500" />} title="Notifications">
                <p className="text-sm text-muted-foreground">
                  Stay on top of important events, overdue follow-ups, and system notifications.
                </p>
              </Subsection>
              
              <Subsection icon={<Settings2 className="h-4 w-4 text-blue-500" />} title="Settings">
                <p className="text-sm text-muted-foreground">
                  Customize your experience with personal preferences, daily goals, and system options.
                </p>
              </Subsection>
            </div>
          </Section>

          <Section icon={<Info className="h-5 w-5 text-blue-500" />} title="Common Icons">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <IconExplanation icon={<Eye className="h-4 w-4" />} description="View details" />
              <IconExplanation icon={<Edit className="h-4 w-4" />} description="Edit item" />
              <IconExplanation icon={<ThumbsUp className="h-4 w-4" />} description="Positive CSAT" />
              <IconExplanation icon={<ThumbsDown className="h-4 w-4" />} description="Negative CSAT" />
              <IconExplanation icon={<Minus className="h-4 w-4" />} description="Neutral CSAT" />
              <IconExplanation icon={<CheckCircle className="h-4 w-4" />} description="Converted offer" />
              <IconExplanation icon={<XCircle className="h-4 w-4" />} description="Not converted" />
              <IconExplanation icon={<Calendar className="h-4 w-4" />} description="Set date" />
              <IconExplanation icon={<RefreshCw className="h-4 w-4" />} description="Follow-up" />
              <IconExplanation icon={<Bell className="h-4 w-4" />} description="Notification" />
              <IconExplanation icon={<Search className="h-4 w-4" />} description="Search" />
              <IconExplanation icon={<Filter className="h-4 w-4" />} description="Filter results" />
              <IconExplanation icon={<PlusCircle className="h-4 w-4" />} description="Add new item" />
              <IconExplanation icon={<Download className="h-4 w-4" />} description="Export data" />
              <IconExplanation icon={<Settings2 className="h-4 w-4" />} description="Preferences" />
              <IconExplanation icon={<Trash className="h-4 w-4" />} description="Delete item" />
            </div>
          </Section>

          <Section icon={<Palette className="h-5 w-5 text-blue-500" />} title="Color Coding">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-emerald-500"></span>
                <span className="text-sm"><strong className="text-emerald-500">Green</strong>: Positive CSAT, converted offers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-amber-400"></span>
                <span className="text-sm"><strong className="text-amber-500">Yellow</strong>: Neutral CSAT, 0-100% of daily goal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-rose-500"></span>
                <span className="text-sm"><strong className="text-rose-500">Red</strong>: Negative CSAT, overdue items</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-blue-500"></span>
                <span className="text-sm"><strong className="text-blue-500">Blue</strong>: Informational elements, links</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full bg-purple-500"></span>
                <span className="text-sm"><strong className="text-purple-500">Purple</strong>: Exceptional performance, streaks</span>
              </div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-8">
          <Section icon={<Gauge className="h-5 w-5 text-blue-500" />} title="Dashboard Overview">
            <p className="text-sm text-muted-foreground mb-4">
              The Dashboard is your daily command center showing your progress, metrics, and actions required.
            </p>
            
            <div className="space-y-4">
              <Subsection icon={<Gauge className="h-4 w-4 text-blue-500" />} title="Daily Goal Progress">
                <p className="text-sm text-muted-foreground mb-2">
                  The circular progress indicator shows your progress toward your daily goal:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Changes color based on completion percentage</li>
                  <li>Shows exact offer count and percentage</li>
                  <li>Updates in real-time as you add new offers</li>
                </ul>
              </Subsection>
              
              <Subsection icon={<LineChart className="h-4 w-4 text-indigo-500" />} title="Monthly Goal Progress">
                <p className="text-sm text-muted-foreground mb-2">
                  The monthly goal section provides a broader view of your performance:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Bar chart showing daily offer counts</li>
                  <li>Tracks progress against monthly target</li>
                  <li>Provides forecast for month-end totals</li>
                  <li>Interactive adjustable goal slider</li>
                </ul>
              </Subsection>
              
              <Subsection icon={<ClipboardList className="h-4 w-4 text-emerald-500" />} title="Quick Log Form">
                <p className="text-sm text-muted-foreground mb-2">
                  The quick log form allows rapid offer entry:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Simplified fields for essential info</li>
                  <li>Auto-populated date and defaults</li>
                  <li>Can be shown/hidden via settings</li>
                </ul>
              </Subsection>
              
              <Subsection icon={<RefreshCw className="h-4 w-4 text-amber-500" />} title="Follow-ups">
                <p className="text-sm text-muted-foreground mb-2">
                  The follow-ups section helps you stay on top of pending actions:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Lists upcoming and overdue follow-ups</li>
                  <li>One-click to mark as completed</li>
                  <li>Color-coded by urgency</li>
                </ul>
              </Subsection>
              
              <Subsection icon={<Clock className="h-4 w-4 text-violet-500" />} title="Recent Offers">
                <p className="text-sm text-muted-foreground mb-2">
                  Displays your most recent offers:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Shows the last 5-10 offers</li>
                  <li>Includes key details and status indicators</li>
                  <li>Quick access to offer details</li>
                </ul>
              </Subsection>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="offers" className="space-y-8">
          <Section icon={<PlusCircle className="h-5 w-5 text-blue-500" />} title="Creating Offers">
            <p className="text-sm text-muted-foreground mb-3">
              Multiple ways to create new offers:
            </p>
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1 mb-4">
              <li>Use keyboard shortcut <kbd className="px-1.5 py-0.5 text-xs bg-muted border rounded">⌘ N</kbd> from anywhere</li>
              <li>Use the Quick Log form on the dashboard (if enabled)</li>
              <li>Use the floating action button on mobile views</li>
              <li>Click "New Offer" in the offers page</li>
            </ul>
            
            <p className="text-sm text-muted-foreground">
              Required fields: case number, channel, and offer type. Follow-up dates and notes are optional.
            </p>
          </Section>
          
          <Section icon={<Tag className="h-5 w-5 text-blue-500" />} title="Managing Offers">
            <Subsection icon={<Eye className="h-4 w-4 text-blue-500" />} title="Viewing Offers">
              <p className="text-sm text-muted-foreground mb-2">
                The offers page provides comprehensive view options:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>List view with sortable columns</li>
                <li>Detailed information on hover</li>
                <li>Click any offer to view full details</li>
              </ul>
            </Subsection>
            
            <Subsection icon={<Filter className="h-4 w-4 text-blue-500" />} title="Filtering & Searching">
              <p className="text-sm text-muted-foreground mb-2">
                Powerful filtering capabilities:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Search by case number, channel, or offer type</li>
                <li>Filter by date range</li>
                <li>Filter by CSAT rating or conversion status</li>
                <li>Combined filters for precise results</li>
                <li>Filter state preserved in URL for sharing</li>
              </ul>
            </Subsection>
            
            <Subsection icon={<Edit className="h-4 w-4 text-blue-500" />} title="Editing Offers">
              <p className="text-sm text-muted-foreground mb-2">
                Easy offer editing:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Edit any offer details</li>
                <li>Update CSAT ratings and comments</li>
                <li>Change follow-up dates</li>
                <li>Mark as converted</li>
              </ul>
            </Subsection>
            
            <Subsection icon={<Download className="h-4 w-4 text-blue-500" />} title="Exporting Offers">
              <p className="text-sm text-muted-foreground mb-2">
                Export capabilities:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Export to CSV format</li>
                <li>Export filtered results only</li>
                <li>Includes all offer details</li>
              </ul>
            </Subsection>
          </Section>
          
          <Section icon={<ThumbsUp className="h-5 w-5 text-blue-500" />} title="CSAT Management">
            <p className="text-sm text-muted-foreground mb-3">
              Record customer satisfaction for each offer:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <ThumbsUp className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Positive</h4>
                  <p className="text-xs text-muted-foreground">Customer had a good experience</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Minus className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Neutral</h4>
                  <p className="text-xs text-muted-foreground">Customer experience was acceptable</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <ThumbsDown className="h-5 w-5 text-rose-500 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Negative</h4>
                  <p className="text-xs text-muted-foreground">Customer had a poor experience</p>
                </CardContent>
              </Card>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You can add optional comments for each CSAT rating to track feedback patterns. CSAT ratings help identify trends in customer satisfaction across channels and offer types.
            </p>
          </Section>
          
          <Section icon={<CheckCircle className="h-5 w-5 text-blue-500" />} title="Conversion Tracking">
            <p className="text-sm text-muted-foreground mb-3">
              Mark offers as converted when they result in a successful outcome. This helps track your effectiveness and identify patterns in successful offers.
            </p>
            
            <p className="text-sm text-muted-foreground mb-3">
              When marking an offer as converted:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>The conversion date is automatically recorded</li>
              <li>Conversion tracking metrics are updated</li>
              <li>The offer is visually indicated as converted in lists</li>
              <li>You can add optional notes about the conversion</li>
            </ul>
          </Section>
          
          <Section icon={<RefreshCw className="h-5 w-5 text-blue-500" />} title="Follow-up Management">
            <p className="text-sm text-muted-foreground mb-3">
              Set follow-up dates to remind yourself to check in with customers. The system will track these and notify you when follow-ups are due.
            </p>
            
            <Subsection icon={<Calendar className="h-4 w-4 text-blue-500" />} title="Setting Follow-ups">
              <p className="text-sm text-muted-foreground mb-2">
                You can set follow-ups:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>When creating a new offer</li>
                <li>When editing an existing offer</li>
                <li>Using quick follow-up options (24h, 48h, 1 week)</li>
                <li>Using the calendar for custom dates</li>
              </ul>
            </Subsection>
            
            <Subsection icon={<Bell className="h-4 w-4 text-blue-500" />} title="Follow-up Notifications">
              <p className="text-sm text-muted-foreground mb-2">
                The system notifies you about follow-ups:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Dashboard follow-up widget shows upcoming and overdue</li>
                <li>Notification bell indicator when follow-ups are due</li>
                <li>Color-coding based on urgency</li>
              </ul>
            </Subsection>
            
            <Subsection icon={<CheckCircle className="h-4 w-4 text-blue-500" />} title="Completing Follow-ups">
              <p className="text-sm text-muted-foreground mb-2">
                After following up with a customer:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Mark follow-up as completed</li>
                <li>Optionally record the outcome</li>
                <li>Set a new follow-up date if needed</li>
              </ul>
            </Subsection>
          </Section>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
          <Section icon={<BarChart3 className="h-5 w-5 text-blue-500" />} title="Analytics Overview">
            <p className="text-sm text-muted-foreground mb-4">
              The Analytics page provides comprehensive insights into your performance with multiple analysis types.
            </p>
            
            <div className="space-y-4">
              <Subsection icon={<LineChart className="h-4 w-4 text-blue-500" />} title="Monthly Goal Progress">
                <p className="text-sm text-muted-foreground mb-2">
                  Track your progress toward monthly goals:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Visualize daily offer count vs. goal</li>
                  <li>See your success rate and exceptional days</li>
                  <li>Forecast end-of-month projection</li>
                  <li>Adjust goals and see impact on progress</li>
                </ul>
              </Subsection>
              
              <Subsection icon={<PieChart className="h-4 w-4 text-indigo-500" />} title="Channel Analysis">
                <p className="text-sm text-muted-foreground mb-2">
                  Understand which channels perform best:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Distribution of offers by channel</li>
                  <li>Conversion rates by channel</li>
                  <li>CSAT ratings by channel</li>
                  <li>Trends over time by channel</li>
                </ul>
              </Subsection>
              
              <Subsection icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} title="Conversion Velocity">
                <p className="text-sm text-muted-foreground mb-2">
                  Analyze how quickly offers convert:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Average time to conversion</li>
                  <li>Best performing channels for fast conversion</li>
                  <li>Best time of day/week for conversions</li>
                  <li>Visualize conversion patterns</li>
                </ul>
              </Subsection>
              
              <Subsection icon={<Gauge className="h-4 w-4 text-rose-500" />} title="Performance Studio">
                <p className="text-sm text-muted-foreground mb-2">
                  Deep dive into your performance metrics:
                </p>
                <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                  <li>Compare metrics across time periods</li>
                  <li>Identify trends and patterns</li>
                  <li>Focus on areas for improvement</li>
                  <li>Track progress over time</li>
                </ul>
              </Subsection>
            </div>
          </Section>
          
          <Section icon={<Filter className="h-5 w-5 text-blue-500" />} title="Filtering Your Data">
            <p className="text-sm text-muted-foreground mb-3">
              Analytics include powerful filtering to focus on specific subsets of data:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Filter by date range (predefined or custom)</li>
              <li>Filter by channels</li>
              <li>Filter by offer types</li>
              <li>Filter by CSAT rating</li>
              <li>Filter by conversion status</li>
              <li>Filter by follow-up status</li>
            </ul>
            
            <p className="text-sm text-muted-foreground mt-3">
              All charts and metrics will automatically update to reflect your selected filters.
            </p>
          </Section>
          
          <Section icon={<Download className="h-5 w-5 text-blue-500" />} title="Exporting Analytics">
            <p className="text-sm text-muted-foreground mb-3">
              Export your analytics for external reporting:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Export CSV data of filtered results</li>
              <li>Save chart images for presentations</li>
              <li>Export full reports with metrics</li>
            </ul>
          </Section>
        </TabsContent>

        <TabsContent value="settings" className="space-y-8">
          <Section icon={<UserCircle className="h-5 w-5 text-blue-500" />} title="Profile Settings">
            <p className="text-sm text-muted-foreground mb-3">
              Customize your personal profile:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Update your name</li>
              <li>Set your profile picture</li>
              <li>Customize greeting display</li>
            </ul>
          </Section>
          
          <Section icon={<Tag className="h-5 w-5 text-blue-500" />} title="Offer Configuration">
            <p className="text-sm text-muted-foreground mb-3">
              Configure your offer tracking system:
            </p>
            
            <Subsection icon={<List className="h-4 w-4 text-blue-500" />} title="Channels & Offer Types">
              <p className="text-sm text-muted-foreground mb-2">
                Customize the channels and offer types to match your workflow:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Add new channels (Email, Chat, Phone, etc.)</li>
                <li>Add new offer types</li>
                <li>Edit existing labels</li>
                <li>Remove unused options</li>
              </ul>
            </Subsection>
            
            <Subsection icon={<Target className="h-4 w-4 text-blue-500" />} title="Daily Goals">
              <p className="text-sm text-muted-foreground mb-2">
                Set your performance targets:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Set daily offer goal</li>
                <li>Configure workdays for goal tracking</li>
                <li>Set stretch goals</li>
              </ul>
            </Subsection>
            
            <Subsection icon={<Link className="h-4 w-4 text-blue-500" />} title="Case Linking">
              <p className="text-sm text-muted-foreground mb-2">
                Configure case number linking:
              </p>
              <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
                <li>Set up URL templates for case systems</li>
                <li>Enable clickable case numbers</li>
                <li>Configure case number format validation</li>
              </ul>
            </Subsection>
          </Section>
          
          <Section icon={<Bell className="h-5 w-5 text-blue-500" />} title="Follow-up Preferences">
            <p className="text-sm text-muted-foreground mb-3">
              Configure how follow-ups work:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Set default follow-up time intervals</li>
              <li>Configure follow-up reminders</li>
              <li>Set notification preferences</li>
              <li>Configure follow-up nudges</li>
            </ul>
          </Section>
          
          <Section icon={<Layout className="h-5 w-5 text-blue-500" />} title="Dashboard Preferences">
            <p className="text-sm text-muted-foreground mb-3">
              Customize your dashboard layout:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Select which widgets to display</li>
              <li>Arrange widget order</li>
              <li>Set dashboard density (compact, comfortable, cozy)</li>
              <li>Toggle quick log form visibility</li>
            </ul>
          </Section>
          
          <Section icon={<Palette className="h-5 w-5 text-blue-500" />} title="Appearance Settings">
            <p className="text-sm text-muted-foreground mb-3">
              Customize the look and feel:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Toggle between light and dark mode</li>
              <li>Set font size preference</li>
              <li>Configure theme options</li>
              <li>Adjust contrast settings</li>
            </ul>
          </Section>
          
          <Section icon={<RefreshCw className="h-5 w-5 text-blue-500" />} title="Streak Settings">
            <p className="text-sm text-muted-foreground mb-3">
              Configure how streaks are calculated:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Set up work days for streak counting</li>
              <li>Configure vacation mode</li>
              <li>Set up streak preservation tokens</li>
              <li>Configure badge earning criteria</li>
            </ul>
          </Section>
          
          <Section icon={<FileJson className="h-5 w-5 text-blue-500" />} title="Data Management">
            <p className="text-sm text-muted-foreground mb-3">
              Manage your offer data:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Import offers from CSV</li>
              <li>Backup all data</li>
              <li>Restore from backup</li>
              <li>Reset application data</li>
            </ul>
          </Section>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-8">
          <Section icon={<Keyboard className="h-5 w-5 text-blue-500" />} title="Keyboard Shortcuts">
            <p className="text-sm text-muted-foreground mb-4">
              Speed up your workflow with these keyboard shortcuts:
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ShortcutItem keys="⌘ Shift N" description="Create new offer" />
              <ShortcutItem keys="⌘ Shift O" description="Quick log offer" />
              <ShortcutItem keys="⌘ ," description="Open preferences" />
              <ShortcutItem keys="⌘ Shift /" description="Open help" />
              <ShortcutItem keys="⌘ Shift D" description="Go to dashboard" />
              <ShortcutItem keys="⌘ Shift F" description="Focus search" />
              <ShortcutItem keys="⌘ Shift S" description="Save changes" />
              <ShortcutItem keys="⌘ Shift A" description="Go to analytics" />
              <ShortcutItem keys="⌘ Shift H" description="Go to help page" />
              <ShortcutItem keys="Escape" description="Close dialogs" />
            </div>
          </Section>
          
          <Section icon={<MousePointer className="h-5 w-5 text-blue-500" />} title="Mouse Tips">
            <p className="text-sm text-muted-foreground mb-3">
              Get the most out of mouse interactions:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Hover over items for more details</li>
              <li>Right-click offers for quick actions</li>
              <li>Click and drag to rearrange dashboard widgets</li>
              <li>Double-click to open items for editing</li>
              <li>Mouse wheel on charts to zoom in/out</li>
            </ul>
          </Section>
          
          <Section icon={<Smartphone className="h-5 w-5 text-blue-500" />} title="Mobile Gestures">
            <p className="text-sm text-muted-foreground mb-3">
              Mobile-specific gestures:
            </p>
            
            <ul className="list-disc text-sm text-muted-foreground pl-6 space-y-1">
              <li>Swipe left/right on offers for actions</li>
              <li>Pull down to refresh</li>
              <li>Pinch to zoom charts</li>
              <li>Long press for context menu</li>
              <li>Double tap to expand items</li>
            </ul>
          </Section>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Help; 
 