import React, { useState, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export function ResetAppSection() {
  const { resetAppData } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const confirmInputRef = useRef<HTMLInputElement>(null);
  
  const handleConfirmReset = async () => {
    if (confirmText === "RESET") {
      try {
        toast({
          title: "Resetting Application",
          description: "Please wait while your data is being reset...",
        });
        
        await resetAppData();
        setIsOpen(false);
        
        toast({
          title: "Application Reset",
          description: "All data has been deleted successfully.",
        });
      } catch (error) {
        console.error("Error resetting application data:", error);
        toast({
          title: "Reset Failed",
          description: "There was a problem resetting your data. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Reset Cancelled",
        description: "You must type RESET to confirm deletion.",
        variant: "destructive",
      });
      if (confirmInputRef.current) {
        confirmInputRef.current.focus();
      }
    }
  };
  
  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmText("");
    }
  };

  return (
    <Card className="rounded-2xl bg-muted/10 p-2 shadow-sm border-red-200 dark:border-red-900/40">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-bold text-red-600 dark:text-red-400">Reset Application</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-800 dark:text-red-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Danger Zone</p>
              <p className="text-sm mt-1">
                This will delete all your offers, settings, and preferences. 
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        
        <AlertDialog open={isOpen} onOpenChange={handleDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                Reset Application Data
              </AlertDialogTitle>
              <AlertDialogDescription>
                <p className="mb-3">
                  This action will permanently delete all your data, including all offers, 
                  settings and preferences. This action cannot be undone.
                </p>
                <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-md">
                  <Label htmlFor="confirmReset" className="text-sm font-medium text-red-800 dark:text-red-200">
                    Type RESET to confirm:
                  </Label>
                  <Input
                    id="confirmReset"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mt-2 bg-white/70 dark:bg-black/20 border-red-300 dark:border-red-800"
                    placeholder="RESET"
                    ref={confirmInputRef}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  handleConfirmReset();
                }}
                disabled={confirmText !== "RESET"}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {confirmText === "RESET" ? "Reset Everything" : "Type RESET to confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
