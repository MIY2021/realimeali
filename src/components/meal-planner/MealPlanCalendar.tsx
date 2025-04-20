
import { useState } from "react";
import { MealPlan, Recipe, MealType } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { mockRecipes } from "@/data/mockData";

interface MealPlanCalendarProps {
  mealPlans: MealPlan[];
  onAddMealPlan?: (date: Date, mealType: MealType) => void;
  onRemoveMealPlan?: (mealPlanId: string) => void;
}

export function MealPlanCalendar({ 
  mealPlans, 
  onAddMealPlan,
  onRemoveMealPlan 
}: MealPlanCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const startDate = selectedDate ? startOfWeek(selectedDate, { weekStartsOn: 0 }) : new Date();
  
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  
  const getRecipeForMeal = (date: Date, mealType: MealType): Recipe | undefined => {
    const mealPlan = mealPlans.find(
      (plan) => isSameDay(new Date(plan.date), date) && plan.mealType === mealType
    );
    
    if (mealPlan) {
      return mockRecipes.find((recipe) => recipe.id === mealPlan.recipeId);
    }
    
    return undefined;
  };
  
  const getMealPlanId = (date: Date, mealType: MealType): string | undefined => {
    const mealPlan = mealPlans.find(
      (plan) => isSameDay(new Date(plan.date), date) && plan.mealType === mealType
    );
    
    return mealPlan?.id;
  };
  
  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-xs">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border shadow"
        />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-navy">
          Week of {format(startDate, "MMMM d, yyyy")}
        </h2>
        
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const date = addDays(startDate, dayIndex);
            
            return (
              <div key={dayIndex} className="space-y-2">
                <div 
                  className={`text-center p-2 rounded-md ${
                    isSameDay(date, new Date()) 
                      ? "bg-terracotta text-white font-medium" 
                      : "bg-muted"
                  }`}
                >
                  <div className="text-xs font-medium">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-sm">
                    {format(date, "d")}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {mealTypes.map((mealType) => {
                    const recipe = getRecipeForMeal(date, mealType);
                    const mealPlanId = getMealPlanId(date, mealType);
                    
                    return (
                      <Card key={mealType} className="overflow-hidden border-l-4 border-l-sage">
                        <CardHeader className="p-2 pb-0">
                          <CardTitle className="text-xs font-medium text-muted-foreground">
                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-1">
                          {recipe ? (
                            <div className="space-y-1">
                              <div className="text-xs font-medium line-clamp-1">{recipe.title}</div>
                              <div className="flex items-center justify-between">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => mealPlanId && onRemoveMealPlan?.(mealPlanId)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-full justify-start p-0 text-xs text-muted-foreground"
                              onClick={() => onAddMealPlan?.(date, mealType)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              <span>Add</span>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
