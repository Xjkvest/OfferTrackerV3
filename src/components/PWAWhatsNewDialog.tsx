import React from 'react';
import { WhatsNewDialog } from './WhatsNewDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw } from 'lucide-react';
import { UpdateInfo } from '@/hooks/useVersionCheck';

interface PWAWhatsNewDialogProps {
  open: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  isPWA: boolean;
  swUpdateAvailable: boolean;
  onRefreshPWA: () => void;
}

export const PWAWhatsNewDialog: React.FC<PWAWhatsNewDialogProps> = ({
  open,
  onClose,
  updateInfo,
  isPWA,
  swUpdateAvailable,
  onRefreshPWA
}) => {
  // If it's a service worker update without version info, show PWA-specific dialog
  if (open && swUpdateAvailable && !updateInfo && isPWA) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  App Update Available
                  <Badge variant="secondary" className="text-xs">
                    PWA
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  A new version of the app is ready to install
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              An updated version of Offer Tracker is available. Refresh the app to get the latest features and improvements.
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Later
              </Button>
              <Button onClick={onRefreshPWA} className="bg-primary hover:bg-primary/90">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh App
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // For regular version updates, use the standard dialog
  return (
    <WhatsNewDialog
      open={open}
      onClose={onClose}
      updateInfo={updateInfo}
    />
  );
}; 