import { useState } from "react";
import { Button } from "@/components/ui/button";
import { minus, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServingsSelectorProps {
  currentServings: number;
  onServingsChange: (newServings: number) => void;
  disabled?: boolean;
  minServings?: number;
  maxServings?: number;
}

export const ServingsSelector = ({
  currentServings,
  onServingsChange,
  disabled = false,
  minServings = 1,
  maxServings = 20
}: ServingsSelectorProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isMobile = useIsMobile();

  const handleDecrease = async () => {
    if (currentServings > minServings && !disabled && !isUpdating) {
      setIsUpdating(true);
      try {
        await onServingsChange(currentServings - 1);
      } catch (error) {
        console.error('Error decreasing servings:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleIncrease = async () => {
    if (currentServings < maxServings && !disabled && !isUpdating) {
      setIsUpdating(true);
      try {
        await onServingsChange(currentServings + 1);
      } catch (error) {
        console.error('Error increasing servings:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className={`flex items-center gap-1 ${isMobile ? 'scale-90' : ''}`}>
      <Button
        variant="outline"
        size={isMobile ? "sm" : "sm"}
        onClick={handleDecrease}
        disabled={disabled || isUpdating || currentServings <= minServings}
        className={`${isMobile ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} border-gray-300 hover:bg-gray-50`}
      >
        <minus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
      </Button>
      
      <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium min-w-[2rem] text-center ${isUpdating ? 'opacity-50' : ''}`}>
        {currentServings}
      </span>
      
      <Button
        variant="outline"
        size={isMobile ? "sm" : "sm"}
        onClick={handleIncrease}
        disabled={disabled || isUpdating || currentServings >= maxServings}
        className={`${isMobile ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} border-gray-300 hover:bg-gray-50`}
      >
        <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
      </Button>
    </div>
  );
};
