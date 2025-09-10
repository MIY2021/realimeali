
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

interface MealQuantityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  mealType: MealType;
  recipeName: string;
  defaultQuantity?: number;
}

export function MealQuantityDialog({
  isOpen,
  onClose,
  onConfirm,
  mealType,
  recipeName,
  defaultQuantity = 1
}: MealQuantityDialogProps) {
  const [quantity, setQuantity] = useState(defaultQuantity);

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Add {recipeName} to {MEAL_TYPE_LABELS[mealType]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="quantity">How many servings would you like to add?</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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
