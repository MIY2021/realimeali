
import { useCallback } from "react";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { MealPlanCreationInfo } from "@/components/meal-planner/MealPlanCreationInfo";
import MealListSection from "@/components/MealListSection";
import { MealType, Recipe, MealPlan } from "@/types";

interface MealPlannerContentProps {
  currentWeek: 1 | 2;
  setCurrentWeek: (week: 1 | 2) => void;
  isLoading: boolean;
  currentMealPlans: MealPlan[];
  recipes: Recipe[];
  onRandomize: () => void;
  onShare: () => void;
  onClearAll: () => void;
  onAddMeal: (mealType: MealType) => void;
  onAddCustomMeal: (mealType: MealType) => void;
  onRemoveMeal: (planId: string) => void;
  onCreateLeftover: (mealPlan: MealPlan, recipe: Recipe) => void;
  onReorderMeals: (mealType: MealType, sourceIndex: number, destinationIndex: number) => Promise<void>;
  lastGenerated?: Date | null;
  createdByUserId?: string;
}

export const MealPlannerContent = ({
  currentWeek,
  setCurrentWeek,
  isLoading,
  currentMealPlans,
  recipes,
  onRandomize,
  onShare,
  onClearAll,
  onAddMeal,
  onAddCustomMeal,
  onRemoveMeal,
  onCreateLeftover,
  onReorderMeals,
  lastGenerated,
  createdByUserId,
}: MealPlannerContentProps) => {
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks", "sides", "desserts", "drinks"];

  const getMealPlansForType = useCallback((mealType: MealType): MealPlan[] => {
    return currentMealPlans
      .filter(plan => plan.meal_type === mealType)
      .sort((a, b) => (a.slot_index || 0) - (b.slot_index || 0));
  }, [currentMealPlans]);

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  // Get creation info from meal plans
  const getCreationInfo = () => {
    if (currentMealPlans.length === 0) return { lastGenerated: null, createdByUserId: undefined };
    
    // Get the most recent meal plan's creation date
    const mostRecent = currentMealPlans.reduce((latest, current) => {
      const currentTime = new Date(current.created_at || '').getTime();
      const latestTime = new Date(latest.created_at || '').getTime();
      return currentTime > latestTime ? current : latest;
    });
    
    return {
      lastGenerated: mostRecent.created_at ? new Date(mostRecent.created_at) : null,
      createdByUserId: mostRecent.created_by
    };
  };

  const { lastGenerated: calculatedLastGenerated, createdByUserId: calculatedCreatedBy } = getCreationInfo();
  const finalLastGenerated = lastGenerated || calculatedLastGenerated;
  const finalCreatedBy = createdByUserId || calculatedCreatedBy;

  return (
    <div className="space-y-1">
      <MealPlannerActions
        onRandomize={onRandomize}
        onShare={onShare}
        onClearAll={onClearAll}
        isLoading={isLoading}
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
      />

      <MealPlanCreationInfo 
        lastGenerated={finalLastGenerated}
        createdByUserId={finalCreatedBy}
        totalMeals={currentMealPlans.length}
      />

      <div className="space-y-3">
        {mealTypes.map((mealType, index) => (
          <MealListSection
            key={mealType}
            mealType={mealType}
            mealPlans={getMealPlansForType(mealType)}
            getRecipeById={getRecipeById}
            onAddMeal={onAddMeal}
            onAddCustomMeal={onAddCustomMeal}
            onRemoveMeal={onRemoveMeal}
            onCreateLeftover={onCreateLeftover}
            onReorderMeals={onReorderMeals}
            sectionIndex={index}
          />
        ))}
      </div>
    </div>
  );
};
