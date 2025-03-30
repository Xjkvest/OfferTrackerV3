import React, { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Dashboard } from "@/components/Dashboard";
import { OfferDialog } from "@/components/OfferDialog";
import { useOffers } from "@/context/OfferContext";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const { userName } = useUser();
  const { checkFollowups } = useOffers();
  const [searchParams] = useSearchParams();
  const [showSetupDialog, setShowSetupDialog] = React.useState(false);
  
  // Check if name is set on component mount or if setup param is present
  useEffect(() => {
    const forceSetup = searchParams.get('setup') === 'true';
    
    if (!userName || forceSetup) {
      setShowSetupDialog(true);
      
      // Clean up the URL if we have the setup parameter
      if (forceSetup && window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
    
    // Check for followups on component mount
    checkFollowups();
  }, [userName, checkFollowups, searchParams]);
  
  // Handler for setup completion - will close the dialog
  const handleSetupComplete = () => {
    setShowSetupDialog(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Dashboard />
      
      <OfferDialog 
        open={showSetupDialog} 
        onOpenChange={setShowSetupDialog}
        onSetupComplete={handleSetupComplete}
      />
    </div>
  );
};

export default Index;
