
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealType } from "@/types";

interface MealQuantityDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (mealType: MealType, quantity: number) => void;
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch", 
  dinner: "Dinner",
  snacks: "Snacks",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks",
  sauces_dips: "Sauces & Dips",
  soups_stews: "Soups & Stews",
  salads: "Salads",
  baking_breads: "Baking & Breads"
};

export function MealQuantityDialog({ open, onClose, onSubmit }: MealQuantityDialogProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>("dinner");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = () => {
    onSubmit(selectedMealType, quantity);
    onClose();
    setQuantity(1);
    setSelectedMealType("dinner");
  };

  // Most common meal types for meal planning
  const commonMealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Meal Slot</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="mealType">Meal Type</Label>
            <select
              id="mealType"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value as MealType)}
              className="w-full mt-1 p-2 border rounded-md"
            >
              {commonMealTypes.map((type) => (
                <option key={type} value={type}>
                  {mealTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="quantity">Number of Meals</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Meals
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
