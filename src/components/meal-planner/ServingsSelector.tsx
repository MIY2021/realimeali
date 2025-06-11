
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServingsSelectorProps {
  currentServings: number;
  onServingsChange: (newServings: number) => void;
  disabled?: boolean;
  size?: "sm" | "default";
}

export function ServingsSelector({
  currentServings,
  onServingsChange,
  disabled = false,
  size = "sm"
}: ServingsSelectorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleDecrease = async () => {
    if (currentServings <= 1 || disabled || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onServingsChange(currentServings - 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update servings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (currentServings >= 20 || disabled || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await onServingsChange(currentServings + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update servings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const buttonSize = size === "sm" ? "sm" : "default";
  const containerHeight = size === "sm" ? "h-8" : "h-10";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center gap-1 ${containerHeight}`}>
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleDecrease}
        disabled={currentServings <= 1 || disabled || isUpdating}
        className="h-full w-8 p-0 hover:bg-gray-100 transition-colors"
      >
        <span className="text-lg font-bold">−</span>
      </Button>
      
      <span className={`${textSize} font-medium text-center min-w-[2rem] px-1`}>
        {currentServings}
      </span>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={handleIncrease}
        disabled={currentServings >= 20 || disabled || isUpdating}
        className="h-full w-8 p-0 hover:bg-gray-100 transition-colors"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
