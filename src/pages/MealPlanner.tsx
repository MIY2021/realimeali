
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AddMealWithLeftoversDialog } from "@/components/meal-planner/AddMealWithLeftoversDialog";
import { LeftoverServingsDialog } from "@/components/meal-planner/LeftoverServingsDialog";
import MealListSection from "@/components/MealListSection";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import { useMealPlanActions } from "@/hooks/useMealPlanActions";
import { useRandomMealSelection } from "@/hooks/useRandomMealSelection";
import { MealPlannerHeader } from "@/components/meal-planner/MealPlannerHeader";
import { WeekSelector } from "@/components/meal-planner/WeekSelector";
import { MealPlannerActions } from "@/components/meal-planner/MealPlannerActions";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function MealPlanner() {
  useDocumentTitle("Meal Planner | RealiMeali");
  
  const { user } = useAuth();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { isLoading: mealPlansLoading } = useMealPlan();
  
  const [week, setWeek] = useState<1 | 2>(1);
  
  // Load recipes automatically
  useRecipesLoader();
  
  const {
    mealTypes,
    mealTypeToCategories,
    addMealModal,
    setAddMealModal,
    leftoverModal,
    setLeftoverModal,
    getMealPlansForType,
    handleRemoveMeal,
    handleAddMeal,
    handleCreateLeftover,
    onLeftoverConfirm,
    onAddMealFinish,
    handleClearAll,
    handleShareMealPlan,
  } = useMealPlanActions(week);

  const { handleRandomMealSelection } = useRandomMealSelection(
    week, 
    mealTypeToCategories, 
    mealTypes
  );

  const isLoading = recipesLoading || mealPlansLoading;
  const getRecipeById = (id: string) => recipes.find(r => r.id === id);

  return (
    <div className="container max-w-xl py-8">
      <MealPlannerHeader user={user} currentHousehold={currentHousehold} />
      
      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to create and manage meal plans.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please create or select a household to manage meal plans.</p>
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">Loading meal plans and recipes...</p>
            </div>
          ) : (
            <>
              <MealPlannerActions
                onRandomize={handleRandomMealSelection}
                onShare={handleShareMealPlan}
                onClearAll={handleClearAll}
                isLoading={isLoading}
              />
              
              <WeekSelector week={week} onWeekChange={setWeek} />
              
              {recipes.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground mb-4">You need to create some recipes first before planning meals.</p>
                  <Button asChild className="bg-terracotta hover:bg-terracotta/90">
                    <Link to="/recipes">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Recipe
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {mealTypes.map((mealType) => (
                    <MealListSection
                      key={mealType}
                      mealType={mealType}
                      mealPlans={getMealPlansForType(mealType)}
                      getRecipeById={getRecipeById}
                      onAddMeal={handleAddMeal}
                      onRemoveMeal={handleRemoveMeal}
                      onCreateLeftover={handleCreateLeftover}
                    />
                  ))}
                  
                  {addMealModal.open && addMealModal.mealType && (
                    <AddMealWithLeftoversDialog
                      open={addMealModal.open}
                      onClose={() => setAddMealModal({ open: false, mealType: null })}
                      mealType={addMealModal.mealType}
                      recipes={recipes}
                      onSelectRecipe={(recipeId) => 
                        onAddMealFinish(addMealModal.mealType!, recipeId)
                      }
                    />
                  )}

                  <LeftoverServingsDialog
                    open={leftoverModal.open}
                    onClose={() => setLeftoverModal({ open: false, mealPlan: null, recipe: null })}
                    mealPlan={leftoverModal.mealPlan}
                    recipe={leftoverModal.recipe}
                    onConfirm={onLeftoverConfirm}
                  />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
