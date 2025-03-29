import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { useUser } from '@/context/UserContext';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';

interface FilterBarProps {
  showDateRange?: boolean;
  showChannels?: boolean;
  showOfferTypes?: boolean;
  showCsat?: boolean;
  showConverted?: boolean;
  showFollowup?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  showDateRange = true,
  showChannels = true,
  showOfferTypes = true,
  showCsat = false,
  showConverted = false,
  showFollowup = false
}) => {
  const { 
    filters, 
    setDateRange, 
    setChannels, 
    setOfferTypes, 
    setCsat, 
    setConverted, 
    setHasFollowup, 
    resetFilters 
  } = useFilters();

  const { channels, offerTypes } = useUser();
  const isMobile = useIsMobile();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = 
    filters.channels.length > 0 || 
    filters.offerTypes.length > 0 || 
    filters.csat !== null || 
    filters.converted !== null || 
    filters.hasFollowup !== null || 
    filters.dateRange.range !== 'thisMonth';

  // Format date range for display
  const getDateRangeDisplay = () => {
    if (filters.dateRange.range === 'custom') {
      if (filters.dateRange.start && filters.dateRange.end) {
        return `${format(filters.dateRange.start, 'MMM d')} - ${format(filters.dateRange.end, 'MMM d')}`;
      }
      return 'Custom Range';
    }
    
    switch (filters.dateRange.range) {
      case 'thisWeek':
        return 'This Week';
      case 'lastWeek':
        return 'Last Week';
      case 'thisMonth':
        return 'This Month';
      case 'lastMonth':
        return 'Last Month';
      case 'lastQuarter':
        return 'Last Quarter';
      case 'yearToDate':
        return 'Year to Date';
      case 'lastYear':
        return 'Last Year';
      default:
        return 'Select Date Range';
    }
  };

  // Handler for channel selection
  const handleChannelChange = (value: string) => {
    if (value === "all") {
      setChannels([]);
    } else {
      setChannels([value]);
    }
  };

  // Handler for offer type selection
  const handleOfferTypeChange = (value: string) => {
    if (value === "all") {
      setOfferTypes([]);
    } else {
      setOfferTypes([value]);
    }
  };

  // Handler for date range selection
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange('custom', range.from, range.to);
    }
  };

  // Handler for timeframe selection
  const handleTimeframeChange = (value: string) => {
    if (value === 'custom') {
      setDateRange('custom');
      setShowDatePicker(true);
    } else {
      setDateRange(value as any);
      setShowDatePicker(false);
    }
  };

  // Convert filter date range to DateRange type
  const filterDateRange: DateRange | undefined = filters.dateRange.start && filters.dateRange.end
    ? { from: filters.dateRange.start, to: filters.dateRange.end }
    : undefined;

  // Get the current timeframe value
  const getCurrentTimeframeValue = () => {
    if (filters.dateRange.range === 'custom' && filters.dateRange.start && filters.dateRange.end) {
      return 'custom';
    }
    return filters.dateRange.range;
  };

  return (
    <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 mb-6">
      <CardContent className="py-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-8 px-2 text-xs"
                onClick={resetFilters}
              >
                <X className="h-3 w-3 mr-1" />
                Reset All
              </Button>
            )}
          </div>
          
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3`}>
            {showDateRange && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Timeframe</label>
                <div className="flex flex-col gap-2">
                  <Select
                    value={filters.dateRange.range}
                    onValueChange={handleTimeframeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select timeframe">
                        {getDateRangeDisplay()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                      <SelectItem value="lastWeek">Last Week</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="lastMonth">Last Month</SelectItem>
                      <SelectItem value="lastQuarter">Last Quarter</SelectItem>
                      <SelectItem value="yearToDate">Year to Date</SelectItem>
                      <SelectItem value="lastYear">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  {showDatePicker && (
                    <div className="mt-2">
                      <DateRangePicker
                        dateRange={filterDateRange}
                        onDateRangeChange={handleDateRangeChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {showChannels && channels.length > 0 && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Channel</label>
                <Select
                  value={filters.channels.length > 0 ? filters.channels[0] : "all"}
                  onValueChange={handleChannelChange}
                >
                  <SelectTrigger className="w-full">
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
            )}
            
            {showOfferTypes && offerTypes.length > 0 && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Offer Type</label>
                <Select
                  value={filters.offerTypes.length > 0 ? filters.offerTypes[0] : "all"}
                  onValueChange={handleOfferTypeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Offer Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offer Types</SelectItem>
                    {offerTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showCsat && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">CSAT Rating</label>
                <Select
                  value={filters.csat ? filters.csat[0] : "all"}
                  onValueChange={(value) => {
                    if (value === "all") setCsat(null);
                    else if (value === "positive") setCsat(['positive']);
                    else if (value === "neutral") setCsat(['neutral']);
                    else if (value === "negative") setCsat(['negative']);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All CSAT Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All CSAT Ratings</SelectItem>
                    <SelectItem value="positive">Positive Only</SelectItem>
                    <SelectItem value="neutral">Neutral Only</SelectItem>
                    <SelectItem value="negative">Negative Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showConverted && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Conversion Status</label>
                <Select
                  value={filters.converted === null ? "all" : filters.converted ? "converted" : "not-converted"}
                  onValueChange={(value) => {
                    if (value === "all") setConverted(null);
                    else if (value === "converted") setConverted(true);
                    else if (value === "not-converted") setConverted(false);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Conversions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conversions</SelectItem>
                    <SelectItem value="converted">Converted Only</SelectItem>
                    <SelectItem value="not-converted">Not Converted Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showFollowup && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Follow-up Status</label>
                <Select
                  value={filters.hasFollowup === null ? "all" : filters.hasFollowup ? "with-followup" : "without-followup"}
                  onValueChange={(value) => {
                    if (value === "all") setHasFollowup(null);
                    else if (value === "with-followup") setHasFollowup(true);
                    else if (value === "without-followup") setHasFollowup(false);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Follow-up Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Follow-up Status</SelectItem>
                    <SelectItem value="with-followup">With Follow-up Only</SelectItem>
                    <SelectItem value="without-followup">Without Follow-up Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.dateRange.range !== 'thisMonth' && (
                <Badge variant="secondary" className="flex items-center gap-1 h-6">
                  {getDateRangeDisplay()}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setDateRange('thisMonth')}
                  />
                </Badge>
              )}
              
              {filters.channels.length > 0 && filters.channels.map(channel => (
                <Badge key={channel} variant="secondary" className="flex items-center gap-1 h-6">
                  {channel}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setChannels([])}
                  />
                </Badge>
              ))}
              
              {filters.offerTypes.length > 0 && filters.offerTypes.map(type => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1 h-6">
                  {type}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setOfferTypes([])}
                  />
                </Badge>
              ))}
              
              {filters.csat && (
                <Badge variant="secondary" className="flex items-center gap-1 h-6">
                  {filters.csat.join(', ')} CSAT
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setCsat(null)}
                  />
                </Badge>
              )}
              
              {filters.converted !== null && (
                <Badge variant="secondary" className="flex items-center gap-1 h-6">
                  {filters.converted ? 'Converted' : 'Not Converted'}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setConverted(null)}
                  />
                </Badge>
              )}
              
              {filters.hasFollowup !== null && (
                <Badge variant="secondary" className="flex items-center gap-1 h-6">
                  {filters.hasFollowup ? 'With Follow-up' : 'Without Follow-up'}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setHasFollowup(null)}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
