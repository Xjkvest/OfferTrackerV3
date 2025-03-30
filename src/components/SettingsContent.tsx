import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useTheme } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Save, RefreshCw, AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { GoalSettings } from "@/components/GoalSettings";
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
import { ResetAppSection } from "@/components/settings";

export function SettingsContent() {
  const { userName, setUserName, channels, setChannels, offerTypes, setOfferTypes, resetAppData, baseOfferLink, setBaseOfferLink } = useUser();
  const { theme } = useTheme();
  
  const [nameInput, setNameInput] = useState(userName);
  const [newChannel, setNewChannel] = useState("");
  const [newOfferType, setNewOfferType] = useState("");
  const [baseUrlInput, setBaseUrlInput] = useState(baseOfferLink || "");
  const [baseUrlError, setBaseUrlError] = useState("");
  
  useEffect(() => {
    if (!baseUrlInput) {
      setBaseUrlError("");
      return;
    }
    
    if (!baseUrlInput.startsWith('http')) {
      setBaseUrlError("URL must start with http:// or https://");
      return;
    }
    
    if (!baseUrlInput.endsWith('/')) {
      setBaseUrlError("URL must end with a /");
      return;
    }
    
    setBaseUrlError("");
  }, [baseUrlInput]);
  
  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      toast({
        title: "Name Updated",
        description: "Your name has been updated successfully.",
      });
    }
  };
  
  const handleSaveBaseUrl = () => {
    if (baseUrlError) return;
    
    setBaseOfferLink(baseUrlInput.trim());
    toast({
      title: "Base URL Updated",
      description: "Your base URL for offer links has been updated.",
    });
  };
  
  const handleAddChannel = () => {
    if (newChannel.trim() && !channels.includes(newChannel.trim())) {
      setChannels([...channels, newChannel.trim()]);
      setNewChannel("");
      toast({
        title: "Channel Added",
        description: `"${newChannel.trim()}" has been added to your channels.`,
      });
    }
  };
  
  const handleRemoveChannel = (channel: string) => {
    setChannels(channels.filter(c => c !== channel));
    toast({
      title: "Channel Removed",
      description: `"${channel}" has been removed from your channels.`,
    });
  };
  
  const handleAddOfferType = () => {
    if (newOfferType.trim() && !offerTypes.includes(newOfferType.trim())) {
      setOfferTypes([...offerTypes, newOfferType.trim()]);
      setNewOfferType("");
      toast({
        title: "Offer Type Added",
        description: `"${newOfferType.trim()}" has been added to your offer types.`,
      });
    }
  };
  
  const handleRemoveOfferType = (type: string) => {
    setOfferTypes(offerTypes.filter(t => t !== type));
    toast({
      title: "Offer Type Removed",
      description: `"${type}" has been removed from your offer types.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card bg-gradient-to-br from-background/90 to-background/70 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-blue-600 dark:text-blue-400">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex space-x-2">
                <Input
                  id="name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-background/50"
                />
                <Button 
                  onClick={handleSaveName} 
                  disabled={!nameInput.trim() || nameInput === userName}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <div className="text-sm text-muted-foreground">
                  Dark/Light mode
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL for external offer links</Label>
            <div className="flex space-x-2">
              <div className="flex-grow space-y-1">
                <Input
                  id="baseUrl"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  placeholder="https://example.com/offers/"
                  className={`bg-background/50 ${baseUrlError ? "border-red-500" : ""}`}
                />
                {baseUrlError && (
                  <div className="text-xs text-red-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {baseUrlError}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Used to create clickable links for case numbers.
                </div>
              </div>
              <Button 
                onClick={handleSaveBaseUrl} 
                disabled={!!baseUrlError || baseUrlInput === baseOfferLink}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <GoalSettings />
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card bg-gradient-to-br from-background/90 to-background/70 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-indigo-600 dark:text-indigo-400">Channels & Offer Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel">Add New Channel</Label>
                <div className="flex space-x-2">
                  <Input
                    id="channel"
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    placeholder="Enter channel name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddChannel();
                      }
                    }}
                    className="bg-background/50"
                  />
                  <Button 
                    onClick={handleAddChannel} 
                    disabled={!newChannel.trim() || channels.includes(newChannel.trim())}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Current Channels</Label>
                <div className="flex flex-wrap gap-2 pt-1 max-h-40 overflow-y-auto">
                  {channels.length > 0 ? (
                    channels.map((channel) => (
                      <Badge 
                        key={channel} 
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
                      >
                        {channel}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 ml-1 hover:bg-destructive/20 rounded-full"
                          onClick={() => handleRemoveChannel(channel)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No channels added yet</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="offerType">Add New Offer Type</Label>
                <div className="flex space-x-2">
                  <Input
                    id="offerType"
                    value={newOfferType}
                    onChange={(e) => setNewOfferType(e.target.value)}
                    placeholder="Enter offer type"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddOfferType();
                      }
                    }}
                    className="bg-background/50"
                  />
                  <Button 
                    onClick={handleAddOfferType} 
                    disabled={!newOfferType.trim() || offerTypes.includes(newOfferType.trim())}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Current Offer Types</Label>
                <div className="flex flex-wrap gap-2 pt-1 max-h-40 overflow-y-auto">
                  {offerTypes.length > 0 ? (
                    offerTypes.map((type) => (
                      <Badge 
                        key={type} 
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                      >
                        {type}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 ml-1 hover:bg-destructive/20 rounded-full"
                          onClick={() => handleRemoveOfferType(type)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No offer types added yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card bg-gradient-to-br from-background/90 to-background/70 shadow-sm hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-red-600 dark:text-red-400">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium">Storage Information</h3>
              <p className="text-sm text-muted-foreground">
                All your data is stored in your browser's local storage. Clearing browser data will erase your OfferTracker data.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-medium text-destructive">Reset Application</h3>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your data and cannot be undone.
              </p>
              
              <ResetAppSection />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
