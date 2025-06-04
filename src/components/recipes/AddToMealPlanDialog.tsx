
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Recipe, MealType } from "@/types";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

interface AddToMealPlanDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToMealPlanDialog({ recipe, open, onOpenChange }: AddToMealPlanDialogProps) {
  const [selectedWeek, setSelectedWeek] = useState<1 | 2>(1);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("dinner");
  const [isLoading, setIsLoading] = useState(false);

  const { addMealPlan } = useMealPlan();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  const handleAddToMealPlan = async () => {
    if (!recipe || !user || !currentHousehold) return;

    setIsLoading(true);
    try {
      // Use current date as default
      const currentDate = new Date().toISOString().split('T')[0];
      
      await addMealPlan({
        date: currentDate,
        meal_type: selectedMealType,
        recipe_id: recipe.id,
        created_by: user.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_number: selectedWeek,
        original_servings: recipe.servings,
      }, selectedWeek);

      toast({
        title: "Added to Meal Plan",
        description: `${recipe.title} has been added to Week ${selectedWeek}.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error adding to meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to add recipe to meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!recipe) return null;

  const mealTypes: { value: MealType; label: string }[] = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snacks", label: "Snacks" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {recipe.title} to Meal Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Select Week</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedWeek === 1 ? "default" : "outline"}
                onClick={() => setSelectedWeek(1)}
                className="h-12"
              >
                Week 1
              </Button>
              <Button
                variant={selectedWeek === 2 ? "default" : "outline"}
                onClick={() => setSelectedWeek(2)}
                className="h-12"
              >
                Week 2
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Meal Type</label>
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map((mealType) => (
                <Button
                  key={mealType.value}
                  variant={selectedMealType === mealType.value ? "default" : "outline"}
                  onClick={() => setSelectedMealType(mealType.value)}
                  className="h-12"
                >
                  {mealType.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToMealPlan} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add to Meal Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
