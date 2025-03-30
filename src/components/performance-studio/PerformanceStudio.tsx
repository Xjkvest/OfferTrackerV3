import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { generatePDFReport } from '@/utils/pdfExport';
import { useMonthlyOverviewData } from './overview/useMonthlyOverviewData';
import { toast } from "@/hooks/use-toast";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Channel, OfferType } from '@/utils/pdfExport';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Define electronAPI for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      savePDF: (pdfBase64: string, defaultFileName: string) => Promise<{success: boolean, filePath?: string, error?: string}>;
    };
  }
}

export const PerformanceStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'trends'>('monthly');
  const [showFilters, setShowFilters] = useState(false);
  const [agentComment, setAgentComment] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { filters } = useFilters();
  const { offers } = useOffers();
  const { userName, dailyGoal } = useUser();
  
  console.log('PerformanceStudio: Component mounted');
  console.log('PerformanceStudio: activeTab', activeTab);
  console.log('PerformanceStudio: offers length', offers.length);
  console.log('PerformanceStudio: filters', filters);
  
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
  const filteredOffers = useMemo(() => {
    console.log('PerformanceStudio: Computing filteredOffers');
    try {
      const result = getFilteredOffers(
        offers,
        filters.dateRange,
        filters.channels,
        filters.offerTypes,
        filters.csat ? filters.csat[0] : null, // Use first value if array
        filters.converted,
        filters.hasFollowup
      );
      console.log('PerformanceStudio: Filtered offers length', result.length);
      return result;
    } catch (error) {
      console.error('PerformanceStudio: Error filtering offers', error);
      return [];
    }
  }, [offers, filters]);

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

  // Add type for PDF document
  const [pdfDocument, setPdfDocument] = useState<any>(null);

  // Replace the PDF download component with a custom handler
  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);
    console.log('Starting PDF generation process...');
    
    try {
      console.log('Creating PDF report with filters:', {
        offersCount: filteredOffers.length,
        dateRange: pdfDateRange,
        channels: Object.keys(uniqueChannels),
        offerTypes: Object.keys(uniqueOfferTypes)
      });
      
      // Create the PDF document
      const pdfReport = generatePDFReport({
        offers: filteredOffers,
        channels: uniqueChannels,
        dateRange: pdfDateRange,
        userName: userName || 'User',
        offerTypes: uniqueOfferTypes,
        dailyGoal: dailyGoal || 0,
        agentComment: agentComment || ''
      });
      
      console.log('PDF report generated successfully');
      const fileName = `performance_report_${userName || 'user'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Check if we're in Electron environment
      console.log('Checking for Electron API:', !!window.electronAPI);
      
      if (window.electronAPI) {
        console.log('Electron environment detected, using IPC for saving');
        try {
          console.log('Converting PDF to blob...');
          
          // Use a try-catch specifically for the pdf() call
          let blob;
          try {
            blob = await pdf(pdfReport).toBlob();
            console.log('Blob created:', blob.size, 'bytes');
          } catch (pdfError) {
            console.error('Error creating PDF blob:', pdfError);
            throw new Error(`PDF rendering failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
          }
          
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            try {
              console.log('FileReader loaded blob');
              const base64data = reader.result as string;
              console.log('Base64 data length:', base64data.length);
              
              // Extract only the base64 part after the data URL prefix
              const base64Content = base64data.split(',')[1];
              console.log('Base64 content length:', base64Content.length);
              
              // Notify user that save dialog will appear
              toast({
                title: 'Save PDF',
                description: 'Please select a location to save the PDF report',
                variant: 'default'
              });
              
              console.log('Calling electronAPI.savePDF...');
              const result = await window.electronAPI.savePDF(base64Content, fileName);
              console.log('Save PDF result:', result);
              
              if (result.success) {
                toast({
                  title: 'PDF saved successfully',
                  description: `Your report has been saved to: ${result.filePath}`,
                  variant: 'default'
                });
              } else {
                if (result.error !== 'User cancelled the save dialog') {
                  toast({
                    title: 'Failed to save PDF',
                    description: result.error,
                    variant: 'destructive'
                  });
                  console.error('PDF save error:', result.error);
                } else {
                  console.log('User cancelled the save dialog');
                }
              }
            } catch (readerError) {
              console.error('Error in FileReader onloadend:', readerError);
              toast({
                title: 'PDF Generation Failed',
                description: 'Error processing the PDF data',
                variant: 'destructive'
              });
            } finally {
              setIsGeneratingPdf(false);
            }
          };
          
          reader.onerror = (readerError) => {
            console.error('FileReader error:', readerError);
            toast({
              title: 'PDF Generation Failed',
              description: 'Error reading the PDF data',
              variant: 'destructive'
            });
            setIsGeneratingPdf(false);
          };
          
          console.log('Starting FileReader...');
          reader.readAsDataURL(blob);
        } catch (blobError) {
          console.error('Error creating or processing blob:', blobError);
          toast({
            title: 'PDF Generation Failed',
            description: blobError instanceof Error ? blobError.message : 'Failed to create PDF',
            variant: 'destructive'
          });
          setIsGeneratingPdf(false);
        }
      } else {
        // Fallback for browser environment - direct download
        console.log('Browser environment detected, using direct download');
        try {
          console.log('Converting PDF to blob...');
          
          // Use a try-catch specifically for the pdf() call
          let blob;
          try {
            blob = await pdf(pdfReport).toBlob();
            console.log('Blob created:', blob.size, 'bytes');
          } catch (pdfError) {
            console.error('Error creating PDF blob:', pdfError);
            throw new Error(`PDF rendering failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
          }
          
          // Use file-saver instead of URL.createObjectURL for better compatibility
          saveAs(blob, fileName);
          
          toast({
            title: "PDF Generated!",
            description: "Your report has been downloaded.",
            variant: 'default'
          });
        } catch (downloadError) {
          console.error('Error in browser download:', downloadError);
          toast({
            title: 'PDF Generation Failed',
            description: downloadError instanceof Error ? downloadError.message : 'Error downloading the PDF',
            variant: 'destructive'
          });
        } finally {
          setIsGeneratingPdf(false);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      toast({
        title: 'PDF Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      setIsGeneratingPdf(false);
    }
  };

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
            <Button 
              variant="outline" 
              className="min-w-[200px]" 
              disabled={isGeneratingPdf}
              onClick={handleGeneratePDF}
            >
              {isGeneratingPdf ? 'Generating PDF...' : 'Export PDF Report'}
            </Button>
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