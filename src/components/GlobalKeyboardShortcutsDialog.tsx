import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalKeyboardShortcuts } from '@/context/KeyboardShortcutsContext';
import { Keyboard, Navigation, Plus, Settings, HelpCircle } from 'lucide-react';

export function GlobalKeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const { getShortcutsList, setHelpDialogHandler } = useGlobalKeyboardShortcuts();

  // Register this dialog as the global help dialog
  useEffect(() => {
    setHelpDialogHandler(() => setOpen(true));
  }, [setHelpDialogHandler]);

  // Get shortcuts list safely
  const shortcutsList = getShortcutsList();

  // Group shortcuts by category
  const groupedShortcuts = {
    offer: shortcutsList.filter(s => s.description.toLowerCase().includes('offer')),
    navigation: shortcutsList.filter(s => s.description.toLowerCase().includes('go to')),
    dialogs: shortcutsList.filter(s => 
      s.description.toLowerCase().includes('preference') || 
      s.description.toLowerCase().includes('help')
    )
  };

  const ShortcutGroup = ({ 
    title, 
    icon, 
    shortcuts 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    shortcuts: Array<{ id: string; keys: string; description: string }>;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
            <span className="text-sm font-medium">
              {shortcut.description}
            </span>
            <kbd className="px-3 py-1.5 text-xs font-semibold text-foreground bg-background rounded border shadow-sm min-w-fit">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );

  // Component is ready to render

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate OfferTracker more efficiently on macOS
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-auto">
          <Card>
            <CardContent className="py-6 space-y-8">
              
              {/* Offer Management */}
              <ShortcutGroup
                title="Offer Management"
                icon={<Plus className="h-5 w-5 text-green-500" />}
                shortcuts={groupedShortcuts.offer}
              />

              {/* Navigation */}
              <ShortcutGroup
                title="Navigation"
                icon={<Navigation className="h-5 w-5 text-blue-500" />}
                shortcuts={groupedShortcuts.navigation}
              />

              {/* Settings & Help */}
              <ShortcutGroup
                title="Settings & Help"
                icon={<Settings className="h-5 w-5 text-purple-500" />}
                shortcuts={groupedShortcuts.dialogs}
              />

              {/* Additional Tips */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Tips</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Shortcuts work from anywhere in the app except when typing in text fields</p>
                  <p>• Use <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">⌘</kbd> (Command) key on Mac for all shortcuts</p>
                  <p>• Press <kbd className="px-1 py-0.5 bg-muted border rounded text-xs">Escape</kbd> to close any open dialog</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 