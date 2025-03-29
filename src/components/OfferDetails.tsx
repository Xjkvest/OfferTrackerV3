import React, { useState } from "react";
import { Offer, useOffers } from "@/context/OfferContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ThumbsUp, ThumbsDown, Minus, CheckCircle, XCircle, Trash, MessageSquare, Check, Tag, Hash, CalendarClock, Clock, Zap, ShoppingCart } from "lucide-react";
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
import { useEffect } from "react";

interface OfferDetailsProps {
  offer: Offer;
  onClose: () => void;
  onUpdate?: () => void;
}

export function OfferDetails({ offer, onClose, onUpdate }: OfferDetailsProps) {
  const { updateOffer, deleteOffer } = useOffers();
  const [activeTab, setActiveTab] = useState("details");
  const [csatComment, setCsatComment] = useState(offer.csatComment || "");
  const [commentSaving, setCommentSaving] = useState(false);
  const isMobile = useIsMobile();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isConversionCalendarOpen, setIsConversionCalendarOpen] = useState(false);
  const [followupTime, setFollowupTime] = useState<string>(() => {
    if (offer.followupDate) {
      const d = new Date();
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return "09:00";
  });

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCalendarOpen && !isConversionCalendarOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose, isCalendarOpen, isConversionCalendarOpen]);

  const date = new Date(offer.date);
  const formattedDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString();

  const getConversionLag = () => {
    if (!offer.converted || !offer.conversionDate) return null;
    
    const offerDate = new Date(offer.date);
    const conversionDate = new Date(offer.conversionDate);
    const days = differenceInDays(conversionDate, offerDate);
    
    if (days === 0) {
      return { text: "Same day", icon: <Zap className="h-4 w-4 text-amber-500" />, fast: true };
    } else if (days <= 3) {
      return { text: `in ${days} day${days > 1 ? 's' : ''}`, icon: <Zap className="h-4 w-4 text-amber-500" />, fast: true };
    } else if (days > 7) {
      return { text: `in ${days} days`, icon: <Clock className="h-4 w-4 text-blue-500" />, fast: false };
    } else {
      return { text: `in ${days} days`, icon: <Clock className="h-4 w-4 text-green-500" />, fast: false };
    }
  };

  const conversionLag = getConversionLag();

  const handleCSATUpdate = (csat: 'positive' | 'neutral' | 'negative') => {
    updateOffer(offer.id, { csat });
    onUpdate?.();
    toast({
      title: "CSAT Updated",
      description: "Customer satisfaction rating has been updated.",
    });
  };

  const handleConversionUpdate = (converted: boolean) => {
    if (converted && !offer.conversionDate) {
      updateOffer(offer.id, { 
        converted, 
        conversionDate: new Date().toISOString().split('T')[0] 
      });
    } else if (!converted) {
      updateOffer(offer.id, { 
        converted,
        conversionDate: undefined
      });
    } else {
      updateOffer(offer.id, { converted });
    }
    
    onUpdate?.();
    toast({
      title: "Conversion Status Updated",
      description: `Offer marked as ${converted ? 'converted' : 'not converted'}.`,
    });
  };

  const handleConversionDateChange = (date: Date | undefined) => {
    if (date) {
      updateOffer(offer.id, { 
        conversionDate: date.toISOString().split('T')[0],
        converted: true
      });
      
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
    updateOffer(offer.id, { csatComment });
    
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

  const handleFollowupDateChange = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = followupTime.split(':').map(Number);
      date.setHours(hours);
      date.setMinutes(minutes);
      
      updateOffer(offer.id, { 
        followupDate: date.toISOString().split('T')[0] 
      });
      
      toast({
        title: "Follow-up Date Updated",
        description: `Follow-up scheduled for ${format(date, "PPP")}`,
      });
    }
  };

  const handleSaveDateTime = () => {
    if (offer.followupDate) {
      const date = new Date(offer.followupDate);
      const [hours, minutes] = followupTime.split(':').map(Number);
      date.setHours(hours);
      date.setMinutes(minutes);
      
      updateOffer(offer.id, { 
        followupDate: date.toISOString().split('T')[0] 
      });
      
      toast({
        title: "Follow-up Time Updated",
        description: `Follow-up time set to ${followupTime}`,
      });
    }
    setIsCalendarOpen(false);
  };

  const handleClearFollowupDate = (event: React.MouseEvent) => {
    event.stopPropagation();
    updateOffer(offer.id, { followupDate: undefined });
    setIsCalendarOpen(false);
    toast({
      title: "Follow-up Removed",
      description: "Follow-up date has been cleared."
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowupTime(e.target.value);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-2">
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
            
            {offer.followupDate && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-950/50 p-2 rounded-md">
                <CalendarClock className="h-4 w-4 mr-2" />
                <span>Follow-up scheduled for {format(new Date(offer.followupDate), "PPP")}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-sm flex items-center">
                <CalendarClock className="h-3 w-3 mr-1 text-muted-foreground" />
                Follow-up Date
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {offer.followupDate ? (
                      <span className="flex items-center justify-between w-full">
                        {format(new Date(offer.followupDate), "PPP")}
                        <XCircle 
                          className="h-4 w-4 opacity-50 hover:opacity-100" 
                          onClick={handleClearFollowupDate}
                        />
                      </span>
                    ) : (
                      <span>Set follow-up date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b border-border flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={followupTime}
                      onChange={handleTimeChange}
                      className="h-8"
                    />
                  </div>
                  <Calendar
                    mode="single"
                    selected={offer.followupDate ? new Date(offer.followupDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleFollowupDateChange(date);
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      const offerDate = new Date(offer.date);
                      offerDate.setHours(0, 0, 0, 0);
                      
                      return date > today || date < offerDate;
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                  <div className="flex justify-end p-3 border-t border-border">
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={handleSaveDateTime}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {offer.converted && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center">
                  <ShoppingCart className="h-3 w-3 mr-1 text-muted-foreground" />
                  Conversion Date
                </Label>
                <Popover open={isConversionCalendarOpen} onOpenChange={setIsConversionCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {offer.conversionDate ? (
                        <span className="flex items-center justify-between w-full">
                          {format(new Date(offer.conversionDate), "PPP")}
                          {conversionLag && (
                            <span className="flex items-center ml-1 text-muted-foreground">
                              {conversionLag.icon}
                              <span className="ml-1 text-xs">{conversionLag.text}</span>
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>Set conversion date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={offer.conversionDate ? new Date(offer.conversionDate) : undefined}
                      onSelect={handleConversionDateChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        const offerDate = new Date(offer.date);
                        offerDate.setHours(0, 0, 0, 0);
                        
                        return date > today || date < offerDate;
                      }}
                      initialFocus
                    />
                    <div className="flex justify-end p-3 border-t border-border">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsConversionCalendarOpen(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {offer.notes && (
              <div className="space-y-1">
                <Label className="text-sm flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1 text-muted-foreground" />
                  Notes
                </Label>
                <Card className="bg-secondary/50 shadow-none border border-border/40">
                  <CardContent className="p-3 text-sm">
                    <div className="whitespace-pre-wrap overflow-wrap-break-word">
                      {offer.notes}
                    </div>
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
                variant={offer.csat === 'positive' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCSATUpdate('positive')}
                className={`${offer.csat === 'positive' ? 'bg-success hover:bg-success/90' : ''}`}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Positive
              </Button>
              
              <Button
                variant={offer.csat === 'neutral' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCSATUpdate('neutral')}
                className={`${offer.csat === 'neutral' ? 'bg-warning hover:bg-warning/90' : ''}`}
              >
                <Minus className="h-4 w-4 mr-1" />
                Neutral
              </Button>
              
              <Button
                variant={offer.csat === 'negative' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleCSATUpdate('negative')}
                className={`${offer.csat === 'negative' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
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
            
            <div className="flex items-center space-x-2">
              <Button
                variant={offer.converted ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleConversionUpdate(true)}
                className={`${offer.converted ? 'bg-success hover:bg-success/90' : ''}`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Converted
              </Button>
              
              <Button
                variant={offer.converted === false ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleConversionUpdate(false)}
                className={`${offer.converted === false ? 'bg-muted-foreground hover:bg-muted-foreground/90' : ''}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Not Converted
              </Button>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="edit">
          <div className="pt-2 space-y-6">
            <OfferForm 
              initialValues={{
                caseNumber: offer.caseNumber,
                channel: offer.channel,
                offerType: offer.offerType,
                notes: offer.notes,
                followupDate: offer.followupDate,
                csat: offer.csat,
                converted: offer.converted,
                conversionDate: offer.conversionDate,
              }}
              offerId={offer.id}
              onSuccess={() => {
                setActiveTab("details");
                toast({
                  title: "Offer Updated",
                  description: "Your changes have been saved."
                });
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
