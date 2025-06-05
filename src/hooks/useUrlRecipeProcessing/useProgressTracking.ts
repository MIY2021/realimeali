
import { useState } from "react";
import { FUNNY_LOADING_MESSAGES } from "./constants";

export const useProgressTracking = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [importProgress, setImportProgress] = useState("");
  const [progressValue, setProgressValue] = useState(0);

  const startProgressAnimation = () => {
    setProgressValue(0);
    setProgress(0);
    
    // Create a shuffled copy of messages for this session
    const shuffledMessages = [...FUNNY_LOADING_MESSAGES].sort(() => Math.random() - 0.5);
    let messageIndex = 0;
    let currentProgress = 0;
    
    const progressInterval = setInterval(() => {
      // Update progress smoothly
      currentProgress = Math.min(currentProgress + Math.random() * 15 + 5, 85);
      setProgressValue(currentProgress);
      setProgress(currentProgress);
      
      // Update funny messages in random order
      if (messageIndex < shuffledMessages.length) {
        setImportProgress(shuffledMessages[messageIndex]);
        setCurrentStep(shuffledMessages[messageIndex]);
        messageIndex++;
      }
    }, 800);
    
    return progressInterval;
  };

  const completeProgress = () => {
    setProgressValue(100);
    setProgress(100);
    setImportProgress("✨ Recipe imported successfully!");
    setCurrentStep("✨ Recipe imported successfully!");
  };

  const resetProgress = () => {
    setTimeout(() => {
      setImportProgress("");
      setProgressValue(0);
      setProgress(0);
      setCurrentStep("");
    }, 2000);
  };

  return {
    progress,
    currentStep,
    setProgress,
    setCurrentStep,
    importProgress,
    progressValue,
    startProgressAnimation,
    completeProgress,
    resetProgress,
  };
};
