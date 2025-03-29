
import React from "react";
import { useUser } from "@/context/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export function GoalSettings() {
  const { dailyGoal, setDailyGoal } = useUser();
  const [tempGoal, setTempGoal] = React.useState(dailyGoal);
  
  const handleSave = () => {
    if (tempGoal < 1) {
      toast({
        title: "Invalid goal",
        description: "Daily goal must be at least 1",
        variant: "destructive",
      });
      setTempGoal(1);
      return;
    }
    
    setDailyGoal(tempGoal);
    toast({
      title: "Goal updated",
      description: `Your daily goal is now set to ${tempGoal} offers`,
    });
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Daily Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="dailyGoal">Offers per day</Label>
              <span className="text-sm font-medium">{tempGoal}</span>
            </div>
            
            <div className="flex space-x-4 items-center">
              <motion.div 
                whileTap={{ scale: 0.97 }}
                className="flex-1"
              >
                <Slider 
                  id="dailyGoal"
                  value={[tempGoal]} 
                  onValueChange={(values) => setTempGoal(values[0])}
                  min={1} 
                  max={20} 
                  step={1}
                  className="my-2"
                />
              </motion.div>
              
              <Input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                className="w-16 text-center"
                min={1}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={tempGoal === dailyGoal}
              >
                Save
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
