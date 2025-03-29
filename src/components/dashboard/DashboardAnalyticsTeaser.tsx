
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";

interface DashboardAnalyticsTeaserProps {
  onClose?: () => void;
}

export function DashboardAnalyticsTeaser({ onClose }: DashboardAnalyticsTeaserProps) {
  return (
    <Card className="glass-card bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 shadow-md hover:shadow-lg transition-all relative">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <h3 className="text-lg font-medium mb-1">Analyze Your Performance</h3>
          <p className="text-muted-foreground">Gain insights from your offer history</p>
        </div>
        <Button 
          asChild
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm"
        >
          <Link to="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
