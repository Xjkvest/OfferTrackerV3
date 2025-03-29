
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedTransition({ children, className }: AnimatedTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ 
          type: "spring", 
          stiffness: 350, 
          damping: 30,
          mass: 0.8,
          velocity: 2
        }}
        className={className || 'w-full'}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
