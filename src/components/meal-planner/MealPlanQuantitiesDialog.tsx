
import { useState, useEffect } from "react";
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
  availableRecipes?: number;
  onChooseMeals?: () => void;
}

export function MealPlanQuantitiesDialog({
  isOpen,
  onClose,
  onConfirm,
  availableRecipes = 0,
  onChooseMeals,
}: MealPlanQuantitiesDialogProps) {
  const [quantities, setQuantities] = useState({
    dinner: 5,
    lunch: 2,
    breakfast: 2,
    snacks: 2,
    sides: 0,
    desserts: 0,
    drinks: 0
  });

  useEffect(() => {
    console.log("🎛️ MealPlanQuantitiesDialog isOpen state changed:", isOpen);
  }, [isOpen]);

  const handleConfirm = () => {
    console.log("✅ MealPlanQuantitiesDialog handleConfirm called with quantities:", quantities);
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

  console.log("🎛️ MealPlanQuantitiesDialog rendering with isOpen:", isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate your meal plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Let RealiMeali choose for you, or pick your own favourites.</p>
            <p className="text-xs">
              Available recipes: <span className="font-medium text-foreground">{availableRecipes}</span>
            </p>
          </div>
          
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

          <div className="border-t border-gray-100 pt-4 mt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onChooseMeals}
              disabled={!onChooseMeals || availableRecipes === 0}
            >
              ♥ Choose meals yourself
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Swipe through your recipes and choose the ones you fancy.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={availableRecipes === 0}
            >
              Generate Meal Plan
            </Button>
          </div>
          
          {availableRecipes === 0 && (
            <p className="text-xs text-destructive text-center">
              No recipes available. Please add some recipes first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
