
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus } from "lucide-react";
import { Recipe, MealType } from "@/types";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";

interface AddToMealPlanDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToMealPlanDialog({ recipe, open, onOpenChange }: AddToMealPlanDialogProps) {
  const [selectedWeek, setSelectedWeek] = useState<1 | 2>(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("dinner");
  const { addMealPlan } = useMealPlan();
  const { toast } = useToast();

  const handleAddToMealPlan = async () => {
    if (!recipe || !selectedDate) return;

    try {
      await addMealPlan({
        date: selectedDate,
        mealType: selectedMealType,
        recipeId: recipe.id,
        slotIndex: 0,
        isLeftover: false,
        originalServings: recipe.servings,
        householdId: recipe.householdId,
        createdBy: recipe.createdBy,
        weekNumber: selectedWeek
      }, selectedWeek);

      toast({
        title: "Recipe Added",
        description: `${recipe.title} has been added to your meal plan.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add recipe to meal plan.",
        variant: "destructive",
      });
    }
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Meal Plan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{recipe.title}</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Week</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value) as 1 | 2)}
                className="w-full p-2 border rounded-md"
              >
                <option value={1}>Week 1</option>
                <option value={2}>Week 2</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Meal Type</label>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                className="w-full p-2 border rounded-md"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAddToMealPlan} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add to Meal Plan
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
