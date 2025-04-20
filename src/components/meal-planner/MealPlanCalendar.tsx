
import { useState } from "react";
import { MealPlan, Recipe, MealType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Utensils } from "lucide-react";
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
  const getRecipeForSlot = (index: number, mealType: MealType): { recipe?: Recipe, planId?: string } => {
    const mealPlan = mealPlans.find(
      (plan) => plan.mealType === mealType && plan.slotIndex === index
    );
    
    if (mealPlan) {
      const recipe = mockRecipes.find((recipe) => recipe.id === mealPlan.recipeId);
      return {
        recipe,
        planId: mealPlan.id
      };
    }
    
    return {};
  };

  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast"];
  
  const renderMealTypeSection = (mealType: MealType) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Utensils className="h-5 w-5 text-terracotta" />
        <h3 className="text-lg font-semibold text-navy capitalize">{mealType}s</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, index) => {
          const { recipe, planId } = getRecipeForSlot(index, mealType);
          
          return (
            <Card key={index} className="overflow-hidden border-l-4 border-l-sage">
              <CardHeader className="p-3">
                <CardTitle className="text-sm text-muted-foreground">
                  Meal {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {recipe ? (
                  <div className="space-y-2">
                    {recipe.image && (
                      <img 
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    )}
                    <div className="text-sm font-medium line-clamp-2">{recipe.title}</div>
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => planId && onRemoveMealPlan?.(planId)}
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
                    onClick={() => onAddMealPlan?.(new Date(), mealType)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    <span>Add {mealType}</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {mealTypes.map((mealType) => renderMealTypeSection(mealType))}
    </div>
  );
}
