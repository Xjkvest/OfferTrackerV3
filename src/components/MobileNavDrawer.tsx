import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Tag, BarChart3, Settings2, Menu, HelpCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { HelpButton } from "./HelpButton";

interface MobileNavDrawerProps {
  onNewOfferClick: () => void;
}

export function MobileNavDrawer({ onNewOfferClick }: MobileNavDrawerProps) {
  const location = useLocation();
  const activeRoute = location.pathname;
  const [open, setOpen] = useState(false);
  
  const links = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { to: '/offers', icon: <Tag className="h-5 w-5" />, label: 'Offers' },
    { to: '/analytics', icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics' },
    { to: '/settings', icon: <Settings2 className="h-5 w-5" />, label: 'Settings' }
  ];

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleNewOfferClick = () => {
    onNewOfferClick();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 backdrop-blur-lg bg-background/95 w-[280px]">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                <img
                  src="./images/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-md"
                />
                <span className="text-xl font-semibold">Offer Tracker</span>
              </Link>
            </div>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col p-4 gap-2">
          {links.map(link => (
            <Button
              key={link.to}
              variant={activeRoute === link.to ? "default" : "ghost"}
              size="lg"
              className={`flex items-center justify-start gap-3 rounded-md px-3 py-6 text-base transition-colors w-full ${
                activeRoute === link.to 
                  ? "bg-gradient-to-r from-indigo-600/90 to-violet-500/90 text-white" 
                  : "hover:bg-secondary/80"
              }`}
              asChild
              onClick={handleLinkClick}
            >
              <Link to={link.to}>
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </Button>
          ))}
          
          <Button 
            className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            onClick={handleNewOfferClick}
          >
            Log New Offer
          </Button>
        </div>
        
        <div className="border-t p-4 mt-auto flex items-center justify-between">
          <HelpButton />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
