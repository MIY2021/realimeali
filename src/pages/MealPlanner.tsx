
import { useState, useEffect } from "react";
import { MealPlan, MealType, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { ListChecks, Plus, Share, FileSpreadsheet, CalendarDays, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AddRecipeToMealModal } from "@/components/meal-planner/AddRecipeToMealModal";
import MealListSection from "@/components/MealListSection";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMealPlan } from "@/contexts/MealPlanContext";

export default function MealPlanner() {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const { currentHousehold } = useHousehold();
  const { 
    mealPlans, 
    getMealPlansForWeek, 
    getRecipeForMealPlan, 
    addMealPlan, 
    removeMealPlan, 
    clearWeek,
    isLoading 
  } = useMealPlan();
  const { toast } = useToast();
  
  // --- Week state
  const [week, setWeek] = useState<1 | 2>(1);

  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];
  const getMealPlansForType = (mealType: MealType) =>
    getMealPlansForWeek(week).filter(plan => plan.mealType === mealType);
  
  // Only get recipes from user's collection
  const getRecipeById = (id: string) => recipes.find(r => r.id === id);

  // ---- AddMeal Modal State ----
  const [addMealModal, setAddMealModal] = useState<{
    open: boolean;
    mealType: MealType | null;
  }>({ open: false, mealType: null });

  // - Helper to get all unique recipe IDs in plan
  const allUsedIds = new Set(getMealPlansForWeek(week).map(mp => mp.recipeId));

  // Mapping each meal type to appropriate recipe categories
  const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
    dinner: ["Bulk", "Pasta", "Fish", "BBQ", "Super Tasty"],
    lunch: ["Easy", "Cheap", "Vegetarian", "Tapas"],
    breakfast: ["Breakfast", "Easy", "Healthy"],
    snacks: ["Snacks"],
  };

  // ---- Ensure unique random recipes from user's collection ----
  function getUniqueRandomRecipes(
    availableRecipes: typeof recipes,
    categories: RecipeCategory[],
    count: number,
    excludeIds: Set<string>
  ) {
    const pool = availableRecipes.filter(r =>
      r.categories.some(cat => categories.includes(cat as RecipeCategory)) &&
      !excludeIds.has(r.id)
    );
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const result = [];
    const seen = new Set(excludeIds);
    for (let recipe of shuffled) {
      if (!seen.has(recipe.id)) {
        result.push(recipe);
        seen.add(recipe.id);
        if (result.length === count) break;
      }
    }
    return result;
  }

  // ---- Randomise handler with confirmation ----
  const handleRandomMealSelection = async () => {
    console.log("Starting random meal selection...");
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to randomize meals.",
        variant: "destructive",
      });
      return;
    }

    if (!currentHousehold) {
      toast({
        title: "No Household Selected",
        description: "Please select or create a household to manage meal plans.",
        variant: "destructive",
      });
      return;
    }

    if (recipes.length === 0) {
      toast({
        title: "No Recipes Available",
        description: "You need to create some recipes first before randomizing meals.",
        variant: "destructive",
      });
      return;
    }

    const currentWeekPlans = getMealPlansForWeek(week);
    if (currentWeekPlans.length > 0) {
      if (!window.confirm("This will overwrite your current meal list. Continue?"))
        return;
    }
    
    try {
      console.log("Clearing week", week);
      // Clear current week first
      await clearWeek(week);
      
      // Add new random meal plans
      let allSelectedIds = new Set<string>();
      
      for (const mealType of mealTypes) {
        console.log(`Selecting recipes for ${mealType}...`);
        
        const unique = getUniqueRandomRecipes(
          recipes,
          mealTypeToCategories[mealType],
          Math.min(3, recipes.length),
          allSelectedIds
        );
        
        console.log(`Found ${unique.length} recipes for ${mealType}:`, unique.map(r => r.title));
        
        for (const [i, recipe] of unique.entries()) {
          console.log(`Adding ${recipe.title} to ${mealType} slot ${i}`);
          
          await addMealPlan({
            date: new Date().toISOString().split('T')[0],
            mealType: mealType,
            recipeId: recipe.id,
            createdBy: user.id,
            slotIndex: i,
          }, week);
          
          allSelectedIds.add(recipe.id);
        }
      }
      
      console.log("Random meal selection completed");
      toast({
        title: "Meal Plan Randomised",
        description: "Your meals have been chosen from your recipe collection!",
      });
    } catch (error) {
      console.error("Error during random meal selection:", error);
      toast({
        title: "Error",
        description: "Failed to randomize meal plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ---- Share ----
  const handleShareMealPlan = () => {
    const currentWeekPlans = getMealPlansForWeek(week);
    let shareText = `Here's our shared meal plan for Week ${week}!\n\n`;
    mealTypes.forEach(mealType => {
      shareText += `--- ${mealType.toUpperCase()} ---\n`;
      getMealPlansForType(mealType).forEach(plan => {
        const recipe = getRecipeById(plan.recipeId);
        shareText += `- ${recipe ? recipe.title : "Unknown"}\n`;
      });
      shareText += "\n";
    });
    if (navigator.share) {
      navigator.share({ title: "Meal Plan", text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
    }
    toast({
      title: "Copied Meal Plan",
      description: "Meal plan copied to clipboard!",
    });
  };

  // ---- Remove a meal ----
  const handleRemoveMeal = async (planId: string) => {
    console.log("Removing meal plan:", planId);
    await removeMealPlan(planId);
  };

  // ---- Add meal: Opens modal ----
  const handleAddMeal = (mealType: MealType) => {
    console.log("Opening add meal modal for:", mealType);
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to add meals.",
        variant: "destructive",
      });
      return;
    }

    if (!currentHousehold) {
      toast({
        title: "No Household Selected",
        description: "Please select or create a household to manage meal plans.",
        variant: "destructive",
      });
      return;
    }
    
    setAddMealModal({ open: true, mealType });
  };
  
  // Remove the restrictive filtering - show all recipes for all meal types
  const onAddMealFinish = async (mealType: MealType, recipeId: string) => {
    if (!user) return;
    
    console.log("Adding meal to plan:", { mealType, recipeId, week });
    
    const currentPlansForType = getMealPlansForType(mealType);
    
    try {
      await addMealPlan({
        date: new Date().toISOString().split('T')[0],
        mealType,
        recipeId,
        createdBy: user.id,
        slotIndex: currentPlansForType.length,
      }, week);
      
      setAddMealModal({ open: false, mealType: null });
    } catch (error) {
      console.error("Error adding meal:", error);
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ---- Clear all ----
  const handleClearAll = async () => {
    const currentWeekPlans = getMealPlansForWeek(week);
    if (currentWeekPlans.length === 0) return;
    if (!window.confirm("Clear the entire meal plan?")) return;
    
    await clearWeek(week);
  };

  // ---- Week toggle ----
  const handleToggleWeek = (val: 1 | 2) => {
    setWeek(val);
  };

  return (
    <div className="container max-w-xl py-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Meal Planner
          </h1>
          <p className="text-sm text-muted-foreground">
            {user ? "Plan and organize your weekly meals with your household" : "Login to create meal plans"}
          </p>
        </div>
      </div>
      
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
              <p className="text-muted-foreground">Loading meal plans...</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap mb-4">
                <Button
                  onClick={handleRandomMealSelection}
                  size="sm"
                  className="bg-sage hover:bg-sage/90 flex items-center whitespace-nowrap flex-1"
                  disabled={isLoading}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Randomise
                </Button>
                <Button
                  onClick={handleShareMealPlan}
                  size="sm"
                  variant="outline"
                  className="flex items-center whitespace-nowrap flex-1"
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
              
              <div className="flex gap-2 items-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-terracotta border-terracotta hover:bg-terracotta/10 flex-1"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
                <Button asChild variant="outline" size="sm" className="flex items-center flex-1">
                  <Link to="/shopping-list" className="flex items-center">
                    <ListChecks className="mr-2 h-4 w-4" />
                    Shopping List
                  </Link>
                </Button>
              </div>
              
              <div className="flex gap-2 mb-4">
                {[1, 2].map((val) => (
                  <Button
                    key={val}
                    size="sm"
                    variant={week === val ? "default" : "outline"}
                    className={week === val ? "bg-terracotta text-white" : ""}
                    onClick={() => handleToggleWeek(val as 1 | 2)}
                  >
                    Week {val}
                  </Button>
                ))}
              </div>
              
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
                    />
                  ))}
                  
                  {addMealModal.open && addMealModal.mealType && (
                    <AddRecipeToMealModal
                      open={addMealModal.open}
                      onClose={() => setAddMealModal({ open: false, mealType: null })}
                      mealType={addMealModal.mealType}
                      recipes={recipes} // Show all recipes, not filtered
                      onSelectRecipe={(recipeId) => onAddMealFinish(addMealModal.mealType!, recipeId)}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
