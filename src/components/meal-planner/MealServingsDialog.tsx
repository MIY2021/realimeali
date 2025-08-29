
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealType } from "@/types";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch", 
  dinner: "Dinner",
  snacks: "Snacks",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks",
  appetizers: "Appetizers / Starters"
};

const DEFAULT_SERVINGS: Record<MealType, number> = {
  breakfast: 2,
  lunch: 2,
  dinner: 4,
  snacks: 2,
  sides: 4,
  desserts: 4,
  drinks: 4,
  appetizers: 2
};

interface MealServingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mealType: MealType, servings: number) => void;
  mealType: MealType;
}

export function MealServingsDialog({
  isOpen,
  onClose,
  onConfirm,
  mealType,
}: MealServingsDialogProps) {
  const [servings, setServings] = useState(DEFAULT_SERVINGS[mealType]);

  const handleConfirm = () => {
    onConfirm(mealType, servings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {MEAL_TYPE_LABELS[mealType]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="servings">How many servings would you like to add?</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Add to Meal Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
