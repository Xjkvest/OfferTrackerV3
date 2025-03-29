
import React from "react";
import { Card } from "@/components/ui/card";
import { FileBarChart, Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const EmptyState: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="glass-card border border-border/30 bg-gradient-to-br from-card/90 to-card/70 p-8 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-muted/50 p-4 rounded-full">
          <FileBarChart className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-xl font-medium">No data found for this selection</div>
        <div className="text-muted-foreground mt-2 max-w-md mx-auto">
          Try adjusting your filters to see results, or log some offers to start analyzing your performance.
        </div>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4 mr-2" />
          <span>Use the filters above to refine your data view</span>
        </div>
      </div>
    </Card>
  );
};
