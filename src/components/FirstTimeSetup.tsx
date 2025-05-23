import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { 
  X, 
  Plus, 
  ChevronRight, 
  Eye, 
  Check, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  User,
  Target,
  Tags,
  List,
  Rocket,
  ArrowRight,
  MessageSquare,
  Tag,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Link,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface FirstTimeSetupProps {
  onComplete: () => void;
}

// Default values
const DEFAULT_CHANNELS = ['Chat', 'Email', 'Follow-up'];
const DEFAULT_OFFER_TYPES = ['Email Campaigns', 'Digital Products', 'Second Domain', 'Google Workspace', 'Website plan'];

export function FirstTimeSetup({ onComplete }: FirstTimeSetupProps) {
  const { setUserName, setDailyGoal, setChannels, setOfferTypes, setBaseOfferLink } = useUser();
  
  const [step, setStep] = useState(1);
  const [nameInput, setNameInput] = useState("");
  const [goalInput, setGoalInput] = useState(5);
  const [channelInput, setChannelInput] = useState("");
  const [offerTypeInput, setOfferTypeInput] = useState("");
  const [baseUrlInput, setBaseUrlInput] = useState("");
  const [baseUrlError, setBaseUrlError] = useState("");
  const [tempChannels, setTempChannels] = useState<string[]>(DEFAULT_CHANNELS);
  const [tempOfferTypes, setTempOfferTypes] = useState<string[]>(DEFAULT_OFFER_TYPES);
  
  const handleAddChannel = () => {
    if (channelInput.trim() && !tempChannels.includes(channelInput.trim())) {
      setTempChannels([...tempChannels, channelInput.trim()]);
      setChannelInput("");
    }
  };
  
  const handleRemoveChannel = (channel: string) => {
    setTempChannels(tempChannels.filter(c => c !== channel));
  };
  
  const handleAddOfferType = () => {
    if (offerTypeInput.trim() && !tempOfferTypes.includes(offerTypeInput.trim())) {
      setTempOfferTypes([...tempOfferTypes, offerTypeInput.trim()]);
      setOfferTypeInput("");
    }
  };
  
  const handleRemoveOfferType = (type: string) => {
    setTempOfferTypes(tempOfferTypes.filter(t => t !== type));
  };
  
  // Validate base URL input
  React.useEffect(() => {
    if (!baseUrlInput) {
      setBaseUrlError("");
      return;
    }
    
    if (!baseUrlInput.startsWith('http')) {
      setBaseUrlError("URL must start with http:// or https://");
      return;
    }
    
    if (!baseUrlInput.endsWith('/')) {
      setBaseUrlError("URL must end with a /");
      return;
    }
    
    setBaseUrlError("");
  }, [baseUrlInput]);
  
  const handleNext = () => {
    if (step === 1 && !nameInput.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (step === 5 && baseUrlInput && baseUrlError) {
      toast({
        title: "Invalid URL Format",
        description: baseUrlError,
        variant: "destructive",
      });
      return;
    }
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleComplete = () => {
    // Extract first name from full name
    const firstName = nameInput.trim().split(' ')[0];
    
    setUserName(firstName);
    setDailyGoal(goalInput);
    setChannels(tempChannels);
    setOfferTypes(tempOfferTypes);
    
    // Set base URL if provided and valid
    if (baseUrlInput && !baseUrlError) {
      setBaseOfferLink(baseUrlInput.trim());
    }
    
    onComplete();
  };

  // Get page title and description based on current step
  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: "Welcome to Offer Tracker",
          description: "Let's personalize your experience to help you close more deals.",
          icon: <Rocket className="h-12 w-12 text-primary" />,
          benefit: "Personalized tracking starts with your name"
        };
      case 2:
        return {
          title: "Set Your Daily Goal",
          description: "Challenge yourself with a realistic daily target.",
          icon: <Target className="h-12 w-12 text-primary" />,
          benefit: "Consistent goals lead to consistent results"
        };
      case 3:
        return {
          title: "Communication Channels",
          description: "How do you connect with your customers?",
          icon: <MessageSquare className="h-12 w-12 text-primary" />,
          benefit: "Track which channels perform best for you"
        };
      case 4:
        return {
          title: "Offer Types",
          description: "What types of offers do you make to customers?",
          icon: <Tag className="h-12 w-12 text-primary" />,
          benefit: "Identify which offers convert best"
        };
      case 5:
        return {
          title: "Case Link Settings",
          description: "Set up links to your external case management system.",
          icon: <Link className="h-12 w-12 text-primary" />,
          benefit: "Quick access to your external case records"
        };
      default:
        return {
          title: "Welcome",
          description: "Let's get started.",
          icon: <Rocket className="h-12 w-12 text-primary" />,
          benefit: "Personalized tracking starts with your name"
        };
    }
  };

  const stepContent = getStepContent();

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 }
  };

  // Progress steps data
  const steps = [
    { name: "Profile", icon: <User className="h-4 w-4" /> },
    { name: "Goals", icon: <Target className="h-4 w-4" /> },
    { name: "Channels", icon: <MessageSquare className="h-4 w-4" /> },
    { name: "Offers", icon: <Tag className="h-4 w-4" /> },
    { name: "Links", icon: <Link className="h-4 w-4" /> }
  ];

  return (
    <div className="flex flex-col space-y-4 max-h-[80vh] overflow-hidden">
      {/* Header with animated background */}
      <div className="relative mx-0 pt-6 pb-5 overflow-hidden bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-background rounded-lg border-b border-border/40">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"
        />
        
        {/* Progress Indicator */}
        <div className="relative z-10 mb-5 px-2">
          <div className="flex items-center justify-between w-full max-w-md mx-auto">
            {steps.map((stepItem, i) => (
              <div key={i} data-lov-id={`step-${i}`}>
                <div className="flex flex-col items-center">
                  <motion.div 
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 
                      ${step > i + 1 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : step === i + 1
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted bg-background text-muted-foreground'
                      } z-10`}
                    initial={false}
                    animate={step === i + 1 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {step > i + 1 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      stepItem.icon
                    )}
                  </motion.div>
                  <span className={`text-xs mt-1 font-medium ${step === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {stepItem.name}
                  </span>
                </div>
                {i < 4 && (
                  <div className="relative flex-1 h-0.5 bg-muted">
                    <motion.div 
                      className="absolute inset-0 bg-primary h-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: step > i + 1 ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Header Content */}
        <motion.div 
          key={`header-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 text-center px-2"
        >
          <motion.div 
            className="flex justify-center mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
          >
            {stepContent.icon}
          </motion.div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">{stepContent.title}</h2>
          <p className="text-muted-foreground mt-1 text-xs">{stepContent.description}</p>
        </motion.div>
      </div>

      {/* Benefit Tag */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center mx-auto mt-2 px-3 py-1 bg-purple-500/10 rounded-full z-10 relative"
      >
        <TrendingUp className="h-3.5 w-3.5 text-purple-500 mr-1.5" />
        <span className="text-xs font-medium text-purple-500">{stepContent.benefit}</span>
      </motion.div>

      {/* Step Content */}
      <div className="px-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className="flex-1 overflow-y-auto pb-2 max-w-full overflow-x-hidden"
            style={{ maxHeight: "270px" }}
          >
            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-base">Your Name</Label>
                  <div className="pt-1 pb-2">
                    <Input
                      id="name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full focus:z-10"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be used for your personalized greeting each day.
                  </p>
                </div>

                <div className="mt-4 p-3 bg-muted/40 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-2">
                      <Eye className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Preview</h3>
                      <p className="text-xs text-muted-foreground">Here's how your greeting will appear</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 p-2 bg-background rounded-md">
                    <p className="text-sm">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">{nameInput.trim().split(' ')[0] || 'Your Name'}</span></p>
                  </div>
                  
                  {nameInput.includes(' ') && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic">Note: Only your first name will be used in the app.</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <Label htmlFor="goal" className="text-base">Daily Offer Goal</Label>
                    <span className="text-xl font-bold text-primary">{goalInput}</span>
                  </div>
                  <Slider
                    id="goal"
                    defaultValue={[goalInput]}
                    min={1}
                    max={15}
                    step={1}
                    onValueChange={(value) => setGoalInput(value[0])}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This helps track your progress and maintain consistency.
                  </p>
                </div>

                <Card className="mt-4 overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-purple-500/10 to-primary/5">
                    <h3 className="font-semibold text-sm">What this means:</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mr-2">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs"><strong>{goalInput} offers per day</strong> = {goalInput * 5} offers per work week</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mr-2">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs"><strong>{goalInput} offers per day</strong> = ~{goalInput * 22} offers per month</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-1">You can always adjust this in settings later.</p>
                  </div>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="channel" className="text-base">Communication Channels</Label>
                  <div className="flex pt-1 pb-2">
                    <Input
                      id="channel"
                      value={channelInput}
                      onChange={(e) => setChannelInput(e.target.value)}
                      placeholder="Add a channel (e.g., Email, Phone)"
                      className="flex-1 focus:z-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && channelInput.trim()) {
                          handleAddChannel();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAddChannel} 
                      className="ml-2"
                      type="button"
                      size="sm"
                      disabled={!channelInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    These are the ways you communicate with your customers.
                  </p>
                </div>

                <div className="mt-1">
                  <div className="flex flex-wrap gap-1.5 mt-1 max-w-full">
                    {tempChannels.map((channel) => (
                      <Badge key={channel} variant="secondary" className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                        {channel}
                        <button
                          onClick={() => handleRemoveChannel(channel)}
                          className="ml-1.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-2 bg-muted/40 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <Eye className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Popular Channels</h3>
                      <p className="text-xs text-muted-foreground mb-1">Click to add any of these common channels</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {['Email', 'Chat', 'Phone', 'In-Person', 'Video Call', 'SMS', 'Social Media'].map((channel) => (
                          !tempChannels.includes(channel) && (
                            <Badge 
                              key={channel} 
                              variant="outline" 
                              className="px-1.5 py-0.5 text-xs cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30"
                              onClick={() => {
                                setTempChannels([...tempChannels, channel]);
                              }}
                            >
                              + {channel}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="offerType" className="text-base">Offer Types</Label>
                  <div className="flex pt-1 pb-2">
                    <Input
                      id="offerType"
                      value={offerTypeInput}
                      onChange={(e) => setOfferTypeInput(e.target.value)}
                      placeholder="Add offer type (e.g., Subscription)"
                      className="flex-1 focus:z-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && offerTypeInput.trim()) {
                          handleAddOfferType();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleAddOfferType} 
                      className="ml-2"
                      type="button"
                      size="sm"
                      disabled={!offerTypeInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    These are the types of offers you make to customers.
                  </p>
                </div>

                <div className="mt-1">
                  <div className="flex flex-wrap gap-1.5 mt-1 max-w-full">
                    {tempOfferTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                        {type}
                        <button
                          onClick={() => handleRemoveOfferType(type)}
                          className="ml-1.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-3 p-2 bg-muted/40 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mr-2 mt-0.5">
                      <Eye className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Popular Offer Types</h3>
                      <p className="text-xs text-muted-foreground mb-1">Click to add any of these common offer types</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {['Subscription', 'One-time Purchase', 'Upgrade', 'Cross-sell', 'Renewal', 'Support Plan', 'Free Trial', 'Consultation'].map((type) => (
                          !tempOfferTypes.includes(type) && (
                            <Badge 
                              key={type} 
                              variant="outline" 
                              className="px-1.5 py-0.5 text-xs cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              onClick={() => {
                                setTempOfferTypes([...tempOfferTypes, type]);
                              }}
                            >
                              + {type}
                            </Badge>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3 max-w-full overflow-hidden">
                <div className="max-w-full overflow-hidden">
                  <Label htmlFor="baseUrl" className="text-base">Case Link Base URL (Optional)</Label>
                  <div className="pt-1 pb-2">
                    <div className="relative">
                      <Input
                        id="baseUrl"
                        value={baseUrlInput}
                        onChange={(e) => setBaseUrlInput(e.target.value)}
                        placeholder="https://support.example.com/cases/"
                        className={`w-full focus:z-10 ${baseUrlError ? "border-red-500" : ""} pr-9`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                    {baseUrlError && (
                      <div className="text-xs text-red-500 flex items-center mt-1">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {baseUrlError}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When set, case numbers will render as clickable links to your external case management system.
                  </p>
                </div>

                <div className="mt-4 p-3 bg-muted/40 rounded-lg max-w-full overflow-hidden">
                  <div className="flex items-center min-w-0">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center mr-2 flex-shrink-0">
                      <Eye className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm">Preview</h3>
                      <p className="text-xs text-muted-foreground">Here's how case links will appear</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 p-2 bg-background rounded-md w-full overflow-hidden">
                    {baseUrlInput && !baseUrlError ? (
                      <div className="text-sm space-y-2 w-full">
                        <div className="w-full">
                          <span>Case </span>
                          <a 
                            href="#" 
                            onClick={(e) => e.preventDefault()}
                            className="text-blue-500 hover:underline inline-flex items-center"
                          >
                            #12345
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                          <span> will link to:</span>
                        </div>
                        <div className="w-full">
                          <div className="font-mono text-xs bg-muted px-2 py-1.5 rounded border w-full">
                            <div className="break-all text-xs" title={`${baseUrlInput}12345`}>
                              {baseUrlInput}12345
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Case #12345 (not linked to external system)
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1.5 italic">
                    You can always update this later in Settings.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-3 border-t mt-auto mx-0 px-2">
        <Button
          variant={step === 1 ? "outline" : "destructive"}
          onClick={handleBack}
          disabled={step === 1}
          type="button"
          className="px-4"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          type="button"
          className="min-w-[100px] bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {step < 5 ? (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </>
          ) : (
            <>
              Get Started
              <Rocket className="h-4 w-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
