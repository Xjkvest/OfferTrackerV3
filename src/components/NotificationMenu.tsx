import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Calendar, 
  CalendarClock, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Eye,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useOffers } from "@/context/OfferContext";
import { useFollowupManager } from "@/hooks/useFollowupManager";
import { OfferDialog } from './OfferDialog';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { CaseLink } from './CaseLink';
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";
import { Notification } from '@/context/UserContext'; // Adjust import path as needed

export function NotificationMenu() {
  const { notifications, clearNotification, markNotificationAsRead, baseOfferLink } = useUser();
  const { checkFollowups, updateOffer, offers } = useOffers();
  const { markFollowupAsCompleted } = useFollowupManager();
  const [open, setOpen] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  
  // Request notification permission if not granted
  useEffect(() => {
    if ('Notification' in window && window.Notification.permission !== 'granted' && window.Notification.permission !== 'denied') {
      // Wait for user interaction before requesting
      const requestPermission = () => {
        window.Notification.requestPermission();
        document.removeEventListener('click', requestPermission);
      };
      document.addEventListener('click', requestPermission);
      return () => document.removeEventListener('click', requestPermission);
    }
  }, []);
  
  // Check for followups on component mount and when offers change
const [hasCheckedOnce, setHasCheckedOnce] = useState(false);

useEffect(() => {
  if (!hasCheckedOnce && offers && offers.length > 0) {
    checkFollowups();
    setLastCheckTime(new Date());
    setHasCheckedOnce(true);
  }
}, [offers, checkFollowups, hasCheckedOnce]);

  // Hourly check for overdue followups
  useEffect(() => {
    const hourlyCheck = setInterval(() => {
      if (offers && offers.length > 0) {
        checkFollowups();
        setLastCheckTime(new Date());
        console.log("Performing hourly followup check");
      }
    }, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(hourlyCheck);
  }, [checkFollowups, offers]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Mark notifications as read when popover is opened
  useEffect(() => {
    if (open && unreadCount > 0) {
      notifications.forEach(n => {
        if (!n.read) {
          markNotificationAsRead(n.id);
        }
      });
    }
  }, [open, notifications, unreadCount, markNotificationAsRead]);

  // Handle offer click from notification
  const handleOfferClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setShowOfferDialog(true);
    setOpen(false);
  };
  
  // Get offer details for this notification
  const getOfferForNotification = (offerId?: string) => {
    if (!offerId) return null;
    return offers.find(o => o.id === offerId);
  };
  
  // Handle marking a follow-up as complete
  const handleMarkAsCompleted = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.offerId) {
      const offer = getOfferForNotification(notification.offerId);
      if (offer) {
        // Use the markFollowupAsCompleted from useFollowupManager
        await markFollowupAsCompleted(notification.offerId, offer);
        
        // After successful completion, clear the notification
        clearNotification(notification.id);
        
        toast({
          title: "Follow-up Completed",
          description: `Follow-up has been marked as completed.`,
        });
      }
    }
  };

  // Format relative time
  const getRelativeTime = (timestamp: number) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    // Convert to appropriate units
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const handleClearAll = () => {
    notifications.forEach(n => clearNotification(n.id));
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been cleared. Overdue items will appear again during the next check.",
    });
  };

  const refreshOverdueItems = () => {
    checkFollowups();
    setLastCheckTime(new Date());
    toast({
      title: "Followups Refreshed",
      description: "Checked for any overdue followups.",
    });
  };

  const formatLastCheckTime = () => {
    return lastCheckTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center w-4 h-4 text-[10px] font-bold"
              >
                {unreadCount}
              </motion.span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] max-w-[90vw] z-50 p-0" align="end" side="bottom" sideOffset={5}>
          <Card className="border-0 shadow-none">
            <CardHeader className="py-3 px-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                {notifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={refreshOverdueItems}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Check for overdue followups"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearAll}
                      className="h-7 px-2 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                {notifications.length === 0
                  ? 'All caught up!'
                  : `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>
            <ScrollArea className="h-[300px] max-h-[calc(100vh-200px)]">
              {notifications.length > 0 ? (
                <AnimatePresence>
                  {notifications.map((notification) => {
                    const relatedOffer = getOfferForNotification(notification.offerId);
                    return (
                      <motion.div 
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                        <div className={`flex gap-3 p-3 border-b border-border/50 relative group rounded-md
  ${notification.isOverdue ? 'bg-red-50 dark:bg-red-900/20' :
    notification.isUrgent ? 'bg-amber-50 dark:bg-amber-900/20' :
    !notification.read ? 'bg-secondary/30 dark:bg-secondary/20' : ''}`}>
                          
                          {/* Left Icon */}
                          <div className="flex items-start pt-1">
                            {notification.isOverdue ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : notification.isUrgent ? (
                              <CalendarClock className="h-5 w-5 text-amber-500" />
                            ) : (
                              <CalendarClock className="h-5 w-5 text-primary" />
                            )}
                          </div>

                          {/* Notification Content */}
                          <div
                            className="flex-1 min-w-0 overflow-hidden cursor-pointer"
                            onClick={() => notification.offerId && handleOfferClick(notification.offerId)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-semibold text-sm text-foreground truncate pr-10">
                                {notification.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getRelativeTime(notification.timestamp)}
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground mt-1 truncate">
  {notification.message}
</div>

                            <div className="mt-2 flex items-center gap-2 flex-wrap justify-between">
                              <div className="flex items-center gap-2">
                                {notification.offerId && (
                                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    notification.isOverdue
                                      ? 'border-red-500 text-red-500'
                                      : notification.isUrgent
                                      ? 'border-amber-500 text-amber-500'
                                      : 'text-muted-foreground'
                                  }`}>
                                    {notification.isOverdue ? 'Overdue' : 'Follow-up'}
                                  </Badge>
                                )}

                                
                              </div>

                              {notification.offerId && (
  <div className="flex items-center gap-1">
    {/* View in-app */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleOfferClick(notification.offerId!)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">View</TooltipContent>
    </Tooltip>

    {/* External View Case link */}
    {relatedOffer && baseOfferLink && (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={`${baseOfferLink}${relatedOffer.caseNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </TooltipTrigger>
        <TooltipContent side="top">Open case</TooltipContent>
      </Tooltip>
    )}

    {/* Mark as completed */}
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-green-500 hover:text-green-600 dark:hover:text-green-400"
          onClick={(e) => handleMarkAsCompleted(notification, e)}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Mark as done</TooltipContent>
    </Tooltip>
  </div>
)}
                            </div>

                          </div>

                          {/* Dismiss button (top right on hover) */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center p-6">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {offers && offers.length > 0 
                      ? "Follow-up reminders and important alerts will appear here"
                      : "Create your first offer to get started with follow-ups"}
                  </p>
                </div>
              )}
            </ScrollArea>
            
            {notifications.length > 0 && (
              <CardFooter className="py-2 px-4 border-t bg-muted/30">
                <div className="text-xs text-muted-foreground flex justify-between w-full">
                  <span>Tip: Set follow-up dates on your offers to get reminders.</span>
                  <span className="text-xs text-muted-foreground/70">Last check: {formatLastCheckTime()}</span>
                </div>
              </CardFooter>
            )}
          </Card>
        </PopoverContent>
      </Popover>
      
      <OfferDialog
        open={showOfferDialog}
        onOpenChange={setShowOfferDialog}
        offerId={selectedOfferId}
      />
    </>
  );
}
