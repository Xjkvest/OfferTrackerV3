import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ProfileSettings,
  OfferConfiguration,
  FollowupPreferences,
  DashboardPreferences,
  AppearanceLayout,
  CaseLinkSettings,
  ImportOffers,
  ResetAppSection
} from "@/components/settings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StreakSettings } from "@/components/settings/StreakSettings";

const Settings = () => {
  const navigate = useNavigate();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="container py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto p-1">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
          <TabsTrigger value="offerSetup">Offer Setup</TabsTrigger>
          <TabsTrigger value="reset">Reset</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <ProfileSettings />
          <FollowupPreferences />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <DashboardPreferences />
          <AppearanceLayout />
        </TabsContent>
        
        <TabsContent value="streak" className="space-y-4">
          <StreakSettings />
        </TabsContent>

        <TabsContent value="offerSetup" className="space-y-4">
          <OfferConfiguration />
          <CaseLinkSettings />
        </TabsContent>

        <TabsContent value="reset" className="space-y-4">
          <ImportOffers />
          <ResetAppSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
