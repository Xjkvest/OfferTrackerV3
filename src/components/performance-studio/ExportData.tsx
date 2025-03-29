
import React, { useMemo, useState } from "react";
import { useOffers } from "@/context/OfferContext";
import { useFilters } from "@/context/FilterContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterBar } from "./FilterBar";
import { getFilteredOffers } from "@/utils/performanceUtils";
import { exportToCsv } from "@/utils/exportData";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Download, Filter } from "lucide-react";
import { format } from "date-fns";

export const ExportData: React.FC = () => {
  const { offers } = useOffers();
  const { filters } = useFilters();
  const [exporting, setExporting] = useState(false);
  
  // Apply filters
  const filteredOffers = useMemo(() => {
    return getFilteredOffers(
      offers,
      filters.dateRange.start && filters.dateRange.end 
        ? { start: filters.dateRange.start, end: filters.dateRange.end } 
        : null,
      filters.channels.length > 0 ? filters.channels : null,
      filters.offerTypes.length > 0 ? filters.offerTypes : null,
      filters.csat,
      filters.converted,
      filters.hasFollowup
    );
  }, [offers, filters]);
  
  const exportCsv = () => {
    if (filteredOffers.length === 0) {
      toast({
        title: "No data to export",
        description: "No offers found with the selected filters.",
        variant: "destructive",
      });
      return;
    }
    
    setExporting(true);
    
    try {
      let dateRangeText = "";
      if (filters.dateRange.start && filters.dateRange.end) {
        dateRangeText = `${format(filters.dateRange.start, "MMM_d")}_to_${format(filters.dateRange.end, "MMM_d_yyyy")}`;
      }
      
      const fileName = exportToCsv(filteredOffers, dateRangeText);
      
      toast({
        title: "Export Successful",
        description: `Your data has been exported as CSV${fileName ? `: ${fileName}` : ''}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };
  
  // Format date range for display
  const formatDateRange = () => {
    if (!filters.dateRange.start || !filters.dateRange.end) {
      return "all time";
    }
    
    return `${format(filters.dateRange.start, "MMM d, yyyy")} to ${format(filters.dateRange.end, "MMM d, yyyy")}`;
  };
  
  // Get filter description text
  const getFilterDescription = () => {
    const parts = [];
    
    if (filters.channels.length > 0) {
      parts.push(`channel: ${filters.channels.join(', ')}`);
    }
    
    if (filters.offerTypes.length > 0) {
      parts.push(`offer type: ${filters.offerTypes.join(', ')}`);
    }
    
    if (filters.csat) {
      parts.push(`CSAT: ${filters.csat.join(', ')}`);
    }
    
    if (filters.converted !== null) {
      parts.push(`converted: ${filters.converted ? 'yes' : 'no'}`);
    }
    
    if (filters.hasFollowup !== null) {
      parts.push(`follow-up: ${filters.hasFollowup ? 'with' : 'without'}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'no additional filters';
  };
  
  return (
    <div className="space-y-6">
      <FilterBar
        showDateRange={true}
        showChannels={true}
        showOfferTypes={true}
        showCsat={true}
        showConverted={true}
        showFollowup={true}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Export Preview</h3>
                <div className="bg-primary/5 rounded-md p-4 border border-border">
                  <p className="mb-1">You are exporting <span className="font-bold">{filteredOffers.length}</span> offers for <span className="font-medium">{formatDateRange()}</span></p>
                  <p className="text-sm text-muted-foreground">Filters applied: {getFilterDescription()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Export Format</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-border rounded-md p-4 bg-card/50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-3">
                          <span className="text-blue-500 font-bold">CSV</span>
                        </div>
                        <div>
                          <h4 className="font-medium">CSV Format</h4>
                          <p className="text-xs text-muted-foreground">Excel, Google Sheets compatible</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={exportCsv}
                      disabled={exporting || filteredOffers.length === 0}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                  
                  <div className="border border-border rounded-md p-4 bg-card/50 opacity-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-bold">...</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Other Formats</h4>
                          <p className="text-xs text-muted-foreground">Coming soon</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      disabled={true}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Not Available
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Adjust the filters above to customize your export data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {filteredOffers.length === 0 && (
        <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 p-8 text-center">
          <div className="text-xl font-medium text-destructive">No data to export</div>
          <div className="text-muted-foreground mt-2">Try adjusting your filters to include some data</div>
        </Card>
      )}
    </div>
  );
};
