
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Recipe, MealPlanMealType } from "@/types";
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
  const [selectedMealType, setSelectedMealType] = useState<MealPlanMealType>("dinner");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {recipe.title} to Meal Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Week</label>
            <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value) as 1 | 2)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Week 1</SelectItem>
                <SelectItem value="2">Week 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Meal Type</label>
            <Select value={selectedMealType} onValueChange={(value) => setSelectedMealType(value as MealPlanMealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
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
