
import { useState, useEffect } from "react";
import { MealPlan, MealType, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { ListChecks, Plus, Share, Users, FileSpreadsheet, CalendarDays, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { mockMealPlans } from "@/data/mealPlans";
import { mockRecipes } from "@/data/recipes";
import { AddRecipeToMealModal } from "@/components/meal-planner/AddRecipeToMealModal";
import MealListSection from "@/components/MealListSection";
import MealActions from "@/components/MealActions";

const STORAGE_KEY = "persistedMealPlans_v1";

export default function MealPlanner() {
  // --- Week state
  const [week, setWeek] = useState<1 | 2>(1);

  // ----- Load and persist meal plans for both weeks -----
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_week${week}`);
    if (stored) {
      setMealPlans(JSON.parse(stored));
    } else if (week === 1) {
      setMealPlans(mockMealPlans);
    } else {
      setMealPlans([]);
    }
  }, [week]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_week${week}`, JSON.stringify(mealPlans));
  }, [mealPlans, week]);

  const { toast } = useToast();
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];
  const getMealPlansForType = (mealType: MealType) =>
    mealPlans.filter(plan => plan.mealType === mealType);
  const getRecipeById = (id: string) => mockRecipes.find(r => r.id === id);

  // ---- AddMeal Modal State ----
  const [addMealModal, setAddMealModal] = useState<{
    open: boolean;
    mealType: MealType | null;
  }>({ open: false, mealType: null });

  // - Helper to get all unique recipe IDs in plan
  const allUsedIds = new Set(mealPlans.map(mp => mp.recipeId));

  // Define appropriate recipe categories for each meal type
  const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
    breakfast: ["Breakfast"], // Only use Breakfast category for breakfast
    dinner: ["Bulk", "Pasta", "Fish", "BBQ", "Super Tasty"],
    lunch: ["Easy", "Cheap", "Vegetarian", "Tapas"],
    snacks: ["Snacks"] // Only use Snacks category for snacks
  };

  // ---- Ensure unique random recipes ----
  function getUniqueRandomRecipes(
    availableRecipes: typeof mockRecipes,
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
  const handleRandomMealSelection = () => {
    if (mealPlans.length > 0) {
      if (!window.confirm("This will overwrite your current meal list. Continue?"))
        return;
    }
    const newMealPlans: MealPlan[] = [];
    let allSelectedIds = new Set<string>();
    mealTypes.forEach(type => {
      const unique = getUniqueRandomRecipes(
        mockRecipes,
        mealTypeToCategories[type],
        5,
        allSelectedIds
      );
      unique.forEach((recipe, i) => {
        newMealPlans.push({
          id: `random-meal-${Date.now()}-${type}-${i}`,
          date: new Date().toISOString(),
          mealType: type,
          recipeId: recipe.id,
          createdBy: "user-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slotIndex: i,
        });
        allSelectedIds.add(recipe.id);
      });
    });
    setMealPlans(newMealPlans);
    toast({
      title: "Meal Plan Randomised",
      description: "Your meals have been chosen!",
    });
  };

  // ---- Share ----
  const handleShareMealPlan = () => {
    let shareText = "Here's our shared meal plan!\n\n";
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
  const handleRemoveMeal = (planId: string) => {
    setMealPlans((prev) => prev.filter((mp) => mp.id !== planId));
  };

  // ---- Add meal: Opens modal ----
  const handleAddMeal = (mealType: MealType) => {
    setAddMealModal({ open: true, mealType });
  };
  
  // Filter recipes by meal type when adding a meal manually
  const getRecipesForMealType = (mealType: MealType) => {
    const categories = mealTypeToCategories[mealType];
    return mockRecipes.filter(recipe =>
      recipe.categories.some(cat => categories.includes(cat as RecipeCategory))
    );
  };
  
  const onAddMealFinish = (mealType: MealType, recipeId: string) => {
    setMealPlans((prev) => [
      ...prev,
      {
        id: `added-meal-${Date.now()}-${mealType}`,
        date: new Date().toISOString(),
        mealType,
        recipeId,
        createdBy: "user-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slotIndex: prev.filter(mp => mp.mealType === mealType).length,
      }
    ]);
    setAddMealModal({ open: false, mealType: null });
  };

  // ---- Invite handler ----
  const handleInvite = () => alert("Feature coming soon: Invite users to meal plan");

  // ---- Clear all ----
  const handleClearAll = () => {
    if (mealPlans.length === 0) return;
    if (!window.confirm("Clear the entire meal plan?")) return;
    setMealPlans([]);
    toast({
      title: "Meal plan cleared"
    });
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
            <Button
              onClick={handleInvite}
              size="sm"
              variant="ghost"
              className="ml-2"
              title="Invite others to meal plan"
            >
              <Users className="h-4 w-4" />
            </Button>
          </h1>
          <p className="text-sm text-muted-foreground">Plan and organize your weekly meals</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        <Button
          onClick={handleRandomMealSelection}
          size="sm"
          className="bg-sage hover:bg-sage/90 flex items-center whitespace-nowrap flex-1"
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
          recipes={getRecipesForMealType(addMealModal.mealType)}
          onSelectRecipe={(recipeId) => onAddMealFinish(addMealModal.mealType!, recipeId)}
        />
      )}
    </div>
  );
}
