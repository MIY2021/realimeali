
import { useState } from "react";
import { MealType } from "@/types";
import { DEFAULT_MEAL_QUANTITIES } from "@/hooks/useRandomMealSelection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface MealQuantityDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (quantities: Record<MealType, number>) => void;
}

export const MealQuantityDialog = ({
  open,
  onClose,
  onConfirm,
}: MealQuantityDialogProps) => {
  const [quantities, setQuantities] = useState<Record<MealType, number>>(DEFAULT_MEAL_QUANTITIES);

  const handleQuantityChange = (mealType: MealType, value: number[]) => {
    setQuantities(prev => ({
      ...prev,
      [mealType]: value[0]
    }));
  };

  const handleConfirm = () => {
    onConfirm(quantities);
  };

  const mealTypeLabels: Record<MealType, string> = {
    dinner: "Dinners",
    lunch: "Lunches", 
    breakfast: "Breakfasts",
    snacks: "Snacks"
  };

  const mealTypeOrder: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-navy">
            Customize Meal Plan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how many meals to generate for each category. You can generate up to 7 meals per category.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {mealTypeOrder.map((mealType) => (
            <div key={mealType} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${mealType}-slider`} className="text-sm font-medium capitalize">
                  {mealTypeLabels[mealType]}
                </Label>
                <span className="text-lg font-semibold text-terracotta bg-terracotta/10 px-3 py-1 rounded-full min-w-[3rem] text-center">
                  {quantities[mealType]}
                </span>
              </div>
              <Slider
                id={`${mealType}-slider`}
                min={0}
                max={7}
                step={1}
                value={[quantities[mealType]]}
                onValueChange={(value) => handleQuantityChange(mealType, value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>7</span>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-terracotta hover:bg-terracotta/90"
          >
            Generate Meal Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
