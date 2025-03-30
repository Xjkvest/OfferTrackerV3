import React from "react";
import { AlertDialogContent } from "@/components/ui/alert-dialog";

interface VisuallyHiddenAlertDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

/**
 * An AlertDialogContent wrapper that includes visually hidden but screen-reader accessible
 * title and description elements for accessibility
 */
export function VisuallyHiddenAlertDialog({
  children,
  title,
  description,
  className,
}: VisuallyHiddenAlertDialogProps) {
  const titleId = "alert-dialog-title-" + Math.random().toString(36).substring(2, 9);
  const descriptionId = "alert-dialog-description-" + Math.random().toString(36).substring(2, 9);

  return (
    <AlertDialogContent 
      className={className}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="sr-only">
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
      </div>
      {children}
    </AlertDialogContent>
  );
} 