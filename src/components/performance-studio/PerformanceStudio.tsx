import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyOverview } from './MonthlyOverview';
import { TrendsBreakdown } from './TrendsBreakdown';
import { SharedFilterTrigger } from './SharedFilterTrigger';
import { FilterBar } from './FilterBar';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/context/FilterContext";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { getFilteredOffers } from "@/utils/performanceUtils";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { generatePDFReport } from '@/utils/pdfExport';
import { useMonthlyOverviewData } from './overview/useMonthlyOverviewData';
import { toast } from "@/hooks/use-toast";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Channel, OfferType } from '@/utils/pdfExport';

export const PerformanceStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'trends'>('monthly');
  const [showFilters, setShowFilters] = useState(false);
  const { filters } = useFilters();
  const { offers } = useOffers();
  const { userName, dailyGoal } = useUser();
  const { 
    lineChartData,
    channelData,
    offerTypeData,
    csatData,
    conversionData,
    chartTheme,
    isEmpty,
    theme
  } = useMonthlyOverviewData();

  // Get filtered offers based on current filters
  const filteredOffers = getFilteredOffers(
    offers,
    filters.dateRange,
    filters.channels,
    filters.offerTypes,
    filters.csat,
    filters.converted,
    filters.hasFollowup
  );

  // Get unique channels and offer types for the PDF report
  const uniqueChannels = useMemo(() => {
    const channels: Record<string, Channel> = {};
    offers.forEach(o => {
      if (!channels[o.channel]) {
        channels[o.channel] = { name: o.channel, csat: 0 };
      }
    });
    return channels;
  }, [offers]);

  const uniqueOfferTypes = useMemo(() => {
    const types: Record<string, OfferType> = {};
    offers.forEach(o => {
      if (!types[o.offerType]) {
        types[o.offerType] = { name: o.offerType, csat: 0 };
      }
    });
    return types;
  }, [offers]);

  // Prepare date range for PDF report
  const pdfDateRange = useMemo(() => ({
    start: filters.dateRange.start ? new Date(filters.dateRange.start) : startOfMonth(new Date()),
    end: filters.dateRange.end ? new Date(filters.dateRange.end) : endOfMonth(new Date())
  }), [filters.dateRange]);

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Tabs value={activeTab} className="flex-1" onValueChange={(value) => setActiveTab(value as 'monthly' | 'trends')}>
            <TabsList className="w-full">
              <TabsTrigger value="monthly" className="flex-1">Monthly Overview</TabsTrigger>
              <TabsTrigger value="trends" className="flex-1">Trends & Breakdown</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <PDFDownloadLink
              document={generatePDFReport({
                offers: filteredOffers.map(offer => ({
                  ...offer,
                  converted: offer.converted || false
                })),
                dateRange: pdfDateRange,
                channels: uniqueChannels,
                offerTypes: uniqueOfferTypes,
                dailyGoal,
                userName: userName || 'User'
              })}
              fileName={`OT Report - ${userName || 'User'} - ${format(pdfDateRange.start, "MMM d")} to ${format(pdfDateRange.end, "MMM d, yyyy")}.pdf`}
            >
              {({ loading }) => (
                <Button 
                  variant="outline" 
                  className="min-w-[200px]" 
                  disabled={loading}
                >
                  {loading ? 'Generating PDF...' : 'Export PDF Report'}
                </Button>
              )}
            </PDFDownloadLink>
            <SharedFilterTrigger 
              className="ml-2" 
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-card/50 backdrop-blur-sm border rounded-lg">
                <FilterBar
                  showDateRange={true}
                  showChannels={true}
                  showOfferTypes={true}
                  showCsat={true}
                  showConverted={true}
                  showFollowup={true}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          {activeTab === 'monthly' ? <MonthlyOverview /> : <TrendsBreakdown />}
        </div>
      </div>
    </ErrorBoundary>
  );
};