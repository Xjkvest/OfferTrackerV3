import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useOffers } from '@/context/OfferContext';
import { useFollowupManager } from '@/hooks/useFollowupManager';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CaseLink } from '@/components/CaseLink';
import { OfferDialog } from '@/components/OfferDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Notification } from '@/context/UserContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

const Notifications = () => {
  // Hooks
  const { notifications, markNotificationAsRead, clearNotification, clearAllNotifications } = useUser();
  const { offers, checkFollowups } = useOffers();
  const { markFollowupAsCompleted } = useFollowupManager();
  const isMobile = useIsMobile();
  
  // State
  const [filter, setFilter] = useState<'all' | 'unread' | 'followups' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Mark all notifications as read when the page loads
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
  }, [notifications, markNotificationAsRead]);

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notification => {
      // Apply filters
      if (filter === 'unread') return !notification.read;
      if (filter === 'followups') return notification.isUrgent || notification.isOverdue;
      if (filter === 'read') return notification.read;
      return true;
    })
    .filter(notification => {
      // Apply search
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        (notification.offerId && getOfferForNotification(notification.offerId)?.offerType?.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Sort by urgency (overdue first) then read status, then timestamp (newest first)
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (!a.read && b.read) return -1;
      if (a.read && !b.read) return 1;
      return b.timestamp - a.timestamp;
    });

  // Get offer details for a notification
  const getOfferForNotification = (offerId?: string) => {
    if (!offerId) return null;
    return offers.find(o => o.id === offerId);
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotificationId(notification.id);
    
    // If notification is for an offer, open that offer
    if (notification.offerId) {
      setSelectedOfferId(notification.offerId);
      setShowOfferDialog(true);
    }
  };

  // Handle marking a followup as complete
  const handleMarkFollowupComplete = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent notification click
    
    if (notification.offerId) {
      const offer = getOfferForNotification(notification.offerId);
      if (offer) {
        // Use the followup manager to mark as completed
        await markFollowupAsCompleted(notification.offerId, offer);
        
        // Clear the notification
        clearNotification(notification.id);
        
        toast({
          title: "Follow-up Completed",
          description: `Follow-up for ${offer.offerType} has been marked as completed.`,
        });
      }
    }
  };

  // Handle clearing a notification
  const handleClearNotification = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent notification click
    clearNotification(notificationId);
  };

  // Refresh notifications
  const handleRefresh = () => {
    checkFollowups();
    setLastRefreshed(new Date());
    toast({
      title: "Notifications Refreshed",
      description: "Checked for any new followups and notifications.",
    });
  };

  // Get background color based on notification type
  const getNotificationColor = (notification: Notification) => {
    if (notification.isOverdue) {
      return 'bg-destructive/10';
    } else if (notification.isUrgent) {
      return 'bg-warning/10';
    }
    return 'bg-background';
  };

  // Get icon based on notification type
  const getNotificationIcon = (notification: Notification) => {
    if (notification.isOverdue) {
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    } else if (notification.isUrgent) {
      return <Calendar className="h-5 w-5 text-warning" />;
    }
    return <Bell className="h-5 w-5 text-primary" />;
  };

  // Determine if the notification should show the "Done" button
  const shouldShowDoneButton = (notification: Notification) => {
    return notification.isUrgent || notification.isOverdue;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-6 px-4 max-w-6xl"
    >
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Manage your notifications and followups
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden md:inline">Refresh</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearAllNotifications()}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span className="hidden md:inline">Clear All</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Your Notifications</CardTitle>
                <CardDescription>
                  Last refreshed: {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
                </CardDescription>
              </div>
              
              <div className="w-full md:w-auto flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..." 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
            <div className="px-6">
              <TabsList className="w-full md:w-auto grid grid-cols-4">
                <TabsTrigger value="all" className="text-xs md:text-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs md:text-sm">
                  Unread
                </TabsTrigger>
                <TabsTrigger value="followups" className="text-xs md:text-sm">
                  Followups
                </TabsTrigger>
                <TabsTrigger value="read" className="text-xs md:text-sm">
                  Read
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-0 pt-2">
              <TabsContent value="all" className="m-0">
                <NotificationList 
                  notifications={filteredNotifications}
                  getOfferForNotification={getOfferForNotification}
                  handleNotificationClick={handleNotificationClick}
                  handleMarkFollowupComplete={handleMarkFollowupComplete}
                  handleClearNotification={handleClearNotification}
                  getNotificationColor={getNotificationColor}
                  getNotificationIcon={getNotificationIcon}
                  shouldShowDoneButton={shouldShowDoneButton}
                />
              </TabsContent>
              
              <TabsContent value="unread" className="m-0">
                <NotificationList 
                  notifications={filteredNotifications}
                  getOfferForNotification={getOfferForNotification}
                  handleNotificationClick={handleNotificationClick}
                  handleMarkFollowupComplete={handleMarkFollowupComplete}
                  handleClearNotification={handleClearNotification}
                  getNotificationColor={getNotificationColor}
                  getNotificationIcon={getNotificationIcon}
                  shouldShowDoneButton={shouldShowDoneButton}
                />
              </TabsContent>
              
              <TabsContent value="followups" className="m-0">
                <NotificationList 
                  notifications={filteredNotifications}
                  getOfferForNotification={getOfferForNotification}
                  handleNotificationClick={handleNotificationClick}
                  handleMarkFollowupComplete={handleMarkFollowupComplete}
                  handleClearNotification={handleClearNotification}
                  getNotificationColor={getNotificationColor}
                  getNotificationIcon={getNotificationIcon}
                  shouldShowDoneButton={shouldShowDoneButton}
                />
              </TabsContent>
              
              <TabsContent value="read" className="m-0">
                <NotificationList 
                  notifications={filteredNotifications}
                  getOfferForNotification={getOfferForNotification}
                  handleNotificationClick={handleNotificationClick}
                  handleMarkFollowupComplete={handleMarkFollowupComplete}
                  handleClearNotification={handleClearNotification}
                  getNotificationColor={getNotificationColor}
                  getNotificationIcon={getNotificationIcon}
                  shouldShowDoneButton={shouldShowDoneButton}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Offer Dialog */}
      {showOfferDialog && (
        <OfferDialog
          open={showOfferDialog}
          onOpenChange={setShowOfferDialog}
          offerId={selectedOfferId || undefined}
        />
      )}
    </motion.div>
  );
};

// Helper component for notification list
interface NotificationListProps {
  notifications: Notification[];
  getOfferForNotification: (offerId?: string) => any;
  handleNotificationClick: (notification: Notification) => void;
  handleMarkFollowupComplete: (notification: Notification, e: React.MouseEvent) => void;
  handleClearNotification: (notificationId: string, e: React.MouseEvent) => void;
  getNotificationColor: (notification: Notification) => string;
  getNotificationIcon: (notification: Notification) => JSX.Element;
  shouldShowDoneButton: (notification: Notification) => boolean;
}

const NotificationList = ({
  notifications,
  getOfferForNotification,
  handleNotificationClick,
  handleMarkFollowupComplete,
  handleClearNotification,
  getNotificationColor,
  getNotificationIcon,
  shouldShowDoneButton
}: NotificationListProps) => {
  // No notifications message
  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium">No notifications</h3>
        <p className="text-muted-foreground">
          You're all caught up! We'll notify you when there's something important.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="divide-y">
        {notifications.map((notification) => {
          const offer = getOfferForNotification(notification.offerId);
          
          return (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 hover:bg-accent/50 cursor-pointer transition-colors ${getNotificationColor(notification)}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {getNotificationIcon(notification)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <Badge variant="default" className="ml-2 py-0">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {shouldShowDoneButton(notification) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleMarkFollowupComplete(notification, e)}
                          className="ml-auto"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Done</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleClearNotification(notification.id, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {offer && (
                    <div className="mt-2 text-sm flex flex-wrap gap-2 items-center">
                      <Badge variant="secondary" className="font-normal">
                        {offer.offerType}
                      </Badge>
                      
                      <Badge variant="outline" className="font-normal">
                        {offer.channel}
                      </Badge>
                      
                      {offer.caseNumber && (
                        <CaseLink caseNumber={offer.caseNumber} />
                      )}
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default Notifications; 
 