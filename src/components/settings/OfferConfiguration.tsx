import React, { useState, KeyboardEvent } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, MessageSquare, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
  
  const handleKeyDownChannel = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newChannel.trim()) {
      e.preventDefault();
      handleAddChannel();
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
  
  const handleKeyDownOfferType = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newOfferType.trim()) {
      e.preventDefault();
      handleAddOfferType();
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="rounded-2xl bg-muted/10 p-2 shadow-sm border border-border/50 overflow-hidden">
        <CardHeader className="py-4">
          <CardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Offer Configuration</CardTitle>
          <CardDescription>
            Configure the channels and offer types available when creating offers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <motion.div 
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gradient-to-r from-blue-500/5 to-blue-500/10 p-5 rounded-xl border border-blue-500/10">
              <Label className="text-lg mb-3 block flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-500/80" />
                <span>Communication Channels</span>
              </Label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-10">
                {channels.map((channel) => (
                  <Badge 
                    key={channel} 
                    variant="outline" 
                    className="py-1.5 px-3 gap-1.5 text-sm bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 transition-colors group"
                  >
                    {channel}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full opacity-50 group-hover:opacity-100 hover:bg-blue-500/20"
                      onClick={() => handleRemoveChannel(channel)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {channels.length === 0 && (
                  <div className="text-sm text-muted-foreground italic p-2">
                    No channels added yet - add your first channel below
                  </div>
                )}
              </div>
              <div className="flex">
                <Input
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  onKeyDown={handleKeyDownChannel}
                  placeholder="Add new channel (e.g., Email, Chat)"
                  className="flex-1 rounded-r-none focus-visible:ring-blue-500/30 border-blue-500/20"
                />
                <Button
                  onClick={handleAddChannel}
                  className="rounded-l-none bg-blue-500 hover:bg-blue-600"
                  disabled={!newChannel.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to quickly add a new channel
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500/5 to-purple-500/10 p-5 rounded-xl border border-purple-500/10">
              <Label className="text-lg mb-3 block flex items-center">
                <Tag className="h-5 w-5 mr-2 text-purple-500/80" />
                <span>Offer Types</span>
              </Label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-10">
                {offerTypes.map((type) => (
                  <Badge 
                    key={type} 
                    variant="outline" 
                    className="py-1.5 px-3 gap-1.5 text-sm bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10 transition-colors group"
                  >
                    {type}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full opacity-50 group-hover:opacity-100 hover:bg-purple-500/20"
                      onClick={() => handleRemoveOfferType(type)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {offerTypes.length === 0 && (
                  <div className="text-sm text-muted-foreground italic p-2">
                    No offer types added yet - add your first offer type below
                  </div>
                )}
              </div>
              <div className="flex">
                <Input
                  value={newOfferType}
                  onChange={(e) => setNewOfferType(e.target.value)}
                  onKeyDown={handleKeyDownOfferType}
                  placeholder="Add new offer type (e.g., Email Campaigns)"
                  className="flex-1 rounded-r-none focus-visible:ring-purple-500/30 border-purple-500/20"
                />
                <Button
                  onClick={handleAddOfferType}
                  className="rounded-l-none bg-purple-500 hover:bg-purple-600"
                  disabled={!newOfferType.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to quickly add a new offer type
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
