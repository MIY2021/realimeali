
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
  isNewLunchMeal?: boolean;
  onCreateLeftover?: (mealPlan: MealPlan, recipe?: Recipe, leftoverServings?: number) => void;
}

export function LeftoverServingsDialog({
  open,
  onClose,
  mealPlan,
  recipe,
  onConfirm,
  isNewLunchMeal = false,
  onCreateLeftover,
}: LeftoverServingsDialogProps) {
  const [servings, setServings] = useState([2]); // Default to 2 servings
  
  console.log("🍽️ LeftoverServingsDialog render:", {
    open,
    isNewLunchMeal,
    hasRecipe: !!recipe,
    hasMealPlan: !!mealPlan,
    servings: servings[0]
  });
  
  const maxServings = recipe ? recipe.servings - 1 : (mealPlan?.planned_servings ? mealPlan.planned_servings - 1 : 7); // Default max based on meal plan or 8 total

  const handleConfirm = () => {
    console.log("✅ LeftoverServingsDialog confirm:", {
      isNewLunchMeal,
      servings: servings[0],
      hasOnCreateLeftover: !!onCreateLeftover
    });
    
    if (isNewLunchMeal) {
      // For new lunch meals, just pass the servings count
      onConfirm(servings[0]);
    } else if (mealPlan && onCreateLeftover) {
      // For creating leftovers from existing meals, create the leftover and update portions
      onCreateLeftover(mealPlan, recipe, servings[0]);
    }
    onClose();
  };

  // Fix the conditional rendering - allow rendering for new lunch meals OR when we have mealPlan for leftovers (recipe is optional for custom meals)
  if (!isNewLunchMeal && !mealPlan) {
    console.log("❌ LeftoverServingsDialog not rendering - missing required props");
    return null;
  }

  const title = isNewLunchMeal ? "Add Lunch Meal" : "Create Lunch Leftovers";
  const mealName = recipe?.title || mealPlan?.meal_name || 'Custom Meal';
  const description = isNewLunchMeal 
    ? "How many portions would you like for lunch?"
    : `How many servings of "${mealName}" would you like to save for lunch tomorrow?`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
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
            {!isNewLunchMeal && (recipe || mealPlan) && (
              <div className="text-xs text-muted-foreground">
                {recipe ? (
                  <>
                    Original recipe serves {recipe.servings}. You can save up to {maxServings} servings for leftovers.
                  </>
                ) : (
                  <>
                    Original meal serves {mealPlan?.planned_servings || 1}. You can save up to {maxServings} servings for leftovers.
                  </>
                )}
                <br />
                This will reduce the dinner portion count by {servings[0]} servings.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-terracotta hover:bg-terracotta/90">
            {isNewLunchMeal ? "Continue" : "Create Leftovers"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
