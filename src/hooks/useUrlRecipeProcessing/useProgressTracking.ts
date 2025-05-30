
import { useState } from "react";
import { FUNNY_LOADING_MESSAGES } from "./constants";

export const useProgressTracking = () => {
  const [importProgress, setImportProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  const startProgressAnimation = () => {
    setProgressValue(0);
    
    let messageIndex = 0;
    let currentProgress = 0;
    
    const progressInterval = setInterval(() => {
      // Update progress smoothly
      currentProgress = Math.min(currentProgress + Math.random() * 15 + 5, 85);
      setProgressValue(currentProgress);
      
      // Update funny messages
      if (messageIndex < FUNNY_LOADING_MESSAGES.length) {
        setImportProgress(FUNNY_LOADING_MESSAGES[messageIndex]);
        messageIndex++;
      }
    }, 800);
    
    return progressInterval;
  };

  const completeProgress = () => {
    setProgressValue(100);
    setImportProgress("✨ Recipe imported successfully!");
  };

  const resetProgress = () => {
    setTimeout(() => {
      setImportProgress("");
      setProgressValue(0);
    }, 2000);
  };

  return {
    importProgress,
    progressValue,
    startProgressAnimation,
    completeProgress,
    resetProgress,
  };
};
