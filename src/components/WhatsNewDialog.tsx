import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Zap, 
  Bug,
  CheckCircle,
  ArrowRight,
  Gift
} from 'lucide-react';
import { UpdateInfo } from '@/hooks/useVersionCheck';

interface WhatsNewDialogProps {
  open: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
}

export const WhatsNewDialog: React.FC<WhatsNewDialogProps> = ({
  open,
  onClose,
  updateInfo
}) => {
  if (!updateInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {updateInfo.title}
                <Badge variant="secondary" className="text-xs">
                  v{updateInfo.version}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Here's what's new in this update
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* New Features */}
            {updateInfo.features.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-blue-500">New Features</h3>
                </div>
                <div className="space-y-2 ml-7">
                  {updateInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {updateInfo.improvements.length > 0 && (
              <>
                {updateInfo.features.length > 0 && <Separator />}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-yellow-500">Improvements</h3>
                  </div>
                  <div className="space-y-2 ml-7">
                    {updateInfo.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Bug Fixes */}
            {updateInfo.fixes.length > 0 && (
              <>
                {(updateInfo.features.length > 0 || updateInfo.improvements.length > 0) && <Separator />}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-500">Bug Fixes</h3>
                  </div>
                  <div className="space-y-2 ml-7">
                    {updateInfo.fixes.map((fix, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{fix}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            This dialog will only appear once per update
          </div>
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 