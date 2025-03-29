
import React from "react";
import { RecentOffersList } from "../RecentOffersList";

interface DashboardRecentOffersProps {
  offers: any[];
  onOfferClick: (offerId: string) => void;
  onClose?: () => void;
}

export function DashboardRecentOffers({ offers, onOfferClick, onClose }: DashboardRecentOffersProps) {
  return (
    <div className="relative">
      <RecentOffersList 
        offers={offers} 
        onOfferClick={onOfferClick} 
        hideFilters={true}
      />
    </div>
  );
}
