import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Tag, BarChart3, Settings2, PlusCircle, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { OfferDialog } from "./OfferDialog";
import { HelpButton } from "./HelpButton";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { FloatingActionButton } from "./FloatingActionButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationMenu } from "./NotificationMenu";

export function Header() {
  const location = useLocation();
  const activeRoute = location.pathname;
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const links = [
    { to: '/', icon: <Home className="h-4 w-4" />, label: 'Home' },
    { to: '/offers', icon: <Tag className="h-4 w-4" />, label: 'Offers' },
    { to: '/analytics', icon: <BarChart3 className="h-4 w-4" />, label: 'Analytics' },
    { to: '/settings', icon: <Settings2 className="h-4 w-4" />, label: 'Settings' }
  ];

  const handleNewOfferClick = () => {
    setOfferDialogOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 overflow-hidden rounded-full">
                <img 
                  src="/lovable-uploads/7dbf1552-c8ff-480f-a5ba-33e765394a5a.png" 
                  alt="Offer Tracker Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="hidden sm:block text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-400 bg-clip-text text-transparent">
                Offer Tracker
              </h1>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 mx-auto">
            {links.map(link => (
              <Button
                key={link.to}
                variant={activeRoute === link.to ? "default" : "ghost"}
                size="sm"
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
                  activeRoute === link.to 
                    ? "bg-gradient-to-r from-indigo-600/90 to-violet-500/90 text-white" 
                    : "hover:bg-secondary/80"
                }`}
                asChild
              >
                <Link to={link.to}>
                  {link.icon}
                  <span className="inline-block">{link.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
          
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20"
                onClick={handleNewOfferClick}
                aria-label="Log new offer"
              >
                <PlusCircle className="h-5 w-5 text-emerald-500" />
                <span className="sr-only">Add Offer</span>
              </Button>
            </div>
            
            {/* Notification menu - visible on both desktop and mobile */}
            <NotificationMenu />
            
            {/* Help button - visible on both desktop and mobile */}
            <HelpButton />
            
            {/* Desktop buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
            </div>
            
            {/* Mobile drawer trigger - now on the right side */}
            <div className="md:hidden">
              <MobileNavDrawer onNewOfferClick={handleNewOfferClick} />
            </div>
          </div>
        </div>
      </header>
      
      {/* Floating Action Button (Mobile only) */}
      <FloatingActionButton onClick={handleNewOfferClick} />
      
      {/* Offer Dialog */}
      <OfferDialog 
        open={offerDialogOpen} 
        onOpenChange={setOfferDialogOpen} 
      />
    </>
  );
}
