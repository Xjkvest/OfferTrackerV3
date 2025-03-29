
import React from "react";
import { motion } from "framer-motion";
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

const Settings = () => {
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <motion.main 
        className="flex-1 container max-w-4xl mx-auto p-4 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Customize your offer tracking experience
          </p>
        </motion.div>
        
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <ProfileSettings />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <OfferConfiguration />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <FollowupPreferences />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <DashboardPreferences />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <AppearanceLayout />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <CaseLinkSettings />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ImportOffers />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <ResetAppSection />
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default Settings;
