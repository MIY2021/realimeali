
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { Check } from "lucide-react";

interface AddToMealPlanDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Use meal plan meal types (limited subset)
type MealPlanMealType = "breakfast" | "lunch" | "dinner" | "snacks";

export function AddToMealPlanDialog({ recipe, open, onOpenChange }: AddToMealPlanDialogProps) {
  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedDetails, setAddedDetails] = useState<{ mealType: string; week: number } | null>(null);
  const { addMealPlan } = useMealPlan();
  const { user } = useAuth();
  const { toast } = useToast();

  const mealTypes: MealPlanMealType[] = ["breakfast", "lunch", "dinner", "snacks"];

  const handleSelectMealType = async (mealType: MealPlanMealType) => {
    if (!selectedWeek) {
      toast({
        title: "Select Week",
        description: "Please select which week to add this meal to.",
        variant: "destructive"
      });
      return;
    }

    if (!recipe || !user) {
      toast({
        title: "Error",
        description: "Please log in to add recipes to your meal plan.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Adding recipe to meal plan:", {
        recipe: recipe.title,
        mealType,
        week: selectedWeek
      });

      await addMealPlan({
        date: new Date().toISOString().split('T')[0],
        mealType,
        recipeId: recipe.id,
        createdBy: user.id,
        slotIndex: 0,
        isLeftover: false,
        householdId: recipe.householdId,
        weekNumber: selectedWeek,
      }, selectedWeek);

      // Show confirmation
      setAddedDetails({ mealType, week: selectedWeek });
      setShowConfirmation(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error("Error adding recipe to meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to add recipe to meal plan. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedWeek(null);
    setIsSubmitting(false);
    setShowConfirmation(false);
    setAddedDetails(null);
    onOpenChange(false);
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {showConfirmation ? "Added to Meal Plan!" : "Add to Meal Plan"}
          </DialogTitle>
        </DialogHeader>

        {showConfirmation && addedDetails ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-base">{recipe.title}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Added to {addedDetails.mealType.charAt(0).toUpperCase() + addedDetails.mealType.slice(1)} • Week {addedDetails.week}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="text-base font-semibold mb-1">{recipe.title}</div>
              <div className="text-sm text-muted-foreground">{recipe.description}</div>
            </div>

            <div className="flex flex-col gap-3 mb-3">
              <label className="font-semibold text-sm">Select Week</label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((wk) => (
                  <Button
                    key={wk}
                    variant={selectedWeek === wk ? "default" : "outline"}
                    className={selectedWeek === wk ? "bg-terracotta text-white" : ""}
                    onClick={() => setSelectedWeek(wk as 1 | 2)}
                    disabled={isSubmitting}
                  >
                    Week {wk}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mealTypes.map(type => (
                <Button 
                  key={type} 
                  onClick={() => handleSelectMealType(type)}
                  className="capitalize"
                  variant="outline"
                  disabled={isSubmitting}
                >
                  {type}
                </Button>
              ))}
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="col-span-2"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
