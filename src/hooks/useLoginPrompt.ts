
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function useLoginPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptTrigger, setPromptTrigger] = useState<"timer" | "feature-click">("timer");
  const { user, isLoading } = useAuth();

  // Check if we should show the prompt
  const shouldShowPrompt = () => {
    if (user || isLoading) return false;

    const dismissed = localStorage.getItem("loginPrompt_dismissed");
    if (dismissed === "never") return false;

    const lastDismissed = localStorage.getItem("loginPrompt_lastDismissed");
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed);
      const hoursSinceLastDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceLastDismiss < 24) return false; // Don't show again for 24 hours
    }

    return true;
  };

  // Show prompt after timer (homepage)
  useEffect(() => {
    if (!shouldShowPrompt()) return;

    const timer = setTimeout(() => {
      setPromptTrigger("timer");
      setShowPrompt(true);
    }, 4000); // Show after 4 seconds

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  // Function to trigger prompt on feature click
  const triggerPromptOnFeatureClick = () => {
    if (!shouldShowPrompt()) return false;
    
    setPromptTrigger("feature-click");
    setShowPrompt(true);
    return true; // Indicates prompt was shown
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt,
    promptTrigger,
    triggerPromptOnFeatureClick,
    closePrompt
  };
}
