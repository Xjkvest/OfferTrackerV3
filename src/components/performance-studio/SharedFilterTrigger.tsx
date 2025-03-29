import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface SharedFilterTriggerProps {
  className?: string;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const SharedFilterTrigger: React.FC<SharedFilterTriggerProps> = ({ 
  className = "", 
  showFilters,
  onToggleFilters 
}) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`h-10 w-10 rounded-full border-2 hover:bg-accent hover:border-primary transition-colors ${className}`}
      onClick={onToggleFilters}
    >
      <Filter className="h-5 w-5" />
    </Button>
  );
}; 