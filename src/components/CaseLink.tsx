
import React from "react";
import { useUser } from "@/context/UserContext";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseLinkProps {
  caseNumber: string;
  className?: string;
  showHash?: boolean;
  iconSize?: number;
}

export function CaseLink({ caseNumber, className, showHash = true, iconSize = 3 }: CaseLinkProps) {
  const { baseOfferLink } = useUser();

  const displayText = showHash ? `#${caseNumber}` : caseNumber;

  const sizeMap = {
    3: "h-3 w-3",
    4: "h-4 w-4",
    5: "h-5 w-5",
    6: "h-6 w-6",
  };

  if (!baseOfferLink) {
    return <span className={className}>{displayText}</span>;
  }

  return (
    <a
      href={`${baseOfferLink}${caseNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center whitespace-nowrap",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {displayText}
      <ExternalLink className={`${sizeMap[iconSize] ?? "h-3 w-3"} ml-1 inline`} />
    </a>
  );
}