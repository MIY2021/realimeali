
import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealPlan, Recipe, MealType } from "@/types";
import { EnhancedMealCard } from "./EnhancedMealCard";

interface CustomMealPlanCalendarProps {
  currentWeek: 1 | 2;
  onWeekChange: (week: 1 | 2) => void;
  mealPlans: MealPlan[];
  recipes: Recipe[];
  onAddMeal: (date: string, mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe?: Recipe) => void;
  onReorderMeals: (mealType: MealType, reorderedPlans: MealPlan[]) => void;
}

export function CustomMealPlanCalendar({
  currentWeek,
  onWeekChange,
  mealPlans,
  recipes,
  onAddMeal,
  onRemoveMeal,
  onCreateLeftover,
  onReorderMeals,
}: CustomMealPlanCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Set the date to the start of the current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(today.setDate(diff));
    setCurrentDate(startOfWeek);
  }, []);

  const getDaysInWeek = (date: Date): Date[] => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const daysInWeek = getDaysInWeek(currentDate);

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentDate);
    prevWeek.setDate(currentDate.getDate() - 7);
    setCurrentDate(prevWeek);
    onWeekChange(1);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextWeek);
    onWeekChange(2);
  };

  const getMealPlansForDateAndType = (date: Date, mealType: MealType): MealPlan[] => {
    const dateString = date.toISOString().split("T")[0];
    return mealPlans.filter(
      (plan) => plan.date === dateString && plan.meal_type === mealType && plan.week_number === currentWeek
    );
  };

  const getRecipeForMealPlan = (mealPlan: MealPlan): Recipe | undefined => {
    return recipes.find((recipe) => recipe.id === mealPlan.recipe_id);
  };

  const handleRemove = (planId: string) => {
    onRemoveMeal(planId);
  };

  const handleCreateLeftover = (mealPlan: MealPlan, recipe?: Recipe) => {
    onCreateLeftover(mealPlan, recipe);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg">Week {currentWeek} Meal Plan</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        {daysInWeek.map((date) => {
          const dateString = date.toISOString().split("T")[0];
          return (
            <div key={dateString} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-3">
                {["breakfast", "lunch", "dinner", "snacks"].map((mealType) => {
                  const mealPlansForType = getMealPlansForDateAndType(
                    date,
                    mealType as MealType
                  );

                  return (
                    <div key={mealType} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm capitalize">{mealType}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddMeal(dateString, mealType as MealType)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {mealPlansForType.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No meals planned for {mealType}.
                          </p>
                        ) : (
                          mealPlansForType.map((mealPlan) => {
                            const recipe = getRecipeForMealPlan(mealPlan);
                            const parentRecipe = mealPlan.parent_meal_plan_id ? recipes.find(r => r.id === mealPlan.parent_meal_plan_id) : undefined;

                            return (
                              <EnhancedMealCard
                                key={mealPlan.id}
                                mealPlan={mealPlan}
                                recipe={recipe}
                                parentRecipe={parentRecipe}
                                onRemove={handleRemove}
                                onCreateLeftover={handleCreateLeftover}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
