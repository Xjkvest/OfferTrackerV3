
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HelpContent } from "./HelpContent";

export function HeaderWithHelp() {
  const [helpOpen, setHelpOpen] = useState(false);
  
  return (
    <>
      <div className="relative">
        <Header />
        <div className="absolute right-16 top-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-secondary/30 hover:bg-secondary/60"
            onClick={() => setHelpOpen(true)}
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle>Help & Information</DialogTitle>
          </DialogHeader>
          <HelpContent />
        </DialogContent>
      </Dialog>
    </>
  );
}
