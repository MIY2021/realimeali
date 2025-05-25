
import { useState } from "react";
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
import { Recipe, MealPlan } from "@/types";

interface LeftoverServingsDialogProps {
  open: boolean;
  onClose: () => void;
  mealPlan: MealPlan | null;
  recipe: Recipe | null;
  onConfirm: (servings: number) => void;
}

export function LeftoverServingsDialog({
  open,
  onClose,
  mealPlan,
  recipe,
  onConfirm,
}: LeftoverServingsDialogProps) {
  const [servings, setServings] = useState([1]);
  
  const maxServings = recipe ? recipe.servings - 1 : 1;

  const handleConfirm = () => {
    onConfirm(servings[0]);
    onClose();
  };

  if (!recipe || !mealPlan) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Lunch Leftovers</DialogTitle>
          <DialogDescription>
            How many servings of "{recipe.title}" would you like to save for lunch tomorrow?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Servings for lunch:</span>
              <span className="font-medium">{servings[0]}</span>
            </div>
            <Slider
              value={servings}
              onValueChange={setServings}
              max={maxServings}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              Original recipe serves {recipe.servings}. You can save up to {maxServings} servings for leftovers.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-terracotta hover:bg-terracotta/90">
            Create Leftovers
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
