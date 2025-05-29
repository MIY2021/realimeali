
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealType } from "@/types";

interface MealQuantityDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (mealType: MealType, quantity: number) => void;
}

export function MealQuantityDialog({ open, onClose, onSubmit }: MealQuantityDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>("dinner");

  const handleSubmit = () => {
    onSubmit(mealType, quantity);
    onClose();
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Random Meal</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="mealType">Meal Type</Label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full border rounded-lg p-2"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
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
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Random Meals
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
