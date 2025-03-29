
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OfferList } from "@/components/OfferList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useOffers } from "@/context/OfferContext";
import { OfferDialog } from "@/components/OfferDialog";
import { PlusCircle, Star, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "react-router-dom";

const Offers = () => {
  const { todaysOffers } = useOffers();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Start with the "all" tab if search params exist
    return searchParams.toString() ? "all" : "recent";
  });
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Set the "all" tab active when filters are applied through URL params
  useEffect(() => {
    if (searchParams.toString() && activeTab !== 'all') {
      setActiveTab('all');
    }
  }, [searchParams]);
  
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <motion.main 
        className="flex-1 container max-w-5xl mx-auto p-4 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <motion.h1 
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            Offers
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button 
              onClick={() => {
                setSelectedOfferId(null);
                setOfferDialogOpen(true);
              }}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Offer
            </Button>
          </motion.div>
        </div>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-0 shadow-sm bg-gradient-to-br from-background/80 to-background backdrop-blur-sm border border-border/30">
              <CardContent className="p-4 pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="recent" className="relative">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Recent 30</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="all">All Offers</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recent" className="pt-2">
                    <OfferList 
                      title="Recent 30 Offers" 
                      mode="recent"
                      filterOptions={{
                        showDateFilter: false,
                        showChannelFilter: true,
                        showTypeFilter: true,
                        showCSATFilter: true,
                        showConversionFilter: true
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="all" className="pt-2">
                    <OfferList title="" mode="all" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        <OfferDialog 
          open={offerDialogOpen} 
          onOpenChange={handleCloseDialog} 
          offerId={selectedOfferId}
        />
      </motion.main>
    </div>
  );
};

export default Offers;
