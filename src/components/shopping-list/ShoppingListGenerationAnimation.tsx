import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ShoppingListGenerationAnimationProps {
  isGenerating: boolean;
  generationProgress: {
    step: number;
    totalSteps: number;
    currentAction: string;
  };
}

export default function ShoppingListGenerationAnimation({
  isGenerating,
  generationProgress
}: ShoppingListGenerationAnimationProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const targetProgressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // Calculate target progress based on actual step
  // Step 1: Getting ready (5%)
  // Step 2: Looking through meal plan (5-60% - main work)
  // Step 3: Organizing shopping list (60-95%)
  // Step 4: Almost done (95-100%)
  const getTargetProgress = (step: number, totalSteps: number): number => {
    if (step === 0) return 0;
    if (step >= totalSteps) return 100;
    
    // Map steps to progress ranges
    const stepProgress = [
      5,   // Step 1: Getting ready
      60,  // Step 2: Looking through meal plan (most work)
      95,  // Step 3: Organizing shopping list
      100  // Step 4: Almost done
    ];
    
    return stepProgress[step - 1] || 0;
  };

  useEffect(() => {
    if (!isGenerating) {
      setAnimatedProgress(0);
      targetProgressRef.current = 0;
      startTimeRef.current = null;
      return;
    }

    // Set start time when generation begins
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    // Update target progress based on current step
    const target = getTargetProgress(generationProgress.step, generationProgress.totalSteps);
    targetProgressRef.current = target;

    // Continuously increase progress while also moving towards target
    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        const target = targetProgressRef.current;
        
        // Always increment, but don't exceed target (unless we're at final step)
        const baseIncrement = 0.4 + Math.random() * 0.2; // 0.4-0.6% per update for continuous feel
        
        // If we're below target, move towards it
        if (prev < target) {
          const distance = target - prev;
          // Use larger increments when far from target, smaller when close
          const adaptiveIncrement = Math.max(distance * 0.1, baseIncrement);
          return Math.min(prev + adaptiveIncrement, target);
        }
        
        // If we're at target but not complete, continue slowly increasing
        if (generationProgress.step < generationProgress.totalSteps) {
          // Continue increasing slowly, but cap at target + small buffer
          return Math.min(prev + baseIncrement * 0.3, target + 2);
        }
        
        // Final step - zoom to 100%
        if (generationProgress.step === generationProgress.totalSteps) {
          if (prev >= 100) return 100;
          // Fast increment to reach 100%
          return Math.min(prev + 3, 100);
        }
        
        return prev;
      });
    }, 50); // Update every 50ms

    return () => clearInterval(interval);
  }, [isGenerating, generationProgress.step, generationProgress.totalSteps]);

  if (!isGenerating) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-6">
      {/* Subtle Shopping Cart Animation */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-sage-100/50 animate-pulse" />
        <div className="relative bg-white rounded-full p-6 shadow-lg border-2 border-sage-200">
          <ShoppingCart className="w-12 h-12 text-sage-600" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-sage-800 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-terracotta-500 animate-spin" style={{ animationDuration: '2s' }} />
          Generating Shopping List
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-2">
        <Progress 
          value={animatedProgress} 
          className="h-2 bg-sage-100 transition-all duration-300"
        />
        <div className="flex justify-between items-center text-xs text-sage-600">
          <span>Step {generationProgress.step} of {generationProgress.totalSteps}</span>
          <span className="font-medium">{Math.round(animatedProgress)}%</span>
        </div>
      </div>
    </div>
  );
}

