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
    switch (elementId) {
      case 'progress':
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <DashboardProgressGroup
              onNewOfferClick={onNewOfferClick}
              onNewOfferSuccess={handleNewOfferSuccess}
              onClose={() => {}}
              streak={streak}
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
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <DashboardAnalyticsTeaser />
          </DraggableDashboardItem>
        );
        
      case 'calendar':
        return (
          <DraggableDashboardItem key={elementId} elementId={elementId}>
            <div className="mb-4">
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
