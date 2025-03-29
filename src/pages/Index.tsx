import React, { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Dashboard } from "@/components/Dashboard";
import { OfferDialog } from "@/components/OfferDialog";
import { useOffers } from "@/context/OfferContext";

const Index = () => {
  const { userName } = useUser();
  const { checkFollowups } = useOffers();
  const [showSetupDialog, setShowSetupDialog] = React.useState(false);
  
  // Check if name is set on component mount
  useEffect(() => {
    if (!userName) {
      setShowSetupDialog(true);
    }
    
    // Check for followups on component mount
    checkFollowups();
  }, [userName, checkFollowups]);
  
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
