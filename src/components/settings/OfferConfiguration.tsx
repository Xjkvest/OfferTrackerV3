
import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function OfferConfiguration() {
  const { 
    channels, 
    setChannels, 
    offerTypes, 
    setOfferTypes, 
    settings, 
    updateSettings 
  } = useUser();
  
  const [newChannel, setNewChannel] = useState("");
  const [newOfferType, setNewOfferType] = useState("");
  const [convertedByDefault, setConvertedByDefault] = useState(settings.offersConvertedByDefault);
  
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
  
  const handleConvertedToggle = (checked: boolean) => {
    setConvertedByDefault(checked);
    updateSettings({ offersConvertedByDefault: checked });
    toast({
      title: "Setting Updated",
      description: `New offers will ${checked ? 'now' : 'no longer'} be marked as converted by default.`,
    });
  };

  return (
    <Card className="rounded-2xl bg-muted/10 p-2 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Offer Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
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
              className="bg-background/50 flex-1"
            />
            <Button 
              onClick={handleAddChannel} 
              disabled={!newChannel.trim() || channels.includes(newChannel.trim())}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
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
        
        <div className="space-y-3">
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
              className="bg-background/50 flex-1"
            />
            <Button 
              onClick={handleAddOfferType} 
              disabled={!newOfferType.trim() || offerTypes.includes(newOfferType.trim())}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
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
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch 
              id="convertedByDefault" 
              checked={convertedByDefault}
              onCheckedChange={handleConvertedToggle}
            />
            <Label htmlFor="convertedByDefault">Mark new offers as converted by default</Label>
          </div>
          <p className="text-sm text-muted-foreground pl-7">
            When enabled, all new offers will be marked as converted when created
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
