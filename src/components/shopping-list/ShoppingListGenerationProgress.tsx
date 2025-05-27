
import { useEffect } from "react";
import ShoppingListProgress from "./ShoppingListProgress";

interface ShoppingListGenerationProgressProps {
  isGenerating: boolean;
  generationProgress: {
    step: number;
    totalSteps: number;
    currentAction: string;
  };
}

export default function ShoppingListGenerationProgress({
  isGenerating,
  generationProgress
}: ShoppingListGenerationProgressProps) {
  return (
    <ShoppingListProgress
      step={generationProgress.step}
      totalSteps={generationProgress.totalSteps}
      currentAction={generationProgress.currentAction}
      isVisible={isGenerating}
    />
  );
}
