
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface MealPlanQuantitiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantities: { 
    dinner: number; 
    lunch: number; 
    breakfast: number; 
    snacks: number;
    sides: number;
    desserts: number;
    drinks: number;
  }) => void;
}

export function MealPlanQuantitiesDialog({
  isOpen,
  onClose,
  onConfirm,
}: MealPlanQuantitiesDialogProps) {
  const [quantities, setQuantities] = useState({
    dinner: 5,
    lunch: 2,
    breakfast: 2,
    snacks: 2,
    sides: 2,
    desserts: 1,
    drinks: 1
  });

  const handleConfirm = () => {
    onConfirm(quantities);
    onClose();
  };

  const updateQuantity = (mealType: keyof typeof quantities, value: number[]) => {
    setQuantities(prev => ({
      ...prev,
      [mealType]: value[0]
    }));
  };

  const mealTypeLabels = {
    dinner: "Dinners",
    lunch: "Lunches", 
    breakfast: "Breakfasts",
    snacks: "Snacks",
    sides: "Sides",
    desserts: "Desserts",
    drinks: "Drinks"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Meal Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            How many meals would you like to generate for each meal type?
          </p>
          
          {Object.entries(quantities).map(([mealType, quantity]) => (
            <div key={mealType} className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor={mealType}>
                  {mealTypeLabels[mealType as keyof typeof mealTypeLabels]}
                </Label>
                <span className="text-sm font-medium">{quantity}</span>
              </div>
              <Slider
                id={mealType}
                min={0}
                max={10}
                step={1}
                value={[quantity]}
                onValueChange={(value) => updateQuantity(mealType as keyof typeof quantities, value)}
                className="w-full"
              />
            </div>
          ))}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Generate Meal Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
