import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpContent } from '@/components/HelpContent';
import { Card, CardContent } from "@/components/ui/card";
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  // These shortcuts mirror what is configured in Dashboard.tsx 
  // We don't use the handlers here, just for display
  const shortcuts = {
    newOffer: {
      combo: { key: 'n', shiftKey: true, metaKey: true },
      handler: () => {},
      description: 'Create a new offer',
    },
    quickOffer: {
      combo: { key: 'o', shiftKey: true, metaKey: true },
      handler: () => {},
      description: 'Quick log offer',
    },
    preferences: {
      combo: { key: ',', metaKey: true },
      handler: () => {},
      description: 'Open preferences',
    },
    help: {
      combo: { key: '/', shiftKey: true, metaKey: true },
      handler: () => {},
      description: 'Show keyboard shortcuts',
    },
  };

  const { getShortcutsList } = useKeyboardShortcuts(shortcuts);
  const shortcutsList = getShortcutsList();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Help & Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Learn how to use OfferTracker more efficiently
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="help" className="flex-grow overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="help">Help Guide</TabsTrigger>
            <TabsTrigger value="shortcuts">Keyboard Shortcuts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="help" className="flex-grow overflow-auto">
            <HelpContent />
          </TabsContent>
          
          <TabsContent value="shortcuts" className="flex-grow overflow-auto">
            <Card>
              <CardContent className="py-4">
                <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use these keyboard shortcuts to navigate the app more efficiently on your Mac:
                </p>
                <div className="grid gap-4">
                  {shortcutsList.map((shortcut) => (
                    <div key={shortcut.id} className="flex items-center justify-between border-b pb-2">
                      <span className="text-sm font-medium">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-foreground bg-muted rounded border shadow-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 