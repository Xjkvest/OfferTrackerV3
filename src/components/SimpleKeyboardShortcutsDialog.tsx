import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Keyboard, Navigation, Plus, Settings, HelpCircle } from 'lucide-react';

// Static shortcuts list to avoid circular dependencies
const SHORTCUTS = [
  { keys: '⌘ Shift N', description: 'Create new offer', category: 'offer' },
  { keys: '⌘ Shift O', description: 'Quick log offer', category: 'offer' },
  { keys: '⌘ Shift D', description: 'Go to dashboard', category: 'navigation' },
  { keys: '⌘ Shift L', description: 'Go to offers list', category: 'navigation' },
  { keys: '⌘ Shift A', description: 'Go to analytics', category: 'navigation' },
  { keys: '⌘ Shift S', description: 'Go to settings', category: 'navigation' },
  { keys: '⌘ Shift H', description: 'Go to help page', category: 'navigation' },
  { keys: '⌘ Shift B', description: 'Go to notifications', category: 'navigation' },
  { keys: '⌘ ,', description: 'Open preferences', category: 'dialogs' },
  { keys: '⌘ Shift /', description: 'Show help', category: 'dialogs' },
];

// Global state for the dialog
let helpDialogOpenState = false;
let setHelpDialogOpenState: ((open: boolean) => void) | null = null;

// Global function to show the dialog
export const showKeyboardShortcutsDialog = () => {
  if (setHelpDialogOpenState) {
    setHelpDialogOpenState(true);
  }
};

export function SimpleKeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  // Register global state
  useEffect(() => {
    setHelpDialogOpenState = setOpen;
    return () => {
      setHelpDialogOpenState = null;
    };
  }, []);

  // Group shortcuts by category
  const groupedShortcuts = {
    offer: SHORTCUTS.filter(s => s.category === 'offer'),
    navigation: SHORTCUTS.filter(s => s.category === 'navigation'),
    dialogs: SHORTCUTS.filter(s => s.category === 'dialogs')
  };

  const ShortcutGroup = ({ 
    title, 
    icon, 
    shortcuts 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    shortcuts: Array<{ keys: string; description: string }>;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid gap-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
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