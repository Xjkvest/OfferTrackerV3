import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useOffers, Offer } from "@/context/OfferContext";
import { OfferDialog } from "@/components/OfferDialog";
import { PlusCircle, Clock, Filter, Search, Download, X, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { getTodayDateString, toISODateString } from "@/utils/dateUtils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format, parseISO, differenceInDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CaseLink } from "@/components/CaseLink";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Minus, 
  CalendarClock, 
  Calendar as CalendarIcon,
  ArrowUpDown,
  Mail,
  MessageCircle,
  Phone,
  Zap,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { useFollowupManager } from "@/hooks/useFollowupManager";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { filterOffers, getRecentOffers } from "@/utils/offerFilters";
import { exportToCsv } from "@/utils/exportData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sorting options
type SortField = 'date' | 'type' | 'channel' | 'csat' | 'converted' | 'followup';
type SortDirection = 'asc' | 'desc';

const Offers = () => {
  const { offers, updateOffer } = useOffers();
  const { offerTypes, channels } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    hasActiveFollowup, 
    getActiveFollowupDate, 
    markFollowupAsCompleted, 
    addNewFollowup,
    getFollowupStatus 
  } = useFollowupManager();
  
  const [activeTab, setActiveTab] = useState(() => {
    // Start with the "all" tab if search params exist
    return searchParams.toString() ? "all" : "recent";
  });
  
  // Dialog state
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);
  const [followupOfferId, setFollowupOfferId] = useState<string | null>(null);
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [conversionOfferId, setConversionOfferId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Filter states (persisted in URL for sharing/bookmarking)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(searchParams.get("channel"));
  const [selectedType, setSelectedType] = useState<string | null>(searchParams.get("type"));
  const [selectedCSAT, setSelectedCSAT] = useState<string | null>(searchParams.get("csat"));
  const [selectedConversion, setSelectedConversion] = useState<string | null>(searchParams.get("converted"));
  const [startDate, setStartDate] = useState<Date | null>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : null
  );
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Set the "all" tab active when filters are applied through URL params
  useEffect(() => {
    if (searchParams.toString() && activeTab !== 'all') {
      setActiveTab('all');
    }
  }, [searchParams, activeTab]);
  
  // Update search params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    // Only add params that have values
    if (searchTerm) newParams.set("search", searchTerm);
    if (selectedChannel) newParams.set("channel", selectedChannel);
    if (selectedType) newParams.set("type", selectedType);
    if (selectedCSAT) newParams.set("csat", selectedCSAT);
    if (selectedConversion) newParams.set("converted", selectedConversion);
    if (startDate) newParams.set("startDate", toISODateString(startDate));
    if (endDate) newParams.set("endDate", toISODateString(endDate));
    
    // Only update if they've changed to avoid unnecessary history entries
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
    
    // Always switch to All tab if filters are applied
    if (newParams.toString() && activeTab !== 'all') {
      setActiveTab('all');
    }
  }, [
    searchTerm, 
    selectedChannel, 
    selectedType, 
    selectedCSAT, 
    selectedConversion, 
    startDate, 
    endDate, 
    searchParams, 
    setSearchParams,
    activeTab,
    setActiveTab
  ]);
  
  // Handler for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSortField(field);
      setSortDirection('desc'); // Default to newest first for date, etc.
    }
  };
  
  // Handler for clicking an offer to view details
  const handleOfferClick = (offerId: string) => {
    setSelectedOfferId(offerId);
    setOfferDialogOpen(true);
  };
  
  // Close dialog handler
  const handleCloseDialog = (open: boolean) => {
    setOfferDialogOpen(open);
    if (!open) {
      setSelectedOfferId(null);
    }
  };
  
  // Offer counts
  const offerCounts = useMemo(() => {
    return {
      total: offers.length,
      recent: offers.filter(o => {
        const offerDate = new Date(o.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return offerDate >= thirtyDaysAgo;
      }).length
    };
  }, [offers]);
  
  // Get filtered and sorted offers based on active tab
  const displayedOffers = useMemo(() => {
    let filteredOffers = [];
    
    if (activeTab === 'recent') {
      // Recent 30 offers - filtered, but limited to 30 most recent
      filteredOffers = getRecentOffers(offers, 30);
    } else {
      // All offers
      filteredOffers = offers;
    }
    
    // Apply all filters
    filteredOffers = filterOffers(filteredOffers, {
      searchTerm: searchTerm || undefined,
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
      channel: selectedChannel || undefined,
      offerType: selectedType || undefined,
      csat: selectedCSAT as 'positive' | 'neutral' | 'negative' | undefined,
      converted: selectedConversion === 'converted' ? true : selectedConversion === 'not-converted' ? false : undefined
    });
    
    // Apply sorting
    return [...filteredOffers].sort((a, b) => {
      const directionMultiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'date':
          return directionMultiplier * (new Date(b.date).getTime() - new Date(a.date).getTime());
        
        case 'type':
          return directionMultiplier * a.offerType.localeCompare(b.offerType);
        
        case 'channel':
          return directionMultiplier * a.channel.localeCompare(b.channel);
        
        case 'csat': {
          // Sort by CSAT (positive > neutral > negative > undefined)
          const csatOrder = { positive: 3, neutral: 2, negative: 1, undefined: 0 };
          const aValue = csatOrder[a.csat as keyof typeof csatOrder] || 0;
          const bValue = csatOrder[b.csat as keyof typeof csatOrder] || 0;
          return directionMultiplier * (aValue - bValue);
        }
        
        case 'converted': {
          // Sort by conversion status (true > undefined > false)
          const conversionOrder = { true: 2, undefined: 1, false: 0 };
          const aValue = conversionOrder[String(a.converted) as keyof typeof conversionOrder];
          const bValue = conversionOrder[String(b.converted) as keyof typeof conversionOrder];
          return directionMultiplier * (aValue - bValue);
        }
        
        case 'followup': {
          // Sort by followup status (overdue > due today > active > completed > none)
          const followupOrder = { 
            'overdue': 4, 
            'due-today': 3, 
            'active': 2, 
            'completed': 1, 
            'none': 0 
          };
          const aStatus = getFollowupStatus(a);
          const bStatus = getFollowupStatus(b);
          const aValue = followupOrder[aStatus as keyof typeof followupOrder] || 0;
          const bValue = followupOrder[bStatus as keyof typeof followupOrder] || 0;
          return directionMultiplier * (aValue - bValue);
        }
        
        default:
          return 0;
      }
    });
  }, [
    offers, 
    activeTab, 
    searchTerm, 
    startDate, 
    endDate,
    selectedChannel,
    selectedType,
    selectedCSAT,
    selectedConversion,
    sortField, 
    sortDirection, 
    getFollowupStatus
  ]);
  
  // Helper functions 
  
  // Get channel icon
  const getChannelIcon = (channel: string) => {
    const channelLower = channel.toLowerCase();
    if (channelLower.includes('chat')) return <MessageCircle className="h-3.5 w-3.5" />;
    if (channelLower.includes('email')) return <Mail className="h-3.5 w-3.5" />;
    if (channelLower.includes('call') || channelLower.includes('phone')) return <Phone className="h-3.5 w-3.5" />;
    return null;
  };
  
  // Get conversion lag
  const getConversionLag = (offer: Offer) => {
    if (!offer.converted && offer.converted !== undefined) return null;
    
    const offerDate = new Date(offer.date);
    const today = new Date();
    
    // Set both dates to midnight for accurate day comparison
    offerDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const lagDays = differenceInDays(today, offerDate);
    
    if (offer.converted && offer.conversionDate) {
      const conversionDate = new Date(offer.conversionDate);
      conversionDate.setHours(0, 0, 0, 0);
      const conversionLagDays = differenceInDays(conversionDate, offerDate);
      
      if (conversionLagDays === 0) {
        return { text: "Same day", icon: <Zap className="h-3 w-3 text-amber-500" />, fast: true };
      } else if (conversionLagDays <= 3) {
        return { 
          text: `${conversionLagDays} day${conversionLagDays > 1 ? 's' : ''}`, 
          icon: <Zap className="h-3 w-3 text-amber-500" />, 
          fast: true 
        };
      } else if (conversionLagDays > 7) {
        return { text: `${conversionLagDays} days`, icon: <CalendarClock className="h-3 w-3 text-blue-500" />, fast: false };
      } else {
        return { text: `${conversionLagDays} days`, icon: <CalendarClock className="h-3 w-3 text-green-500" />, fast: false };
      }
    } else if (lagDays > 30) {
      return { text: "Over 30 days", icon: <CalendarClock className="h-3 w-3 text-red-500" />, fast: false };
    } else {
      return { text: `${30 - lagDays} days left`, icon: <CalendarClock className="h-3 w-3 text-blue-500" />, fast: false };
    }
  };
  
  // CSAT handlers
  const handleCSATUpdate = (offerId: string, csat: 'positive' | 'neutral' | 'negative') => {
    updateOffer(offerId, { csat });
    toast({
      title: "CSAT Updated",
      description: "Customer satisfaction rating has been updated.",
    });
  };
  
  // Conversion handlers
  const handleConversionUpdate = (offerId: string, converted: boolean) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    if (converted) {
      updateOffer(offerId, { 
        converted: true,
        conversionDate: getTodayDateString()
      });
      toast({
        title: "Conversion Status Updated",
        description: "Offer marked as converted.",
      });
    } else {
      updateOffer(offerId, { 
        converted: false,
        conversionDate: undefined
      });
      toast({
        title: "Conversion Status Updated",
        description: "Offer marked as not converted.",
      });
    }
  };

  const handleConversionDateSelect = (offerId: string, date: Date | undefined) => {
    if (date) {
      updateOffer(offerId, { 
        converted: true,
        conversionDate: toISODateString(date)
      });
      toast({
        title: "Offer Converted",
        description: `Marked as converted on ${format(date, "PPP")}`,
      });
    }
  };
  
  // Followup handlers
  const handleFollowupDateChange = (offerId: string, date: Date | undefined) => {
    if (!date) return;
    
    const dateString = toISODateString(date);
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    // Add a new followup
    addNewFollowup(offerId, offer, dateString, "Scheduled from offers table");
    
    toast({
      title: "Follow-up Scheduled",
      description: `Follow-up set for ${format(date, "PPP")}`,
    });
  };
  
  const handleMarkFollowupComplete = async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    try {
      const success = await markFollowupAsCompleted(offerId, offer);
      
      if (success) {
        toast({
          title: "Follow-up Completed",
          description: "Follow-up has been marked as completed."
        });
      }
    } catch (error) {
      console.error("Error completing followup:", error);
      toast({
        title: "Error",
        description: "Failed to mark followup as completed.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddFollowupForToday = async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = getTodayDateString();
      
      // Add a new followup for today
      const success = await addNewFollowup(
        offerId, 
        offer, 
        today, 
        "Follow-up added for today"
      );
      
      if (success) {
        toast({
          title: "Follow-up Scheduled",
          description: "Follow-up has been scheduled for today."
        });
      }
    } catch (error) {
      console.error("Error scheduling followup:", error);
      toast({
        title: "Error",
        description: "Failed to schedule followup for today.",
        variant: "destructive"
      });
    }
  };
  
  // Helper for rendering followup info
  const getFollowupInfo = (offer: Offer) => {
    const status = getFollowupStatus(offer);
    
    switch (status) {
      case 'overdue':
        return {
          label: "Overdue",
          icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
          class: "text-red-500"
        };
      case 'due-today':
        return {
          label: "Due Today",
          icon: <CalendarClock className="h-3.5 w-3.5 text-yellow-500" />,
          class: "text-yellow-500"
        };
      case 'active': {
        const date = getActiveFollowupDate(offer);
        return {
          label: date ? format(parseISO(date), "MMM d") : "Scheduled",
          icon: <CalendarIcon className="h-3.5 w-3.5 text-blue-500" />,
          class: "text-blue-500"
        };
      }
      case 'completed':
        return {
          label: "Completed",
          icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
          class: "text-green-500"
        };
      default:
        return null;
    }
  };
  
  // Render the actions dropdown
  const renderActionsDropdown = (offer: Offer) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* CSAT options */}
          <DropdownMenuItem onClick={() => handleCSATUpdate(offer.id, 'positive')}>
            <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
            Rate positive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCSATUpdate(offer.id, 'neutral')}>
            <Minus className="h-4 w-4 mr-2 text-amber-500" />
            Rate neutral
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCSATUpdate(offer.id, 'negative')}>
            <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
            Rate negative
          </DropdownMenuItem>
          
          {/* Conversion options */}
          {offer.converted ? (
            <DropdownMenuItem onClick={() => handleConversionUpdate(offer.id, false)}>
              <X className="h-4 w-4 mr-2 text-red-500" />
              Remove conversion
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => {
              setConversionOfferId(offer.id);
              setConversionDialogOpen(true);
            }}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Mark converted
            </DropdownMenuItem>
          )}
          
          {/* Followup options */}
          <DropdownMenuItem onClick={() => handleAddFollowupForToday(offer.id)}>
            <CalendarClock className="h-4 w-4 mr-2 text-blue-500" />
            Add followup for today
          </DropdownMenuItem>
          
          {hasActiveFollowup(offer) && (
            <DropdownMenuItem onClick={() => handleMarkFollowupComplete(offer.id)}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Complete followup
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => {
            if (offer?.id) {
              setFollowupOfferId(offer.id);
              setFollowupDialogOpen(true);
            }
          }}>
            <CalendarIcon className="h-4 w-4 mr-2 text-blue-500" />
            Schedule followup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  // Date filter helpers
  const setLastWeekFilter = () => {
    const today = new Date();
    const lastMonday = new Date(today);
    const day = today.getDay();
    // Set to previous Monday
    lastMonday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
    setStartDate(lastMonday);
    setEndDate(today);
  };

  const setLastMonthFilter = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDayOfMonth);
    setEndDate(today);
  };

  const setLast30DaysFilter = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedChannel(null);
    setSelectedType(null);
    setSelectedCSAT(null);
    setSelectedConversion(null);
    setStartDate(null);
    setEndDate(null);
    // Clear URL params too
    setSearchParams(new URLSearchParams());
  };
  
  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedChannel) count++;
    if (selectedType) count++;
    if (selectedCSAT) count++;
    if (selectedConversion) count++;
    if (startDate || endDate) count++;
    return count;
  }, [searchTerm, selectedChannel, selectedType, selectedCSAT, selectedConversion, startDate, endDate]);
  
  const emptyState = (
    <TableRow>
      <TableCell colSpan={isMobile ? 4 : 8} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Filter className="h-8 w-8 mb-3 opacity-40" />
          <p>No offers found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </TableCell>
    </TableRow>
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <motion.main 
        className="flex-1 container max-w-6xl mx-auto p-4 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage and track all your customer offers
            </p>
          </motion.div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="relative w-full md:w-60">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search offers..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              title="Export to CSV"
              onClick={() => exportToCsv(displayedOffers)}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-muted" : ""}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            
          <motion.div
              initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button 
              onClick={() => {
                setSelectedOfferId(null);
                setOfferDialogOpen(true);
              }}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Offer
            </Button>
          </motion.div>
          </div>
        </div>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Card className="bg-card border border-border/30 shadow-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recent" className="relative">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Recent {offerCounts.recent && <span className="text-xs ml-1">({offerCounts.recent})</span>}</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      <span>All Offers {offerCounts.total && <span className="text-xs ml-1">({offerCounts.total})</span>}</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <CardContent className="p-4 pt-6">
                  {/* Filter Panel */}
                  {showFilters && (
                    <div className="p-4 mb-4 bg-muted/40 rounded-lg border">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-sm">Filters</h3>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={resetFilters}
                            className="h-8 gap-1 text-xs"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Reset
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                            className="h-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Filter */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Date Range</label>
                          <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="justify-start text-left font-normal h-8">
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    {startDate ? format(startDate, "PPP") : "Start Date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={startDate || undefined}
                                    onSelect={setStartDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="justify-start text-left font-normal h-8">
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    {endDate ? format(endDate, "PPP") : "End Date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={endDate || undefined}
                                    onSelect={setEndDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5">
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={setLastWeekFilter}>
                                This Week
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={setLastMonthFilter}>
                                This Month
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={setLast30DaysFilter}>
                                Last 30 Days
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Channel & Type Filters */}
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Channel</label>
                            <Select
                              value={selectedChannel || "all"}
                              onValueChange={(value) => setSelectedChannel(value === "all" ? null : value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="All Channels" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Channels</SelectItem>
                                {channels.map((channel) => (
                                  <SelectItem key={channel} value={channel}>
                                    {channel}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Offer Type</label>
                            <Select
                              value={selectedType || "all"}
                              onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="All Types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {offerTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* CSAT & Conversion Filters */}
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">CSAT Rating</label>
                            <Select
                              value={selectedCSAT || "all"}
                              onValueChange={(value) => setSelectedCSAT(value === "all" ? null : value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="All Ratings" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="positive">Positive</SelectItem>
                                <SelectItem value="neutral">Neutral</SelectItem>
                                <SelectItem value="negative">Negative</SelectItem>
                                <SelectItem value="rated">Any Rating</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Conversion Status</label>
                            <Select
                              value={selectedConversion || "all"}
                              onValueChange={(value) => setSelectedConversion(value === "all" ? null : value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="All Statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="not-converted">Not Converted</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <TooltipProvider>
                    <div className="rounded-md border bg-card">
                      <ScrollArea className="">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead 
                                className="w-[180px] cursor-pointer"
                                onClick={() => handleSort('type')}
                              >
                                <div className="flex items-center">
                                  Offer
                                  {sortField === 'type' && (
                                    <ArrowUpDown className={`ml-1 h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                              
                              {!isMobile && (
                                <TableHead className="w-[200px]">
                                  <div className="flex items-center">Notes</div>
                                </TableHead>
                              )}
                              
                              <TableHead 
                                className="w-[120px] cursor-pointer"
                                onClick={() => handleSort('date')}
                              >
                                <div className="flex items-center">
                                  Date
                                  {sortField === 'date' && (
                                    <ArrowUpDown className={`ml-1 h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                              
                              {!isMobile && (
                                <TableHead 
                                  className="w-[120px] cursor-pointer"
                                  onClick={() => handleSort('channel')}
                                >
                                  <div className="flex items-center">
                                    Channel
                                    {sortField === 'channel' && (
                                      <ArrowUpDown className={`ml-1 h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                    )}
                                  </div>
                                </TableHead>
                              )}
                              
                              <TableHead 
                                className="w-[100px] cursor-pointer"
                                onClick={() => handleSort('csat')}
                              >
                                <div className="flex items-center">
                                  CSAT
                                  {sortField === 'csat' && (
                                    <ArrowUpDown className={`ml-1 h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                              
                              <TableHead 
                                className="w-[140px] cursor-pointer"
                                onClick={() => handleSort('converted')}
                              >
                                <div className="flex items-center">
                                  Conversion
                                  {sortField === 'converted' && (
                                    <ArrowUpDown className={`ml-1 h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                              
                              <TableHead 
                                className="w-[120px] cursor-pointer"
                                onClick={() => handleSort('followup')}
                              >
                                <div className="flex items-center">
                                  Follow-up
                                  {sortField === 'followup' && (
                                    <ArrowUpDown className={`ml-1 h-3.5 w-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                  )}
                                </div>
                              </TableHead>
                              
                              <TableHead className="w-[60px]">
                                <span className="sr-only">Actions</span>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          
                          <TableBody>
                            {displayedOffers.length === 0 ? (
                              emptyState
                            ) : (
                              displayedOffers.map((offer) => {
                                const followupInfo = getFollowupInfo(offer);
                                const conversionLag = getConversionLag(offer);
                                
                                return (
                                  <TableRow 
                                    key={offer.id}
                                    className="group cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleOfferClick(offer.id)}
                                  >
                                    <TableCell>
                                      <div className="flex flex-col">
                                        <div className="font-medium truncate">{offer.offerType}</div>
                                        <div className="text-xs text-muted-foreground">
                                          <CaseLink caseNumber={offer.caseNumber} iconSize={3} />
                                        </div>
                                      </div>
                                    </TableCell>
                                    
                                    {!isMobile && (
                                      <TableCell>
                                        {offer.notes ? (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                                                {offer.notes}
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-sm">
                                              {offer.notes}
                                            </TooltipContent>
                                          </Tooltip>
                                        ) : (
                                          <span className="text-xs text-muted-foreground italic">No notes</span>
                                        )}
                                      </TableCell>
                                    )}
                                    
                                    <TableCell>
                                      <div className="text-xs">
                                        {format(parseISO(offer.date), "MMM d, yyyy")}
                                        <div className="text-muted-foreground">
                                          {format(parseISO(offer.date), "h:mm a")}
                                        </div>
                                      </div>
                                    </TableCell>
                                    
                                    {!isMobile && (
                                      <TableCell>
                                        <div className="flex items-center text-xs">
                                          {getChannelIcon(offer.channel)}
                                          <span className="ml-1">{offer.channel}</span>
                                        </div>
                                      </TableCell>
                                    )}
                                    
                                    <TableCell>
                                      {offer.csat ? (
                                        <Badge 
                                          variant="outline" 
                                          className={`
                                            ${offer.csat === 'positive' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200' : 
                                             offer.csat === 'neutral' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200' : 
                                             'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200'}
                                          `}
                                        >
                                          {offer.csat === 'positive' ? (
                                            <><ThumbsUp className="h-3 w-3 mr-1" /> Positive</>
                                          ) : offer.csat === 'neutral' ? (
                                            <><Minus className="h-3 w-3 mr-1" /> Neutral</>
                                          ) : (
                                            <><ThumbsDown className="h-3 w-3 mr-1" /> Negative</>
                                          )}
                                        </Badge>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">Not rated</span>
                                      )}
                                    </TableCell>
                                    
                                    <TableCell>
                                      {offer.converted !== undefined ? (
                                        <div>
                                          {offer.converted ? (
                                            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200">
                                              <CheckCircle className="h-3 w-3 mr-1" /> Converted
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">
                                              <X className="h-3 w-3 mr-1" /> Not converted
                                            </Badge>
                                          )}
                                          {offer.converted && conversionLag && (
                                            <div className="text-xs flex items-center mt-1 text-muted-foreground">
                                              {conversionLag.icon}
                                              <span className="ml-1">{conversionLag.text}</span>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-muted-foreground flex items-center">
                                          <CalendarClock className="h-3.5 w-3.5 mr-1" />
                                          <span>
                                            {(() => {
                                              const offerDate = parseISO(offer.date);
                                              const today = new Date();
                                              const daysSince = differenceInDays(today, offerDate);
                                              const daysLeft = 30 - daysSince;
                                              
                                              if (daysLeft <= 0) {
                                                return "Overdue";
                                              } else {
                                                return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
                                              }
                                            })()}
                                          </span>
                                        </div>
                                      )}
                                    </TableCell>
                                    
                                    <TableCell>
                                      {followupInfo ? (
                                        <div className={`text-xs flex items-center ${followupInfo.class}`}>
                                          {followupInfo.icon}
                                          <span className="ml-1">{followupInfo.label}</span>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">No followup</span>
                                      )}
                                    </TableCell>
                                    
                                    <TableCell>
                                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                                        {renderActionsDropdown(offer)}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </TooltipProvider>
                </CardContent>
                </Tabs>
            </Card>
          </motion.div>
        </motion.div>
        
        <OfferDialog 
          open={offerDialogOpen} 
          onOpenChange={handleCloseDialog} 
          offerId={selectedOfferId || undefined}
          onSetupComplete={() => {
            // Refresh data after setting up a new offer
          }}
        />
        
        {/* Follow-up Schedule Dialog */}
        {followupDialogOpen && followupOfferId && (() => {
          const selectedOffer = offers.find(o => o.id === followupOfferId);
          if (!selectedOffer) return null;
          
          return (
            <Dialog open={followupDialogOpen} onOpenChange={setFollowupDialogOpen}>
              <DialogContent className="sm:max-w-[350px] p-0 overflow-hidden">
                <DialogHeader className="px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 border-b">
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-blue-500" />
                    Schedule Follow-up
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      {selectedOffer.offerType}
                      <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                        #{selectedOffer.caseNumber}
                      </span>
                    </p>
                  </div>
                </DialogHeader>
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={(date) => {
                      if (date && followupOfferId) {
                        handleFollowupDateChange(followupOfferId, date);
                        setFollowupDialogOpen(false);
                        setFollowupOfferId(null);
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                    className="w-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          );
        })()}

        {/* Conversion Date Dialog */}
        {conversionDialogOpen && conversionOfferId && (() => {
          const selectedOffer = offers.find(o => o.id === conversionOfferId);
          if (!selectedOffer) return null;
          
          return (
            <Dialog open={conversionDialogOpen} onOpenChange={setConversionDialogOpen}>
              <DialogContent className="sm:max-w-[350px] p-0 overflow-hidden">
                <DialogHeader className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border-b">
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Select Conversion Date
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      {selectedOffer.offerType}
                      <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                        #{selectedOffer.caseNumber}
                      </span>
                    </p>
                  </div>
                </DialogHeader>
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={(date) => {
                      if (date && conversionOfferId) {
                        handleConversionDateSelect(conversionOfferId, date);
                        setConversionDialogOpen(false);
                        setConversionOfferId(null);
                      }
                    }}
                    disabled={(date) => {
                      const offerDate = new Date(selectedOffer.date);
                      offerDate.setHours(0, 0, 0, 0);
                      return date < offerDate;
                    }}
                    initialFocus
                    className="w-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          );
        })()}
      </motion.main>
    </div>
  );
};

export default Offers;
