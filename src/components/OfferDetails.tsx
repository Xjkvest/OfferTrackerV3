import React, { useState, useEffect, useRef } from "react";
import { Offer, useOffers, FollowupItem } from "@/context/OfferContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ThumbsUp, ThumbsDown, Minus, CheckCircle, XCircle, Trash, MessageSquare, Check, Tag, Hash, CalendarClock, Clock, Zap, ShoppingCart, PlusCircle } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OfferForm } from "./OfferForm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, differenceInDays } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { CaseLink } from "./CaseLink";
import { Switch } from "@/components/ui/switch";
import { useFollowupManager } from "@/hooks/useFollowupManager";

interface OfferDetailsProps {
  offer: Offer;
  onClose: () => void;
  onUpdate?: () => void;
}

export function OfferDetails({ offer, onClose, onUpdate }: OfferDetailsProps) {
  const { updateOffer, deleteOffer, offers } = useOffers();
  const { addNewFollowup, markFollowupAsCompleted, clearAllFollowups, hasActiveFollowup, hasOnlyCompletedFollowups, getActiveFollowupDate } = useFollowupManager();
  const [activeTab, setActiveTab] = useState("details");
  const [csatComment, setCsatComment] = useState(offer.csatComment || "");
  const [commentSaving, setCommentSaving] = useState(false);
  const isMobile = useIsMobile();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isConversionCalendarOpen, setIsConversionCalendarOpen] = useState(false);
  const [selectedFollowupDate, setSelectedFollowupDate] = useState<Date | undefined>(
    offer.followupDate ? new Date(offer.followupDate) : undefined
  );
  const [selectedFollowupTime, setSelectedFollowupTime] = useState<string>("09:00");
  const [showFollowupCalendar, setShowFollowupCalendar] = useState(false);
  const [editedOffer, setEditedOffer] = useState(offer);
  
  // Create refs for state management
  const initialRender = useRef(true);
  const isEditingRef = useRef(false);
  
  // Initialize editedOffer only once on mount
  useEffect(() => {
    setEditedOffer(offer);
    initialRender.current = false;
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCalendarOpen && !isConversionCalendarOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose, isCalendarOpen, isConversionCalendarOpen]);

  // Update context when editedOffer changes and we're not in edit mode
  useEffect(() => {
    if (!initialRender.current && !isEditingRef.current && editedOffer?.id) {
      const timeoutId = setTimeout(() => {
        // Only update if there's an actual change
        if (JSON.stringify(editedOffer) !== JSON.stringify(offer)) {
          updateOffer(editedOffer.id, editedOffer);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [editedOffer, updateOffer]);

  // Keep local state in sync with prop changes
  useEffect(() => {
    if (offer.followupDate) {
      setSelectedFollowupDate(new Date(offer.followupDate));
    } else {
      // If no active followup, clear the date
      const activeFollowupDate = getActiveFollowupDate(offer);
      if (activeFollowupDate) {
        setSelectedFollowupDate(new Date(activeFollowupDate));
      } else {
        setSelectedFollowupDate(undefined);
      }
    }
  }, [offer.followupDate, offer, getActiveFollowupDate]);

  const date = new Date(offer.date);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString();

  const getConversionLag = () => {
    if (!offer.converted && offer.converted !== undefined) return null;
    
    const offerDate = new Date(offer.date);
    const today = new Date();
    const days = differenceInDays(today, offerDate);
    
    if (offer.converted && offer.conversionDate) {
      const conversionDate = new Date(offer.conversionDate);
      const conversionLagDays = differenceInDays(conversionDate, offerDate);
      
      if (conversionLagDays === 0) {
        return { text: "Same day", icon: <Zap className="h-4 w-4 text-amber-500" />, fast: true };
      } else if (conversionLagDays <= 3) {
        return { text: `in ${conversionLagDays} day${conversionLagDays > 1 ? 's' : ''}`, icon: <Zap className="h-4 w-4 text-amber-500" />, fast: true };
      } else if (conversionLagDays > 7) {
        return { text: `in ${conversionLagDays} days`, icon: <Clock className="h-4 w-4 text-blue-500" />, fast: false };
      } else {
        return { text: `in ${conversionLagDays} days`, icon: <Clock className="h-4 w-4 text-green-500" />, fast: false };
      }
    } else if (days > 30) {
      return { text: "Over 30 days", icon: <Clock className="h-4 w-4 text-red-500" />, fast: false };
    } else {
      return { text: `${30 - days} days left`, icon: <Clock className="h-4 w-4 text-blue-500" />, fast: false };
    }
  };

  const conversionLag = getConversionLag();

  const handleCSATUpdate = (csat: 'positive' | 'neutral' | 'negative') => {
    const updatedOffer = { ...editedOffer, csat };
    setEditedOffer(updatedOffer);
    onUpdate?.();
    toast({
      title: "CSAT Updated",
      description: "Customer satisfaction rating has been updated.",
    });
  };

  const handleConversionUpdate = (converted: boolean) => {
    if (converted) {
      setIsConversionCalendarOpen(true);
      setEditedOffer(prev => ({ 
        ...prev, 
        converted: true,
        conversionDate: new Date().toISOString().split('T')[0]
      }));
    } else {
      setIsConversionCalendarOpen(false);
      setEditedOffer(prev => ({ 
        ...prev, 
        converted: false,
        conversionDate: undefined
      }));
    }
    onUpdate?.();
  };

  const handleConversionDateChange = (date: Date | undefined) => {
    if (date) {
      setEditedOffer(prev => ({ 
        ...prev,
        conversionDate: date.toISOString().split('T')[0],
        converted: true
      }));
      
      toast({
        title: "Conversion Date Updated",
        description: `Conversion date set to ${format(date, "PPP")}`,
      });
      setIsConversionCalendarOpen(false);
      onUpdate?.();
    }
  };

  const handleCommentSave = () => {
    setCommentSaving(true);
    setEditedOffer(prev => ({ ...prev, csatComment }));
    
    setTimeout(() => {
      setCommentSaving(false);
      toast({
        title: "Comment Saved",
        description: "Your CSAT comment has been updated."
      });
    }, 500);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsatComment(e.target.value);
  };

  const handleDelete = () => {
    deleteOffer(offer.id);
    onClose();
    toast({
      title: "Offer Deleted",
      description: "The offer has been permanently removed.",
      variant: "destructive"
    });
  };

  const handleSaveFollowupDate = async () => {
    if (!selectedFollowupDate) {
      toast({
        title: "Error",
        description: "Please select a valid follow-up date",
        variant: "destructive"
      });
      return;
    }
    
    // Format the date to ISO string (YYYY-MM-DD)
    const formattedDate = format(selectedFollowupDate, 'yyyy-MM-dd');
    
    try {
      // Use the addNewFollowup function from useFollowupManager
      const success = await addNewFollowup(
        offer.id,
        offer,
        formattedDate,
        `Follow-up scheduled on ${format(selectedFollowupDate, 'PPP')}`
      );
      
      if (success) {
        // Close the calendar after successful save
        setShowFollowupCalendar(false);
        toast({
          title: "Success",
          description: "Follow-up date saved successfully"
        });
      }
    } catch (error) {
      console.error("Error saving follow-up date:", error);
      toast({
        title: "Error",
        description: "Failed to save follow-up date",
        variant: "destructive"
      });
    }
  };

  const handleClearFollowupDate = async () => {
    try {
      // Use the clearAllFollowups function from useFollowupManager
      await clearAllFollowups(offer.id, offer);
      setSelectedFollowupDate(undefined);
      setShowFollowupCalendar(false);
      
      toast({
        title: "Success",
        description: "Follow-up date cleared"
      });
    } catch (error) {
      console.error("Error clearing follow-up date:", error);
      toast({
        title: "Error",
        description: "Failed to clear follow-up date",
        variant: "destructive"
      });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFollowupTime(e.target.value);
  };

  // Add helper functions for working with followups
  const hasAnyFollowups = (offer: Offer): boolean => {
    return !!(offer?.followups?.length || offer?.followupDate);
  };
  
  const getCompletedFollowups = (offer: Offer): FollowupItem[] => {
    if (!offer?.followups?.length) return [];
    
    return offer.followups
      .filter(f => f.completed)
      .sort((a, b) => new Date(b.completedAt || b.date).getTime() - new Date(a.completedAt || a.date).getTime());
  };
  
  // Add function to handle marking followup as complete
  const handleMarkFollowupAsCompleted = async () => {
    try {
      // Use the markFollowupAsCompleted function from useFollowupManager
      const success = await markFollowupAsCompleted(offer.id, offer);
      
      if (success) {
        toast({
          title: "Success",
          description: "Follow-up marked as completed"
        });
      }
    } catch (error) {
      console.error("Error marking follow-up as completed:", error);
      toast({
        title: "Error",
        description: "Failed to mark follow-up as completed",
        variant: "destructive"
      });
    }
  };

  // Get active followup information for display
  const activeFollowupDate = getActiveFollowupDate(offer);
  const hasCompletedFollowups = hasOnlyCompletedFollowups(offer);

  // Replace the followup date section in the details card
  const followupSection = (
    <div>
      <div className="grid grid-cols-[100px_1fr] items-center mt-4">
        <h3 className="text-sm font-medium">Follow-up:</h3>
        <div>
          {hasActiveFollowup(offer) ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30">
                  {format(new Date(activeFollowupDate || ''), "PPP")}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-green-500 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-600 dark:border-green-700 dark:bg-green-950/30"
                  onClick={handleMarkFollowupAsCompleted}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Complete
                </Button>
              </div>
              <Popover open={showFollowupCalendar} onOpenChange={setShowFollowupCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm" 
                    className="w-fit h-7 px-2"
                    onClick={() => {}}
                  >
                    <CalendarClock className="h-3.5 w-3.5 mr-1" />
                    Change Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-2 border-b border-border flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={selectedFollowupTime}
                      onChange={(e) => setSelectedFollowupTime(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedFollowupDate}
                    onSelect={setSelectedFollowupDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                  <div className="flex justify-end p-2 border-t border-border">
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={handleSaveFollowupDate}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Update Date
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Popover open={showFollowupCalendar} onOpenChange={setShowFollowupCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm" 
                      className="w-fit h-7 px-2"
                    >
                      <CalendarClock className="h-3.5 w-3.5 mr-1" />
                      Schedule Follow-up
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b border-border flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={selectedFollowupTime}
                        onChange={(e) => setSelectedFollowupTime(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedFollowupDate}
                      onSelect={setSelectedFollowupDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                    <div className="flex justify-end p-2 border-t border-border">
                      <Button 
                        size="sm" 
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={handleSaveFollowupDate}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {hasAnyFollowups(offer) && getCompletedFollowups(offer).length > 0 && (
                  <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-950/30">
                    {getCompletedFollowups(offer).length} completed
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Completed Followups Section */}
      {getCompletedFollowups(offer).length > 0 && (
        <div className="mt-4">
          <Separator className="my-2" />
          <h4 className="text-sm font-medium flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed Follow-ups ({getCompletedFollowups(offer).length})
          </h4>
          {getCompletedFollowups(offer).length > 2 ? (
            <div className="mt-2 border rounded-md">
              <ScrollArea className="h-32">
                <div className="space-y-2 p-2">
                  {getCompletedFollowups(offer).map((followup) => (
                    <div 
                      key={followup.id} 
                      className="text-sm p-2 rounded-md bg-green-50 dark:bg-green-950/30"
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          <Badge variant="outline" className="text-muted-foreground border-green-200 bg-transparent">
                            {format(new Date(followup.date), "PPP")}
                          </Badge>
                        </span>
                        {followup.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            Completed: {format(new Date(followup.completedAt), "PPP")}
                          </span>
                        )}
                      </div>
                      {followup.notes && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {followup.notes.substring(0, 100)}
                          {followup.notes.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              {getCompletedFollowups(offer).map((followup) => (
                <div 
                  key={followup.id} 
                  className="text-sm p-2 rounded-md bg-green-50 dark:bg-green-950/30"
                >
                  <div className="flex justify-between items-center">
                    <span>
                      <Badge variant="outline" className="text-muted-foreground border-green-200 bg-transparent">
                        {format(new Date(followup.date), "PPP")}
                      </Badge>
                    </span>
                    {followup.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        Completed: {format(new Date(followup.completedAt), "PPP")}
                      </span>
                    )}
                  </div>
                  {followup.notes && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {followup.notes.substring(0, 100)}
                      {followup.notes.length > 100 ? '...' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!hasActiveFollowup(offer) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 px-2 text-blue-500 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 dark:border-blue-700 dark:bg-blue-950/30"
              onClick={() => setShowFollowupCalendar(true)}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Schedule New Follow-up
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="grid grid-cols-2 shrink-0">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-[calc(70vh-8rem)] pr-4">
            <div className="space-y-4">
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                      <h3 className="text-lg font-medium">{offer.offerType}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <Hash className="h-3 w-3 mr-1" />
                      Case <CaseLink caseNumber={offer.caseNumber} />
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 text-blue-600 dark:text-blue-400"
                  >
                    {offer.channel}
                  </Badge>
                </div>
              </motion.div>
              
              <Separator />
              
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{formattedDate} at {formattedTime}</span>
                </div>
                
                {offer.converted && offer.conversionDate && (
                  <div className={`flex items-center text-sm p-2 rounded-md ${
                    conversionLag?.fast 
                      ? 'bg-amber-100/50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' 
                      : 'bg-blue-100/50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  }`}>
                    {conversionLag?.icon || <ShoppingCart className="h-4 w-4 mr-2" />}
                    <span>
                      Converted on {format(new Date(offer.conversionDate), "PPP")} 
                      {conversionLag && (
                        <span className="font-medium ml-1">
                          ({conversionLag.text})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                {followupSection}
                
                {offer.notes && (
                  <div className="space-y-1">
                    <Label className="text-sm flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                      Notes
                    </Label>
                    <Card className="bg-secondary/50 shadow-none border border-border/40">
                      <CardContent className="p-3 text-sm">
                        <ScrollArea className={`${offer.notes.length > 200 ? 'max-h-24' : ''}`}>
                          <div className="whitespace-pre-wrap overflow-wrap-break-word">
                            {offer.notes}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
              
              <Separator />
              
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h4 className="font-medium flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1 text-muted-foreground" />
                  Customer Satisfaction
                </h4>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={editedOffer.csat === 'positive' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleCSATUpdate('positive')}
                    className={`${editedOffer.csat === 'positive' ? 'bg-success hover:bg-success/90' : ''}`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Positive
                  </Button>
                  
                  <Button
                    variant={editedOffer.csat === 'neutral' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleCSATUpdate('neutral')}
                    className={`${editedOffer.csat === 'neutral' ? 'bg-warning hover:bg-warning/90' : ''}`}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Neutral
                  </Button>
                  
                  <Button
                    variant={editedOffer.csat === 'negative' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleCSATUpdate('negative')}
                    className={`${editedOffer.csat === 'negative' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Negative
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="csatComment" className="text-sm flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                      CSAT Comment
                    </Label>
                    {commentSaving && (
                      <span className="text-xs text-muted-foreground">Saving...</span>
                    )}
                  </div>
                  <Textarea
                    id="csatComment"
                    placeholder="Add customer feedback or comments about the CSAT rating"
                    value={csatComment}
                    onChange={handleCommentChange}
                    onBlur={handleCommentSave}
                    className="h-20 resize-none"
                    maxLength={500}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCommentSave}
                    className="w-full mt-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save Comment
                  </Button>
                </div>
              </motion.div>
              
              <Separator />
              
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h4 className="font-medium flex items-center">
                  <Check className="h-4 w-4 mr-1 text-muted-foreground" />
                  Conversion Status
                </h4>
                
                <div className="flex items-center gap-2">
                  <Label>Conversion Status</Label>
                  <Switch
                    checked={editedOffer.converted}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setIsConversionCalendarOpen(true);
                        setEditedOffer(prev => ({ 
                          ...prev, 
                          converted: true,
                          conversionDate: new Date().toISOString().split('T')[0]
                        }));
                      } else {
                        setIsConversionCalendarOpen(false);
                        setEditedOffer(prev => ({ 
                          ...prev, 
                          converted: false,
                          conversionDate: undefined
                        }));
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {editedOffer.converted ? "Converted" : "Not Converted"}
                  </span>
                </div>
                
                {/* Conversion Date Picker */}
                {editedOffer.converted && (
                  <div className="mt-3">
                    <Label className="text-sm flex items-center mb-2">
                      <CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                      Conversion Date
                    </Label>
                    <Popover open={isConversionCalendarOpen} onOpenChange={setIsConversionCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {editedOffer.conversionDate 
                            ? format(new Date(editedOffer.conversionDate), "PPP")
                            : "Select conversion date"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedOffer.conversionDate ? new Date(editedOffer.conversionDate) : undefined}
                          onSelect={handleConversionDateChange}
                          disabled={(date) => {
                            const offerDate = new Date(offer.date);
                            offerDate.setHours(0, 0, 0, 0);
                            const selectedDate = new Date(date);
                            selectedDate.setHours(0, 0, 0, 0);
                            return selectedDate < offerDate;
                          }}
                          initialFocus
                        />
                        <div className="flex justify-end p-2 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditedOffer(prev => ({ 
                                ...prev, 
                                converted: false,
                                conversionDate: undefined
                              }));
                              setIsConversionCalendarOpen(false);
                              toast({
                                title: "Conversion Removed",
                                description: "Offer marked as not converted",
                              });
                            }}
                          >
                            Remove Conversion
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </motion.div>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="edit" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-[calc(70vh-8rem)] pr-4">
            <div className="pt-2 space-y-6">
              <OfferForm 
                initialValues={{
                  caseNumber: editedOffer.caseNumber,
                  channel: editedOffer.channel,
                  offerType: editedOffer.offerType,
                  notes: editedOffer.notes,
                  followupDate: editedOffer.followupDate,
                  conversionDate: editedOffer.conversionDate,
                  csat: editedOffer.csat,
                  converted: editedOffer.converted,
                }}
                offerId={editedOffer.id}
                onSuccess={() => {
                  // Mark that we're in edit mode to prevent useEffect updates
                  isEditingRef.current = true;
                  
                  try {
                    // Get the latest offer data from context
                    const updatedOffer = offers.find(o => o.id === editedOffer.id);
                    if (updatedOffer) {
                      // Deep copy to prevent reference issues
                      const freshOffer = JSON.parse(JSON.stringify(updatedOffer));
                      // Update local state with the fresh offer data
                      setEditedOffer(freshOffer);
                    }
                    
                    // Switch back to details tab
                    setActiveTab("details");
                    
                    // Show toast notification
                    toast({
                      title: "Offer Updated",
                      description: "Your changes have been saved."
                    });
                    
                    // Call parent update handler if provided
                    if (onUpdate) onUpdate();
                  } finally {
                    // Clear editing flag after a brief delay (after render)
                    setTimeout(() => {
                      isEditingRef.current = false;
                    }, 100);
                  }
                }}
              />
              
              <div className="mt-6 pt-4 border-t border-border/30">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full">
                      <Trash className="h-4 w-4 mr-1" />
                      Delete Offer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this offer record. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
