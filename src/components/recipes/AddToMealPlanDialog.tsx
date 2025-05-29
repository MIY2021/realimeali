
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Recipe, MealPlanMealType } from "@/types";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Coffee, Sandwich, UtensilsCrossed, Cookie } from "lucide-react";

interface AddToMealPlanDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mealTypeButtons = [
  { value: "breakfast" as MealPlanMealType, label: "Breakfast", icon: Coffee },
  { value: "lunch" as MealPlanMealType, label: "Lunch", icon: Sandwich },
  { value: "dinner" as MealPlanMealType, label: "Dinner", icon: UtensilsCrossed },
  { value: "snacks" as MealPlanMealType, label: "Snacks", icon: Cookie },
];

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
        mealType: selectedMealType,
        recipeId: recipe.id,
        createdBy: user.id,
        slotIndex: 0,
        isLeftover: false,
        householdId: currentHousehold.id,
        weekNumber: selectedWeek,
        originalServings: recipe.servings,
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

        <div className="space-y-6">
          {/* Week Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Week</Label>
            <RadioGroup 
              value={selectedWeek.toString()} 
              onValueChange={(value) => setSelectedWeek(parseInt(value) as 1 | 2)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="week1" />
                <Label htmlFor="week1" className="cursor-pointer">Week 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="week2" />
                <Label htmlFor="week2" className="cursor-pointer">Week 2</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Meal Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Meal Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {mealTypeButtons.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={selectedMealType === value ? "default" : "outline"}
                  className="h-12 flex flex-col items-center gap-1"
                  onClick={() => setSelectedMealType(value)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
