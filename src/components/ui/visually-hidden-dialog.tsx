import React from "react";
import { DialogContent } from "@/components/ui/dialog";

interface VisuallyHiddenDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

/**
 * A DialogContent wrapper that includes visually hidden but screen-reader accessible
 * title and description elements for accessibility
 */
export function VisuallyHiddenDialog({
  children,
  title,
  description,
  className,
}: VisuallyHiddenDialogProps) {
  const titleId = "dialog-title-" + Math.random().toString(36).substring(2, 9);
  const descriptionId = "dialog-description-" + Math.random().toString(36).substring(2, 9);

  return (
    <DialogContent 
      className={className}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="sr-only">
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
      </div>
      {children}
    </DialogContent>
  );
} 