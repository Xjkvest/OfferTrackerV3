
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useOffers } from "@/context/OfferContext";
import { toast } from "@/hooks/use-toast";
import { DraggableDashboardItem } from "./DraggableDashboardItem";
import { DashboardProgressGroup } from "./DashboardProgressGroup";
import { DashboardFollowupList } from "./DashboardFollowupList";
import { DashboardRecentOffers } from "./DashboardRecentOffers";
import { DashboardAnalyticsTeaser } from "./DashboardAnalyticsTeaser";

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
  const { dashboardElements, setDashboardElements, dashboardElementsOrder, setDashboardElementsOrder } = useUser();
  const { offers } = useOffers();
  const [dashboardItems, setDashboardItems] = useState<string[]>([]);

  useEffect(() => {
    const showProgressGroup = dashboardElements.includes('progress') || 
                           dashboardElements.includes('metrics') || 
                           dashboardElements.includes('newOfferForm');
                           
    let orderedElements: string[] = [];
    
    // Always put followups first if it exists in dashboardElements
    if (dashboardElements.includes('followups')) {
      orderedElements.push('followups');
    }
    
    if (dashboardElementsOrder && dashboardElementsOrder.length > 0) {
      // Filter the remaining elements from dashboardElementsOrder
      const remainingOrderedElements = dashboardElementsOrder.filter(id => {
        if (id === 'followups') return false; // Skip followups as we already added it
        if (id === 'progressGroup' && showProgressGroup) return true;
        if (['progress', 'metrics', 'newOfferForm'].includes(id)) return false;
        return dashboardElements.includes(id);
      });
      
      orderedElements = [...orderedElements, ...remainingOrderedElements];
      
      if (showProgressGroup && !orderedElements.includes('progressGroup')) {
        // If progressGroup isn't in the ordered list yet, add it after followups
        orderedElements.splice(1, 0, 'progressGroup');
      }
    } else {
      if (showProgressGroup) {
        orderedElements.push('progressGroup');
      }
      
      // Add recent offers and analytics cards if they're enabled
      if (dashboardElements.includes('recentOffers')) {
        orderedElements.push('recentOffers');
      }
      
      if (dashboardElements.includes('analytics')) {
        orderedElements.push('analytics');
      }
    }
    
    setDashboardItems(orderedElements);
  }, [dashboardElements, dashboardElementsOrder]);

  const handleElementRemove = (elementId: string) => {
    const updatedElements = [...dashboardElements];
    
    if (elementId === 'progressGroup') {
      const newElements = updatedElements.filter(id => 
        !['progress', 'metrics', 'newOfferForm'].includes(id)
      );
      setDashboardElements(newElements);
    } else {
      const newElements = updatedElements.filter(id => id !== elementId);
      setDashboardElements(newElements);
    }
    
    setDashboardItems(prev => prev.filter(id => id !== elementId));
    
    toast({
      title: "Element Hidden",
      description: "You can re-enable it in Dashboard Preferences.",
    });
  };

  const renderDashboardItem = (elementId: string) => {
    let content = null;
    
    if (elementId === 'progressGroup') {
      content = (
        <DashboardProgressGroup 
          onNewOfferClick={onNewOfferClick}
          onNewOfferSuccess={onNewOfferSuccess}
          onClose={() => handleElementRemove('progressGroup')}
        />
      );
    } else if (elementId === 'followups') {
      content = (
        <DashboardFollowupList 
          onOfferClick={onOfferClick}
          onClose={() => handleElementRemove('followups')}
        />
      );
    } else if (elementId === 'recentOffers') {
      content = (
        <DashboardRecentOffers 
          offers={offers.slice(0, 10)} 
          onOfferClick={onOfferClick}
          onClose={() => handleElementRemove('recentOffers')}
        />
      );
    } else if (elementId === 'analytics') {
      content = (
        <DashboardAnalyticsTeaser 
          onClose={() => handleElementRemove('analytics')}
        />
      );
    }
    
    if (!content) return null;
    
    return (
      <DraggableDashboardItem
        key={elementId}
        elementId={elementId}
      >
        {content}
      </DraggableDashboardItem>
    );
  };

  return (
    <div className="space-y-6">
      {dashboardItems.map((elementId) => renderDashboardItem(elementId))}
    </div>
  );
}
