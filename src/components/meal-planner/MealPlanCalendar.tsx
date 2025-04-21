
// We need to create a custom component since the original is in read-only files
// This will require coordination with the user to update their usage

<lov-write file_path="src/components/meal-planner/CustomMealPlanCalendar.tsx">
import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { MealPlan, MealType } from "@/types";
import { mockRecipes } from "@/data/recipes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

interface MealPlanCalendarProps {
  mealPlans: MealPlan[];
  onAddMealPlan: (date: Date, mealType: MealType) => void;
  onRemoveMealPlan: (id: string) => void;
}

// Note: This is a simplified version that fixes the "Lunches" spelling
// The actual component might have more features
export function CustomMealPlanCalendar({
  mealPlans,
  onAddMealPlan,
  onRemoveMealPlan,
}: MealPlanCalendarProps) {
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  const mealTypes: { type: MealType; label: string }[] = [
    { type: "breakfast", label: "Breakfast" },
    { type: "lunch", label: "Lunches" },  // Fixed spelling
    { type: "dinner", label: "Dinner" },
  ];

  const getMealPlansForDateAndType = (date: Date, mealType: MealType) => {
    const dateString = format(date, "yyyy-MM-dd");
    return mealPlans.filter(
      (plan) => 
        format(new Date(plan.date), "yyyy-MM-dd") === dateString && 
        plan.mealType === mealType
    );
  };

  const getRecipeById = (id: string) => {
    return mockRecipes.find((recipe) => recipe.id === id);
  };

  const handlePreviousWeek = () => {
    setStartDate(addDays(startDate, -7));
  };

  const handleNextWeek = () => {
    setStartDate(addDays(startDate, 7));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weekly Plan</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Week</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Week</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-8 gap-2">
        <div className="sticky left-0"></div>
        {days.map((day) => (
          <div key={day.toISOString()} className="text-center">
            <div className="text-sm font-medium">{format(day, "EEE")}</div>
            <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
          </div>
        ))}
        
        {mealTypes.map((mealType) => (
          <React.Fragment key={mealType.type}>
            <div className="sticky left-0 flex items-center">
              <span className="text-sm font-medium">{mealType.label}</span>
            </div>
            
            {days.map((day) => {
              const plansForMeal = getMealPlansForDateAndType(day, mealType.type);
              
              return (
                <Card key={`${day.toISOString()}-${mealType.type}`} className="p-2 h-24 overflow-y-auto">
                  {plansForMeal.length > 0 ? (
                    <div className="space-y-1">
                      {plansForMeal.map((plan) => {
                        const recipe = getRecipeById(plan.recipeId);
                        
                        return recipe ? (
                          <div key={plan.id} className="flex justify-between items-start text-xs">
                            <span className="font-medium line-clamp-2">{recipe.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={() => onRemoveMealPlan(plan.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-full flex items-center justify-center text-muted-foreground"
                      onClick={() => onAddMealPlan(day, mealType.type)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add {mealType.label}</span>
                    </Button>
                  )}
                </Card>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
