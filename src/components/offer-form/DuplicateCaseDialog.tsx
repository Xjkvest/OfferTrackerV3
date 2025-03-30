import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Offer } from "@/context/OfferContext";

interface DuplicateCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditExisting: () => void;
  onForceSave: () => void;
  existingOffer: Offer | null;
}

export function DuplicateCaseDialog({
  isOpen,
  onClose,
  onEditExisting,
  onForceSave,
  existingOffer,
}: DuplicateCaseDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Case Number</AlertDialogTitle>
          <AlertDialogDescription>
            A case with number {existingOffer?.caseNumber} already exists.
          </AlertDialogDescription>
          
          {existingOffer && (
            <div className="mt-2 text-sm">
              <div className="font-medium">Existing offer details:</div>
              <ul className="list-disc pl-4 mt-1">
                <li>Channel: {existingOffer.channel}</li>
                <li>Offer Type: {existingOffer.offerType}</li>
                <li>Date: {new Date(existingOffer.date).toLocaleDateString()}</li>
              </ul>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onEditExisting} className="bg-blue-600 hover:bg-blue-700">
            Edit Existing
          </AlertDialogAction>
          <AlertDialogAction onClick={onForceSave} className="bg-orange-600 hover:bg-orange-700">
            Create New Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 