
import { Progress } from "@/components/ui/progress";

interface ShoppingListProgressProps {
  step: number;
  totalSteps: number;
  currentAction: string;
  isVisible: boolean;
}

export default function ShoppingListProgress({ 
  step, 
  totalSteps, 
  currentAction, 
  isVisible 
}: ShoppingListProgressProps) {
  if (!isVisible) return null;

  const progress = (step / totalSteps) * 100;

  return (
    <div className="space-y-2 mb-4 p-4 bg-accent/50 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Generating Shopping List</span>
        <span className="text-xs text-muted-foreground">{step}/{totalSteps}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">{currentAction}</p>
    </div>
  );
}
