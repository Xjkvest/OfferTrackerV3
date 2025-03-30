import React, { useState, useEffect, useRef, useMemo } from "react";
import { Offer, useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OfferItem } from "./OfferItem";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, X, SlidersHorizontal, CalendarIcon, ListFilter, Sparkles, Download, CalendarDays, AlertCircle, CalendarClock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfWeek, startOfMonth, endOfMonth, subDays, addDays, subMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { CaseLink } from "./CaseLink";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { exportToCsv } from "@/utils/exportData";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { differenceInDays } from "date-fns";
import { filterOffers, getRecentOffers, getTodaysOffers } from "@/utils/offerFilters";

interface OfferListProps {
  title?: string;
  filterOptions?: {
    showDateFilter?: boolean;
    showChannelFilter?: boolean;
    showTypeFilter?: boolean;
    showCSATFilter?: boolean;
    showConversionFilter?: boolean;
  };
  mode?: 'today' | 'recent' | 'all';
  searchTerm?: string;
}

// Helper function to check if an offer has active (incomplete) followups
const hasActiveFollowup = (offer: Offer): boolean => {
  // Check for new followups structure first
  if (offer.followups?.length) {
    return offer.followups.some(f => !f.completed);
  }
  // Fall back to legacy followupDate
  return !!offer.followupDate;
};

// Get the most recent active followup date
const getActiveFollowupDate = (offer: Offer): string | null => {
  // If using new structure
  if (offer.followups?.length) {
    const activeFollowups = offer.followups.filter(f => !f.completed);
    if (activeFollowups.length > 0) {
      // Sort by date (earliest first) and return the first one
      const sortedFollowups = [...activeFollowups].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return sortedFollowups[0].date;
    }
    return null;
  }
  // Fall back to legacy field
  return offer.followupDate || null;
};

export function OfferList({ 
  title = "All Offers", 
  filterOptions = {
    showDateFilter: true,
    showChannelFilter: true,
    showTypeFilter: true,
    showCSATFilter: true,
    showConversionFilter: true
  },
  mode = 'all',
  searchTerm: externalSearchTerm
}: OfferListProps) {
  const { offers } = useOffers();
  const { channels, offerTypes } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || searchParams.get("search") || "");
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
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();
  
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<string>("current");
  const [exportStartDate, setExportStartDate] = useState<Date | null>(startDate);
  const [exportEndDate, setExportEndDate] = useState<Date | null>(endDate);
  const [refreshKey, setRefreshKey] = useState(0);

  const setLastWeekFilter = () => {
    const today = new Date();
    const lastMonday = startOfWeek(today, { weekStartsOn: 1 });
    setStartDate(lastMonday);
    setEndDate(today);
  };

  const setLastMonthFilter = () => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    setStartDate(firstDayOfMonth);
    setEndDate(today);
  };

  const setPreviousMonthFilter = () => {
    const today = new Date();
    const firstDayPrevMonth = startOfMonth(subDays(startOfMonth(today), 1));
    const lastDayPrevMonth = subDays(startOfMonth(today), 1);
    setStartDate(firstDayPrevMonth);
    setEndDate(lastDayPrevMonth);
  };

  const setLast30DaysFilter = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
  };
  
  const prepareExportDateRange = (range: string): { startDate: Date | null, endDate: Date | null } => {
    const today = new Date();
    
    switch (range) {
      case "lastWeek": {
        const lastMonday = startOfWeek(today, { weekStartsOn: 1 });
        return { startDate: lastMonday, endDate: today };
      }
      
      case "lastMonth": {
        const firstDayOfMonth = startOfMonth(today);
        return { startDate: firstDayOfMonth, endDate: today };
      }
      
      case "previousMonth": {
        const firstDayPrevMonth = startOfMonth(subMonths(today, 1));
        const lastDayPrevMonth = endOfMonth(subMonths(today, 1));
        return { startDate: firstDayPrevMonth, endDate: lastDayPrevMonth };
      }
      
      case "last30Days": {
        const thirtyDaysAgo = subDays(today, 30);
        return { startDate: thirtyDaysAgo, endDate: today };
      }
      
      case "allTime":
        return { startDate: null, endDate: null };
      
      case "current":
        return { startDate: startDate, endDate: endDate };
      
      case "custom":
      default:
        return { startDate: exportStartDate, endDate: exportEndDate };
    }
  };
  
  useEffect(() => {
    if (mode === 'all') {
      const newSearchParams = new URLSearchParams();
      
      if (searchTerm) newSearchParams.set("search", searchTerm);
      if (selectedChannel) newSearchParams.set("channel", selectedChannel);
      if (selectedType) newSearchParams.set("type", selectedType);
      if (selectedCSAT) newSearchParams.set("csat", selectedCSAT);
      if (selectedConversion) newSearchParams.set("converted", selectedConversion);
      if (startDate) newSearchParams.set("startDate", startDate.toISOString().split('T')[0]);
      if (endDate) newSearchParams.set("endDate", endDate.toISOString().split('T')[0]);
      
      setSearchParams(newSearchParams);
    }
  }, [searchTerm, selectedChannel, selectedType, selectedCSAT, selectedConversion, startDate, endDate, mode]);
  
  const getOffersToDisplay = () => {
    if (mode === 'recent') {
      const recentOffers = [...offers]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30);
      
      return applyFiltersToOffers(recentOffers);
    }
    
    let filteredResults = offers;
    
    if (mode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filteredResults = offers.filter(offer => offer.date.startsWith(today));
    }
    
    return applyFiltersToOffers(filteredResults);
  };
  
  const applyFiltersToOffers = (offersToFilter: Offer[]) => {
    return offersToFilter.filter((offer) => {
      if (
        searchTerm &&
        !offer.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !offer.offerType.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !offer.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      if (selectedChannel && offer.channel !== selectedChannel) {
        return false;
      }
      
      if (selectedType && offer.offerType !== selectedType) {
        return false;
      }
      
      if (selectedCSAT) {
        if (selectedCSAT === "rated" && !offer.csat) {
          return false;
        } else if (selectedCSAT !== "rated" && offer.csat !== selectedCSAT) {
          return false;
        }
      }
      
      if (selectedConversion) {
        if (selectedConversion === "converted" && !offer.converted) {
          return false;
        } else if (selectedConversion === "not-converted" && offer.converted !== false) {
          return false;
        }
      }
      
      if (startDate) {
        const offerDate = new Date(offer.date);
        offerDate.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        if (offerDate < start) {
          return false;
        }
      }
      
      if (endDate) {
        const offerDate = new Date(offer.date);
        offerDate.setHours(23, 59, 59, 999);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        if (offerDate > end) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  const filteredOffers = useMemo(() => {
    const dateRangeFilter = startDate && endDate 
      ? { start: startDate, end: endDate } 
      : undefined;

    // Map string filters to proper types
    let convertedFilter: boolean | 'converted' | 'not-converted' | undefined = undefined;
    if (selectedConversion === 'converted') convertedFilter = 'converted';
    if (selectedConversion === 'not-converted') convertedFilter = 'not-converted';

    // Use the appropriate filter function based on mode
    if (mode === 'recent') {
      const recentOffers = getRecentOffers(offers, 30);
      return filterOffers(recentOffers, {
        dateRange: dateRangeFilter,
        channel: selectedChannel || undefined,
        offerType: selectedType || undefined, 
        csat: selectedCSAT as any,
        converted: convertedFilter,
        searchTerm: searchTerm || undefined,
        statusFilter: statusFilter || undefined
      });
    }
    
    if (mode === 'today') {
      const todaysOffers = getTodaysOffers(offers);
      return filterOffers(todaysOffers, {
        channel: selectedChannel || undefined,
        offerType: selectedType || undefined,
        csat: selectedCSAT as any,
        converted: convertedFilter,
        searchTerm: searchTerm || undefined,
        statusFilter: statusFilter || undefined
      });
    }
    
    // All offers with filters
    return filterOffers(offers, {
      dateRange: dateRangeFilter,
      channel: selectedChannel || undefined,
      offerType: selectedType || undefined,
      csat: selectedCSAT as any,
      converted: convertedFilter,
      searchTerm: searchTerm || undefined,
      statusFilter: statusFilter || undefined
    });
  }, [offers, mode, searchTerm, selectedChannel, selectedType, selectedCSAT, selectedConversion, startDate, endDate, statusFilter, refreshKey]);
  
  const activeFilterCount = [
    searchTerm,
    selectedChannel,
    selectedType,
    selectedCSAT,
    selectedConversion,
    startDate,
    endDate
  ].filter(Boolean).length;
  
  const resetFilters = () => {
    setSelectedChannel(null);
    setSelectedType(null);
    setSelectedCSAT(null);
    setSelectedConversion(null);
    setStartDate(null);
    setEndDate(null);
    setSearchTerm("");
    if (mode === 'all') {
      navigate("/offers");
    }
  };
  
  const refreshList = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    if (activeFilterCount > 0) {
      setShowFilters(true);
    }
  }, []);

  const handleExportClick = () => {
    setExportStartDate(startDate);
    setExportEndDate(endDate);
    setExportDialogOpen(true);
  };

  const handleExport = async () => {
    const { startDate: exportFromDate, endDate: exportToDate } = prepareExportDateRange(exportDateRange);
    
    let offersToExport = offers;
    
    if (exportFromDate || exportToDate) {
      offersToExport = offers.filter(offer => {
        const offerDate = new Date(offer.date);
        
        if (exportFromDate) {
          const startDateCopy = new Date(exportFromDate);
          startDateCopy.setHours(0, 0, 0, 0);
          if (offerDate < startDateCopy) return false;
        }
        
        if (exportToDate) {
          const endDateCopy = new Date(exportToDate);
          endDateCopy.setHours(23, 59, 59, 999);
          if (offerDate > endDateCopy) return false;
        }
        
        return true;
      });
    }
    
    if (offersToExport.length === 0) {
      toast({
        title: "No data to export",
        description: "Please adjust your filters to include some offers.",
        variant: "destructive",
      });
      return;
    }

    const dateRangeText = exportFromDate && exportToDate
      ? `${format(exportFromDate, "MMM_d")}_to_${format(exportToDate, "MMM_d_yyyy")}`
      : "all_time";
    
    try {
      const fileName = exportToCsv(offersToExport, dateRangeText);
      toast({
        title: "Export successful",
        description: `Your data has been exported as ${fileName}`,
      });
      setExportDialogOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4" key={refreshKey}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search case number, offer type, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportClick}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>
      
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Offers to CSV</DialogTitle>
            <DialogDescription>
              Choose a date range for the data you want to export
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Date Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={exportDateRange === "current" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExportDateRange("current")}
                  className="w-full justify-start text-left"
                >
                  Current Filter
                </Button>
                <Button 
                  variant={exportDateRange === "lastWeek" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExportDateRange("lastWeek")}
                  className="w-full justify-start text-left"
                >
                  This Week
                </Button>
                <Button 
                  variant={exportDateRange === "lastMonth" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExportDateRange("lastMonth")}
                  className="w-full justify-start text-left"
                >
                  This Month
                </Button>
                <Button 
                  variant={exportDateRange === "previousMonth" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExportDateRange("previousMonth")}
                  className="w-full justify-start text-left"
                >
                  Last Month
                </Button>
                <Button 
                  variant={exportDateRange === "last30Days" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExportDateRange("last30Days")}
                  className="w-full justify-start text-left"
                >
                  Last 30 Days
                </Button>
                <Button 
                  variant={exportDateRange === "allTime" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExportDateRange("allTime")}
                  className="w-full justify-start text-left"
                >
                  All Time
                </Button>
                <Button 
                  variant={exportDateRange === "custom" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setExportDateRange("custom")}
                  className="w-full justify-start text-left"
                >
                  Custom Range
                </Button>
              </div>
            </div>
            
            {exportDateRange === "custom" && (
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportStartDate ? format(exportStartDate, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={exportStartDate || undefined}
                        onSelect={setExportStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {exportEndDate ? format(exportEndDate, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={exportEndDate || undefined}
                        onSelect={setExportEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Card className="bg-secondary/50 shadow-none border border-border/40 backdrop-blur-sm">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="grid grid-cols-1 gap-3">
                  {filterOptions.showDateFilter && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Date Range</div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={setLastWeekFilter}
                          className="text-xs"
                        >
                          This Week
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={setLastMonthFilter}
                          className="text-xs"
                        >
                          This Month
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={setPreviousMonthFilter}
                          className="text-xs"
                        >
                          Last Month
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={setLast30DaysFilter}
                          className="text-xs"
                        >
                          Last 30 Days
                        </Button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : "Start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate || undefined}
                              onSelect={setStartDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : "End date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate || undefined}
                              onSelect={setEndDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filterOptions.showChannelFilter && (
                      <div>
                        <Select value={selectedChannel || "all"} onValueChange={(v) => setSelectedChannel(v === "all" ? null : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Channel" />
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
                    )}
                    
                    {filterOptions.showTypeFilter && (
                      <div>
                        <Select value={selectedType || "all"} onValueChange={(v) => setSelectedType(v === "all" ? null : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Offer Type" />
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
                    )}
                    
                    {filterOptions.showCSATFilter && (
                      <div>
                        <Select value={selectedCSAT || "all"} onValueChange={(v) => setSelectedCSAT(v === "all" ? null : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="CSAT Rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Ratings</SelectItem>
                            <SelectItem value="rated">Any Rating</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {filterOptions.showConversionFilter && (
                      <div>
                        <Select value={selectedConversion || "all"} onValueChange={(v) => setSelectedConversion(v === "all" ? null : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Conversion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="not-converted">Not Converted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  
                  {activeFilterCount > 0 && (
                    <div className="flex justify-end mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFilters}
                        className="text-xs flex items-center"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="text-sm text-muted-foreground">
          {filteredOffers.length} {filteredOffers.length === 1 ? "offer" : "offers"}
        </div>
      </div>
      
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => (
            <OfferItem key={offer.id} offer={offer} onUpdate={refreshList} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/30">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <ListFilter className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No offers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || activeFilterCount > 0
              ? "Try adjusting your search or filters"
              : "Start by adding an offer to your tracker"}
          </p>
          {(searchTerm || activeFilterCount > 0) && (
            <Button variant="outline" onClick={resetFilters} className="mt-2">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
