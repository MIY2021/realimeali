
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MealPlanQuantitiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantities: { dinner: number; lunch: number; breakfast: number; snacks: number }) => void;
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
    snacks: 2
  });

  const handleConfirm = () => {
    onConfirm(quantities);
    onClose();
  };

  const updateQuantity = (mealType: keyof typeof quantities, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [mealType]: Math.max(0, value)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Meal Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            How many meals would you like to generate for each meal type?
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dinner">Dinners</Label>
              <Input
                id="dinner"
                type="number"
                min="0"
                value={quantities.dinner}
                onChange={(e) => updateQuantity('dinner', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="lunch">Lunches</Label>
              <Input
                id="lunch"
                type="number"
                min="0"
                value={quantities.lunch}
                onChange={(e) => updateQuantity('lunch', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="breakfast">Breakfasts</Label>
              <Input
                id="breakfast"
                type="number"
                min="0"
                value={quantities.breakfast}
                onChange={(e) => updateQuantity('breakfast', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="snacks">Snacks</Label>
              <Input
                id="snacks"
                type="number"
                min="0"
                value={quantities.snacks}
                onChange={(e) => updateQuantity('snacks', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>

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
