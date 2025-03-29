
import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function CaseLinkSettings() {
  const { baseOfferLink, setBaseOfferLink } = useUser();
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
  
  // Save URL when input changes and is valid
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (baseUrlInput !== baseOfferLink && !baseUrlError && baseUrlInput) {
        setBaseOfferLink(baseUrlInput.trim());
        toast({
          title: "Base URL Updated",
          description: "Your base URL for case links has been updated.",
        });
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [baseUrlInput, baseUrlError, baseOfferLink, setBaseOfferLink]);

  return (
    <Card className="rounded-2xl bg-muted/10 p-2 shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-xl font-bold text-cyan-600 dark:text-cyan-400">Case Link Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="baseUrl">Base URL for Case Numbers</Label>
          <div className="space-y-1">
            <div className="relative">
              <Input
                id="baseUrl"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="https://support.example.com/cases/"
                className={`bg-background/50 ${baseUrlError ? "border-red-500" : ""} pr-9`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
            {baseUrlError && (
              <div className="text-xs text-red-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {baseUrlError}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              When set, case numbers will render as clickable links wherever visible
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
