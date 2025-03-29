import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  gradient = "from-primary to-primary-foreground",
  className
}) => {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className={cn(
        "py-3 px-4",
        "bg-gradient-to-r",
        gradient
      )}>
        <CardTitle className="text-sm font-semibold text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
