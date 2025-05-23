import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOffers } from "@/context/OfferContext";
import { useUser } from "@/context/UserContext";
import { TimeBasedGreeting } from "./TimeBasedGreeting";

// Message categories with improved messaging
const messages = {
  timeBasedGreetings: {
    morning: [
      "Ready to make some magic today?",
      "Fresh day, fresh opportunities!",
      "Morning momentum leads to afternoon wins!"
    ],
    afternoon: [
      "Let's keep rolling!",
      "Afternoon momentum builds success!",
      "Still plenty of time to crush your goals!"
    ],
    evening: [
      "The day's not over — one more offer?",
      "Evening hustle pays off!",
      "Finish strong today!"
    ],
    night: [
      "Burning the midnight oil? You've got this.",
      "Late night productivity is still productivity!",
      "Night owls get offers too!"
    ]
  },
  progressNudges: {
    none: [
      "Let's get started – one offer at a time!",
      "Your goal is waiting. Take the first step.",
      "First offer is always the hardest - let's do this!"
    ],
    low: [
      "You're getting warm — keep going!",
      "Every offer counts. You're on the board!",
      "Momentum beats perfection. Keep going!"
    ],
    medium: [
      "You're almost there!",
      "Final push! You've got this!",
      "Crushing it – nearly done."
    ],
    complete: [
      "Amazing! You hit your goal!",
      "Bonus round unlocked! Keep the streak alive.",
      "Champion mode activated. Well done!"
    ],
    overflow: [
      "Bonus territory! You're on fire 🔥",
      "Overachiever status unlocked!",
      "Going above and beyond! Impressive!"
    ],
    recovery: [
      "New day, fresh start. Let's bounce back.",
      "Today's a clean slate. Let's make it count!",
      "Yesterday's history, today's opportunity!"
    ]
  },
  streakEncouragements: {
    starting: [
      "That's two in a row — keep the flow!",
      "Two-day streak! Momentum is building!",
      "Second day in a row! Consistency begins!"
    ],
    building: [
      "Streak unlocked! You're building something big.",
      "Three days strong! Habits forming!",
      "Three consecutive days! You're on a roll!"
    ],
    advancing: [
      "🔥 Five days strong. Let's make it six.",
      "Day five! Your consistency is impressive!",
      "Five-day streak! You're becoming unstoppable!"
    ],
    milestone: [
      "One whole week — consistency is your superpower.",
      "Seven days! That's a full week of wins!",
      "Week-long streak achieved! Now that's dedication!"
    ],
    impressive: [
      "This isn't luck. This is habit. 🚀",
      "10+ days! You've made this a true habit!",
      "Double-digit streak! Elite performer status!"
    ]
  },
  conversions: {
    first: [
      "💡 First conversion logged! Let's get another.",
      "First conversion on the board! More to come!",
      "You've secured your first conversion! Build on this!"
    ],
    growing: [
      "That's 5 wins — your offers are working!",
      "Five conversions! Your approach is working!",
      "Five successful conversions! Pattern of success!"
    ],
    established: [
      "You're turning offers into outcomes. Legend.",
      "10+ conversions! Master of the follow-through!",
      "Double-digit conversions! Results machine!"
    ]
  },
  tips: [
    "Tip: Logging offers early helps build streaks.",
    "Tip: Follow-ups increase your conversion rate.",
    "Tip: Track patterns in which channels convert best.",
    "Tip: Consistent offers lead to consistent results.",
    "Tip: Your streak builds momentum for tomorrow."
  ],
  general: [
    "You're doing great, even if it doesn't feel like it.",
    "Keep showing up. Progress adds up.",
    "Every offer is a seed. Keep planting.",
    "Small wins, big growth. Let's go.",
    "Consistency beats intensity. You're on the right path."
  ]
};

export function MotivationalMessage() {
  const { todaysOffers, offers, streak = 0 } = useOffers();
  const { dailyGoal, userName, settings } = useUser();
  const [message, setMessage] = useState("");
  const [tip, setTip] = useState("");
  const [key, setKey] = useState(0);

  // Return null if motivational messages are disabled
  if (!settings.showMotivationalMessages) {
    return null;
  }
  
  // Get the message category based on current status
  const getMessageCategory = () => {
    // Check for first conversion milestone
    const conversions = offers.filter(o => o.converted).length;
    if (conversions === 1) return "conversion-first";
    if (conversions === 5) return "conversion-growing";
    if (conversions >= 10) return "conversion-established";
    
    // Check streak milestones (prioritize new streaks)
    if (streak === 2) return "streak-starting";
    if (streak === 3) return "streak-building";
    if (streak === 5) return "streak-advancing";
    if (streak === 7) return "streak-milestone";
    if (streak >= 10) return "streak-impressive";
    
    // Check progress 
    const progress = (todaysOffers.length / dailyGoal) * 100;
    
    // First check for goal completion (high priority message)
    if (progress === 100) return "progress-complete";
    if (progress > 100) return "progress-overflow";
    
    // If not complete, fallback to progress-based or time-based
    if (progress === 0) return "progress-none";
    if (progress < 50) return "progress-low";
    if (progress >= 50 && progress < 100) return "progress-medium";
    
    // If nothing special is happening, use time of day
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "time-morning";
    if (currentHour < 17) return "time-afternoon";
    if (currentHour < 22) return "time-evening";
    return "time-night";
  };
  
  // Get a random message from appropriate category
  const getRandomMessage = (category: string) => {
    let messagePool: string[] = [];
    
    // Select the appropriate message pool based on category
    if (category.startsWith("time-")) {
      const timeOfDay = category.split("-")[1];
      messagePool = messages.timeBasedGreetings[timeOfDay as keyof typeof messages.timeBasedGreetings];
    } 
    else if (category.startsWith("progress-")) {
      const progressLevel = category.split("-")[1];
      messagePool = messages.progressNudges[progressLevel as keyof typeof messages.progressNudges];
    }
    else if (category.startsWith("streak-")) {
      const streakLevel = category.split("-")[1];
      messagePool = messages.streakEncouragements[streakLevel as keyof typeof messages.streakEncouragements];
    }
    else if (category.startsWith("conversion-")) {
      const conversionLevel = category.split("-")[1];
      messagePool = messages.conversions[conversionLevel as keyof typeof messages.conversions];
    }
    else {
      // Fallback to general messages
      messagePool = messages.general;
    }
    
    // Pick a random message from the pool
    const randomIndex = Math.floor(Math.random() * messagePool.length);
    return messagePool[randomIndex] || "Keep up the great work!";
  };
  
  const getRandomTip = () => {
    // 70% chance of showing a tip, unless user is close to goal
    const progress = (todaysOffers.length / dailyGoal) * 100;
    
    // If user is one away from completing goal, show specific tip
    if (todaysOffers.length === dailyGoal - 1) {
      return "You're 1 away from a perfect day!";
    }
    
    // If user has no offers, always show a tip
    if (todaysOffers.length === 0) {
      return messages.tips[Math.floor(Math.random() * messages.tips.length)];
    }
    
    // Otherwise random chance of tip
    if (Math.random() < 0.7) {
      return messages.tips[Math.floor(Math.random() * messages.tips.length)];
    }
    
    return "";
  };
  
  useEffect(() => {
    // Determine message category based on current state
    const category = getMessageCategory();
    
    // Get random message from that category
    const selectedMessage = getRandomMessage(category);
    const selectedTip = getRandomTip();
    
    // Set the message and increment key to trigger animation
    setMessage(selectedMessage);
    setTip(selectedTip);
    setKey(prev => prev + 1);
    
  }, [todaysOffers.length, dailyGoal, streak, offers.length]);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-lg md:text-xl font-medium text-center py-3 px-4 bg-gradient-to-r from-background/50 to-background/30 rounded-md"
        >
          {message}
          
          {/* Show streak celebration if applicable */}
          {streak >= 3 && (
            <div className="text-sm text-amber-500 dark:text-amber-400 font-medium mt-1">
              🔥 You're on a {streak}-day streak! Keep it going!
            </div>
          )}
          
          {/* Show tip if we have one */}
          {tip && (
            <div className="text-sm text-muted-foreground mt-2 font-normal">
              {tip}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
