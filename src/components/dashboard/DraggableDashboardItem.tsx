
import React from "react";

interface DraggableDashboardItemProps {
  elementId: string;
  children: React.ReactNode;
}

export function DraggableDashboardItem({ 
  elementId, 
  children 
}: DraggableDashboardItemProps) {
  return (
    <div className="mb-6 relative h-full">
      <div className="h-full">
        {children}
      </div>
    </div>
  );
}
