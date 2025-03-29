
import React from "react";
import { FollowupList } from "../FollowupList";

interface DashboardFollowupListProps {
  onOfferClick: (offerId: string) => void;
  onClose?: () => void;
}

export function DashboardFollowupList({ onOfferClick }: DashboardFollowupListProps) {
  return (
    <div className="relative">
      <FollowupList onOfferClick={onOfferClick} />
    </div>
  );
}
