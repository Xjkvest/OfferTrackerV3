import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown } from "lucide-react";
import * as ReactDOM from "react-dom";

// --------------------------------
// Types
// --------------------------------

export type CardVariant = "primary" | "success" | "info" | "warning" | "danger" | "neutral";

export type TrendDirection = "up" | "down" | "neutral";

export interface CardTrend {
  direction: TrendDirection;
  value: string;
}

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: CardVariant;
  href?: string;
  isCompact?: boolean;
  children?: React.ReactNode;
}

export interface CardIconProps {
  icon: React.ReactNode;
  variant?: CardVariant;
  className?: string;
}

export interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export interface CardHeaderProps {
  title: string;
  trend?: CardTrend;
  className?: string;
}

export interface CardValueProps {
  value: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}

export interface CardDetailProps {
  detail: React.ReactNode;
  className?: string;
}

export interface CardSparklineProps {
  type: "increase" | "decrease" | "stable";
  color: string;
  className?: string;
}

export interface CardProgressProps {
  value: number;
  className?: string;
}

// --------------------------------
// Variant Styles
// --------------------------------

const variantStyles: Record<CardVariant, {
  icon: string;
  text: string;
  bg: string;
}> = {
  primary: {
    icon: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    bg: "from-blue-50/50 to-blue-50/20 dark:from-blue-950/30 dark:to-blue-950/10",
  },
  success: {
    icon: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "from-emerald-50/50 to-emerald-50/20 dark:from-emerald-950/30 dark:to-emerald-950/10",
  },
  info: {
    icon: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "from-indigo-50/50 to-indigo-50/20 dark:from-indigo-950/30 dark:to-indigo-950/10",
  },
  warning: {
    icon: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    bg: "from-amber-50/50 to-amber-50/20 dark:from-amber-950/30 dark:to-amber-950/10",
  },
  danger: {
    icon: "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
    bg: "from-red-50/50 to-red-50/20 dark:from-red-950/30 dark:to-red-950/10",
  },
  neutral: {
    icon: "bg-gray-100 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400",
    text: "text-gray-600 dark:text-gray-400",
    bg: "from-gray-50/50 to-gray-50/20 dark:from-gray-800/30 dark:to-gray-800/10",
  }
};

const trendStyles: Record<TrendDirection, string> = {
  up: "bg-green-100/60 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  down: "bg-red-100/60 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  neutral: "bg-gray-100/60 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
};

// --------------------------------
// Card Components
// --------------------------------

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "primary", href, isCompact = false, className, children, ...props }, ref) => {
    const variantBg = variantStyles[variant].bg;
    const cardContent = (
      <motion.div
        ref={ref}
        whileHover={{ 
          translateY: -1,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative rounded-lg",
          "bg-gradient-to-r from-card/90 to-card/80 border border-border/30",
          "backdrop-blur-sm shadow-sm",
          "min-h-[2.75rem]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );

    if (href) {
      return (
        <Link to={href} className="block h-full">
          {cardContent}
        </Link>
      );
    }

    return cardContent;
  }
);
Card.displayName = "Card";

export const CardIcon: React.FC<CardIconProps> = ({ 
  icon, 
  variant = "primary", 
  className 
}) => {
  const variantClass = variantStyles[variant].icon;
  
  return (
    <div className={cn(
      "flex items-center justify-center h-7 w-7 rounded-md",
      "shadow-inner", 
      variantClass,
      className
    )}>
      <div className="flex items-center justify-center h-3.5 w-3.5">{icon}</div>
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  title, 
  trend, 
  className 
}) => {
  return (
    <div className={cn("grid grid-cols-[1fr,auto] items-center gap-1", className)}>
      <div className="text-[11px] font-medium text-muted-foreground truncate">
        {title}
      </div>
      {trend && (
        <motion.span 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "inline-flex items-center text-[10px] font-semibold px-1 py-0.5 rounded-sm justify-self-end",
            trendStyles[trend.direction]
          )}
        >
          {trend.direction === 'up' ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : 
           trend.direction === 'down' ? <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> : null}
          {trend.value}
        </motion.span>
      )}
    </div>
  );
};

export const CardValue: React.FC<CardValueProps> = ({ 
  value, 
  variant = "primary", 
  className 
}) => {
  const variantClass = variantStyles[variant].text;
  
  return (
    <div className={cn(
      "font-bold font-mono text-sm", 
      variantClass,
      className
    )}>
      {value}
    </div>
  );
};

interface CustomTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "start" | "end";
}

// Custom tooltip implementation that uses a portal
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  content,
  children,
  side = "bottom",
  align = "center"
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = React.useCallback(() => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 220; // max-width of tooltip
    
    let top = 0;
    let left = 0;
    
    // Position based on side
    if (side === "top") {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (side === "bottom") {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    } else if (side === "left") {
      top = rect.top + rect.height / 2;
      left = rect.left - 8;
    } else if (side === "right") {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
    }
    
    // Adjust based on alignment
    if (side === "top" || side === "bottom") {
      if (align === "start") {
        left = rect.left;
      } else if (align === "end") {
        left = rect.right;
      } else {
        left = rect.left + rect.width / 2;
      }
    } else {
      if (align === "start") {
        top = rect.top;
      } else if (align === "end") {
        top = rect.bottom;
      } else {
        top = rect.top + rect.height / 2;
      }
    }
    
    setPosition({ top, left });
    setIsOpen(true);
  }, [side, align]);

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  // Clone the child element to add our event handlers and ref
  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  // Calculate tooltip position classes
  const getTooltipStyles = () => {
    let transform = "";
    
    // Positioning
    if (side === "top") {
      transform = "translateX(-50%) translateY(-100%)";
    } else if (side === "bottom") {
      transform = "translateX(-50%)";
    } else if (side === "left") {
      transform = "translateX(-100%) translateY(-50%)";
    } else if (side === "right") {
      transform = "translateY(-50%)";
    }
    
    // Alignment
    if ((side === "top" || side === "bottom")) {
      if (align === "start") {
        transform = "translateY(0)";
      } else if (align === "end") {
        transform = "translateX(-100%) translateY(0)";
      }
    } else {
      if (align === "start") {
        transform = "translateX(0)";
      } else if (align === "end") {
        transform = "translateX(0) translateY(-100%)";
      }
    }
    
    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
      transform
    };
  };

  return (
    <>
      {triggerElement}
      
      {isOpen && ReactDOM.createPortal(
        <div 
          ref={tooltipRef}
          className="fixed z-50 max-w-[220px] bg-popover text-popover-foreground shadow-md rounded-md text-xs p-2 animate-in fade-in-0 zoom-in-95"
          style={getTooltipStyles()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};

export const CardDetail: React.FC<CardDetailProps> = ({ 
  detail, 
  className 
}) => {
  return (
    <CustomTooltip 
      content={typeof detail === 'string' ? detail : <div>{detail}</div>}
      side="bottom"
      align="end"
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "cursor-help text-[10px] text-muted-foreground underline decoration-dotted",
          "bg-background/50 px-1 py-0.5 rounded hover:bg-background/80 transition-colors",
          "justify-self-end",
          className
        )}
      >
        details
      </motion.div>
    </CustomTooltip>
  );
};

export const CardSparkline: React.FC<CardSparklineProps> = ({ 
  type, 
  color, 
  className 
}) => {
  const points = type === 'increase' 
    ? "M0,8 L3,7 L6,6 L9,5 L12,3 L15,2" 
    : type === 'decrease' 
      ? "M0,2 L3,3 L6,4 L9,5 L12,7 L15,8" 
      : "M0,5 L3,4 L6,6 L9,4 L12,6 L15,5";
  
  return (
    <div className={cn("h-6 w-10 ml-1 opacity-70 overflow-hidden", className)}>
      <svg viewBox="0 0 15 10" className="w-full h-full">
        <path d={points} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const CardProgress: React.FC<CardProgressProps> = ({ 
  value, 
  className 
}) => {
  return (
    <div className={cn("absolute left-0 right-0 bottom-0", className)}>
      <Progress 
        value={value} 
        className="h-1 bg-background/30 rounded-none"
      />
    </div>
  );
};

// --------------------------------
// Composite MetricCard Component
// --------------------------------

export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  variant?: CardVariant;
  href?: string;
  trend?: CardTrend;
  detail?: React.ReactNode;
  sparklineType?: "increase" | "decrease" | "stable";
  progress?: number;
  className?: string;
  isCompact?: boolean;
}

const getShortTitle = (title: string) => {
  // Common metric abbreviations
  const abbreviations: Record<string, string> = {
    'Conversion Rate': 'Conv.',
    'Conversions': 'Conv.',
    'Conversion': 'Conv.',
    'CSAT Rating': 'CSAT',
    'Customer Satisfaction': 'CSAT',
    'Total Offers': 'Offers',
    'Average Response': 'Avg. Resp.',
    'Response Time': 'Resp. Time',
    'Offer Streak': 'Streak',
    'Performance': 'Perf.',
    'Follow-ups': 'F/U',
    'Follow-up Rate': 'F/U Rate',
    'Engagement': 'Engage.',
    'Average Value': 'Avg. Value'
  };

  // Check if we have a predefined abbreviation
  for (const [fullText, abbr] of Object.entries(abbreviations)) {
    if (title.includes(fullText)) {
      return title.replace(fullText, abbr);
    }
  }

  // If no match, return the original string
  return title;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  variant = "primary",
  href,
  trend,
  detail,
  sparklineType,
  progress,
  className,
  isCompact = false
}) => {
  // Get the color based on variant for the sparkline
  const sparklineColor = 
    variant === "primary" ? "var(--blue-600)" :
    variant === "success" ? "var(--emerald-600)" :
    variant === "info" ? "var(--indigo-600)" :
    variant === "warning" ? "var(--amber-600)" :
    variant === "danger" ? "var(--red-600)" :
    "var(--gray-600)";
  
  // Smart text handling
  const [titleRef, setTitleRef] = React.useState<HTMLDivElement | null>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);
  const [useSmallFont, setUseSmallFont] = React.useState(false);
  const [displayTitle, setDisplayTitle] = React.useState(title);
  
  React.useEffect(() => {
    if (!titleRef) return;
    
    const checkTruncation = () => {
      const isTitleTruncated = titleRef.scrollWidth > titleRef.clientWidth;
      
      if (isTitleTruncated && displayTitle === title) {
        // Try abbreviated version first
        setDisplayTitle(getShortTitle(title));
        setIsTruncated(true);
      } else if (isTitleTruncated && displayTitle !== title) {
        // If still truncated with abbreviation, use smaller font
        setUseSmallFont(true);
      } else if (!isTitleTruncated) {
        setUseSmallFont(false);
      }
    };
    
    checkTruncation();
    
    // Re-check when window resizes
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [titleRef, displayTitle, title]);
    
  return (
    <Card variant={variant} href={href} isCompact={isCompact} className={cn("overflow-hidden", className)}>
      <div className="p-2 flex min-h-[60px] relative">
        {/* Left side - icon */}
        <div className="flex-shrink-0 mr-2.5">
          <CardIcon icon={icon} variant={variant} />
        </div>
        
        {/* Middle - main content with fixed right padding */}
        <div className="flex-grow min-w-0" style={{ paddingRight: trend || detail || sparklineType ? '70px' : '0' }}>
          {/* Title row */}
          <div className="mb-1">
            {displayTitle !== title ? (
              <CustomTooltip content={title} side="top" align="start">
                <div 
                  ref={setTitleRef}
                  className={cn(
                    "text-muted-foreground truncate font-medium",
                    useSmallFont ? "text-[9px]" : "text-[11px]"
                  )}
                >
                  {displayTitle}
                </div>
              </CustomTooltip>
            ) : (
              <div 
                ref={setTitleRef}
                className={cn(
                  "text-muted-foreground truncate font-medium",
                  useSmallFont ? "text-[9px]" : "text-[11px]"
                )}
              >
                {displayTitle}
              </div>
            )}
          </div>
          
          {/* Value row */}
          <div>
            <div className={cn(
              "font-bold font-mono text-sm", 
              variantStyles[variant].text
            )}>
              {value}
            </div>
          </div>
        </div>
        
        {/* Right side - absolute positioned elements */}
        <div className="absolute top-0 right-0 h-full flex flex-col justify-between py-2 pr-2">
          {/* Trend at top right */}
          {trend && (
            <div className={cn(
              "inline-flex items-center text-[10px] font-semibold px-1 py-0.5 rounded-sm whitespace-nowrap",
              trendStyles[trend.direction]
            )}>
              {trend.direction === 'up' ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : 
              trend.direction === 'down' ? <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> : null}
              {trend.value}
            </div>
          )}
          
          {/* Details at bottom right */}
          {detail && (
            <CustomTooltip 
              content={typeof detail === 'string' ? detail : <div>{detail}</div>}
              side="bottom"
              align="end"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-help text-[10px] text-muted-foreground underline decoration-dotted bg-background/50 px-1 py-0.5 rounded hover:bg-background/80 transition-colors whitespace-nowrap self-end"
              >
                details
              </motion.div>
            </CustomTooltip>
          )}
        </div>
        
        {/* Sparkline positioned absolutely */}
        {sparklineType && (
          <div className="absolute top-1/2 right-1 -translate-y-1/2">
            <div className="h-6 w-8 opacity-70">
              <svg viewBox="0 0 15 10" className="w-full h-full">
                <path 
                  d={
                    sparklineType === 'increase' 
                      ? "M0,8 L3,7 L6,6 L9,5 L12,3 L15,2" 
                      : sparklineType === 'decrease' 
                        ? "M0,2 L3,3 L6,4 L9,5 L12,7 L15,8" 
                        : "M0,5 L3,4 L6,6 L9,4 L12,6 L15,5"
                  } 
                  stroke={sparklineColor} 
                  strokeWidth="1.5" 
                  fill="none" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      {progress !== undefined && (
        <div className="absolute left-0 right-0 bottom-0">
          <Progress 
            value={progress} 
            className="h-1 bg-background/30 rounded-none"
          />
        </div>
      )}
    </Card>
  );
}; 