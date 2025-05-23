import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useOffers } from "@/context/OfferContext";
import { toast } from "@/hooks/use-toast";
import { DraggableDashboardItem } from "./DraggableDashboardItem";
import { DashboardProgressGroup } from "./DashboardProgressGroup";
import { DashboardFollowupList } from "./DashboardFollowupList";
import { DashboardRecentOffers } from "./DashboardRecentOffers";
import { DashboardAnalyticsTeaser } from "./DashboardAnalyticsTeaser";
import { DashboardCalendar } from "./DashboardCalendar";

interface DashboardItemsManagerProps {
  onOfferClick: (offerId: string) => void;
  onNewOfferClick: () => void;
  onNewOfferSuccess: () => void;
  streak?: number;
}

export function DashboardItemsManager({
  onOfferClick,
  onNewOfferClick,
  onNewOfferSuccess,
  streak = 0
}: DashboardItemsManagerProps) {
  const { dashboardElements, dashboardElementsOrder } = useUser();
  const { offers } = useOffers();
  const [dashboardItems, setDashboardItems] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Delay showing charts to avoid rendering issues when data is loading
  useEffect(() => {
    const hasOffers = offers.length > 0;
    
    // If there are no offers, don't show charts/analytics at all
    if (!hasOffers) {
      setShowCharts(false);
      setShowAnalytics(false);
      return;
    }
    
    // Delay showing analytics components to avoid race conditions
    const chartsTimer = setTimeout(() => {
      setShowCharts(true);
    }, 1000);
    
    const analyticsTimer = setTimeout(() => {
      setShowAnalytics(true);
    }, 2000);
    
    return () => {
      clearTimeout(chartsTimer);
      clearTimeout(analyticsTimer);
    };
  }, [offers]);

  // Initialize dashboard items based on order preference and availability
  useEffect(() => {
    // Filter out any elements that aren't enabled
    const filteredOrderedItems = dashboardElementsOrder.filter(item => 
      dashboardElements.includes(item)
    );
    
    // Add any elements that are enabled but not in the order
    const missingItems = dashboardElements.filter(item => 
      !dashboardElementsOrder.includes(item)
    );
    
    setDashboardItems([...filteredOrderedItems, ...missingItems]);
  }, [dashboardElements, dashboardElementsOrder]);

  // Handles when an offer is successfully created
  const handleNewOfferSuccess = () => {
    toast({
      title: "Success",
      description: "Your offer has been logged successfully.",
    });
    
    // Call the parent handler
    onNewOfferSuccess();
  };

  // Render a specific dashboard element
  const renderDashboardItem = (elementId: string) => {
    // Skip rendering chart-heavy components if no offers
    const hasNoOffers = offers.length === 0;
    
    switch (elementId) {
      case 'progress':
        // Show progress without the charts components
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <DashboardProgressGroup
              onNewOfferClick={onNewOfferClick}
              onNewOfferSuccess={handleNewOfferSuccess}
              onClose={() => {}}
              streak={streak}
              showCharts={showCharts && !hasNoOffers}
            />
          </DraggableDashboardItem>
        );
      
      case 'followups':
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <DashboardFollowupList onOfferClick={onOfferClick} />
          </DraggableDashboardItem>
        );
      
      case 'recentOffers':
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <DashboardRecentOffers 
              onOfferClick={onOfferClick} 
              offers={offers}
            />
          </DraggableDashboardItem>
        );
      
      case 'analytics':
        // Don't render analytics at all if no offers or not ready
        if (hasNoOffers || !showAnalytics) {
          return (
            <DraggableDashboardItem key={elementId} elementId={elementId}>
              <div className="p-6 bg-card/20 rounded-lg border border-border/40 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Analytics</h2>
                <p className="text-muted-foreground">
                  {hasNoOffers 
                    ? "Add some offers to see analytics" 
                    : "Analytics are loading..."}
                </p>
              </div>
            </DraggableDashboardItem>
          );
        }
        
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <DashboardAnalyticsTeaser />
          </DraggableDashboardItem>
        );
        
      case 'calendar':
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <div>
              <h2 className="text-lg font-semibold mb-2">Calendar View</h2>
              <DashboardCalendar />
            </div>
          </DraggableDashboardItem>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {dashboardItems.map((elementId) => renderDashboardItem(elementId))}
    </div>
  );
}
