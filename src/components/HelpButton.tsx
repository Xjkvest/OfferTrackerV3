import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface HelpButtonProps {
  className?: string;
}

// Export as both named export and default export
export const HelpButton: React.FC<HelpButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  
  const handleOpenHelp = () => {
    navigate("/help");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleOpenHelp}
      aria-label="Open help"
      className={`hover:bg-blue-500/10 hover:text-blue-500 ${className || ""}`}
    >
      <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
};

// Also export as default for consistency
export default HelpButton;
