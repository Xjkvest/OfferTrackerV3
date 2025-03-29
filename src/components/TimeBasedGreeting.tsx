
import React from "react";

interface TimeBasedGreetingProps {
  name: string;
  className?: string;
}

export function TimeBasedGreeting({ name, className = "" }: TimeBasedGreetingProps) {
  const [greeting, setGreeting] = React.useState("");
  
  React.useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      let greetingText = "";
      
      if (currentHour < 12) {
        greetingText = "Good morning";
      } else if (currentHour < 17) {
        greetingText = "Good afternoon";
      } else if (currentHour < 22) {
        greetingText = "Good evening";
      } else {
        greetingText = "Good night";
      }
      
      setGreeting(greetingText);
    };
    
    // Set initial greeting
    updateGreeting();
    
    // Update greeting if user has the app open during time change
    const interval = setInterval(updateGreeting, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={className}>
      <span className="font-medium">{greeting}, </span>
      <span className="font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">{name}</span>
    </div>
  );
}
