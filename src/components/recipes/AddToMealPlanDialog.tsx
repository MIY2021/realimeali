import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Recipe, MealType } from "@/types";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCurrentWeekKey, getNextWeek, formatWeekRange, parseISOWeekKey, getWeekStartDate } from "@/utils/weekUtils";

interface AddToMealPlanDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustedServings?: number;
}

export function AddToMealPlanDialog({ recipe, open, onOpenChange, adjustedServings }: AddToMealPlanDialogProps) {
  const currentWeekKey = getCurrentWeekKey();
  const nextWeekKey = getNextWeek(currentWeekKey);
  const [selectedWeek, setSelectedWeek] = useState<string>(currentWeekKey);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("dinner");
  const [isLoading, setIsLoading] = useState(false);

  const { addMealPlan } = useMealPlan();
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const isMobile = useIsMobile();

  const handleAddToMealPlan = async () => {
    if (!recipe || !user || !currentHousehold) return;

    setIsLoading(true);
    try {
      // Calculate a date within the target week (Monday of that week)
      const { year, week } = parseISOWeekKey(selectedWeek);
      const weekStartDate = getWeekStartDate(year, week);
      const dateStr = weekStartDate.toISOString().split('T')[0];
      
      // Use adjusted servings if provided, otherwise use recipe servings
      const plannedServings = adjustedServings || recipe.servings;
      
      await addMealPlan({
        date: dateStr,
        meal_type: selectedMealType,
        recipe_id: recipe.id,
        created_by: user.id,
        slot_index: 0,
        is_leftover: false,
        household_id: currentHousehold.id,
        week_key: selectedWeek,
        original_servings: recipe.servings,
        planned_servings: plannedServings,
        is_completed: false,
        is_freetyped: false,
      }, selectedWeek);

      const servingsText = adjustedServings && adjustedServings !== recipe.servings 
        ? ` (${adjustedServings} servings)` 
        : '';
      
      const weekRange = formatWeekRange(year, week);

      toast({
        title: "Added to Meal Plan",
        description: `${recipe.title}${servingsText} has been added to week of ${weekRange}.`,
      });

      // Flash the meal plan icon on mobile
      if (isMobile) {
        window.dispatchEvent(new CustomEvent('flash-meal-plan'));
      }

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

  const servingsToAdd = adjustedServings || recipe.servings;
  const isAdjusted = adjustedServings && adjustedServings !== recipe.servings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white shadow-2xl border-0 rounded-2xl p-8">
        <DialogHeader className="text-center space-y-4 pb-6">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Add {recipe.title} to Meal Plan
          </DialogTitle>
          {isAdjusted && (
            <p className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
              Will be added with {servingsToAdd} servings (adjusted from original {recipe.servings})
            </p>
          )}
        </DialogHeader>

        <div className="space-y-8">
          <div>
            <label className="text-base font-semibold text-gray-900 mb-4 block text-center">Select Week</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedWeek === currentWeekKey ? "default" : "outline"}
                onClick={() => setSelectedWeek(currentWeekKey)}
                className={`h-14 text-base font-medium rounded-xl transition-all duration-200 ${
                  selectedWeek === currentWeekKey 
                    ? 'bg-primary text-white shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                }`}
              >
                Current Week
              </Button>
              <Button
                variant={selectedWeek === nextWeekKey ? "default" : "outline"}
                onClick={() => setSelectedWeek(nextWeekKey)}
                className={`h-14 text-base font-medium rounded-xl transition-all duration-200 ${
                  selectedWeek === nextWeekKey 
                    ? 'bg-primary text-white shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                }`}
              >
                Next Week
              </Button>
            </div>
          </div>

          <div>
            <label className="text-base font-semibold text-gray-900 mb-4 block text-center">Meal Type</label>
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map((mealType) => (
                <Button
                  key={mealType.value}
                  variant={selectedMealType === mealType.value ? "default" : "outline"}
                  onClick={() => setSelectedMealType(mealType.value)}
                  className={`h-14 text-base font-medium rounded-xl transition-all duration-200 ${
                    selectedMealType === mealType.value 
                      ? 'bg-primary text-white shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                  }`}
                >
                  {mealType.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-8 py-3 text-base font-medium rounded-xl border-gray-200 hover:bg-gray-50 min-w-[120px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddToMealPlan} 
              disabled={isLoading}
              className="px-8 py-3 text-base font-medium rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg min-w-[120px] disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add to Meal Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
