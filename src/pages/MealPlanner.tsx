
import { useState } from "react";
import { MealPlan, MealType, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ListChecks, Share, Users, Trash2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { mockMealPlans } from "@/data/mealPlans";
import { mockRecipes } from "@/data/recipes";

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans);
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast"];
  const navigate = useNavigate();

  // Helper: list for mealType
  const getMealPlansForType = (mealType: MealType) => {
    return mealPlans.filter((plan) => plan.mealType === mealType);
  };

  const getRecipeById = (id: string) => {
    return mockRecipes.find((r) => r.id === id);
  };

  // Helper: choose N unique recipes for each mealType
  function getUniqueRandomRecipes(
    availableRecipes: typeof mockRecipes,
    categories: RecipeCategory[],
    count: number
  ) {
    const pool = availableRecipes.filter((r) =>
      r.categories.some((cat) => categories.includes(cat as RecipeCategory))
    );
    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    // Unique by recipe.id
    const seen = new Set();
    const result = [];
    for (let recipe of shuffled) {
      if (!seen.has(recipe.id)) {
        result.push(recipe);
        seen.add(recipe.id);
        if (result.length === count) break;
      }
    }
    return result;
  }

  // Rewritten randomise
  const handleRandomMealSelection = () => {
    const newMealPlans: MealPlan[] = [];
    const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
      dinner: ["Bulk", "Pasta", "Fish", "BBQ", "Super Tasty"],
      lunch: ["Easy", "Cheap", "Vegetarian", "Tapas"],
      breakfast: ["Easy", "Healthy", "Vegetarian"],
    };

    mealTypes.forEach((type) => {
      const unique = getUniqueRandomRecipes(
        mockRecipes,
        mealTypeToCategories[type],
        5
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
      });
    });
    setMealPlans(newMealPlans);
  };

  // Share only what is displayed (not all historic meals)
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
      navigator.share({
        title: "Meal Plan",
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  // Remove a meal from a plan
  const handleRemoveMeal = (planId: string) => {
    setMealPlans((prev) => prev.filter((mp) => mp.id !== planId));
  };

  // Add meal (dummy: maybe open dialog or just push placeholder meal for demo)
  const handleAddMeal = (mealType: MealType) => {
    // Demo: pick first unused recipe from categories
    const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
      dinner: ["Bulk", "Pasta", "Fish", "BBQ", "Super Tasty"],
      lunch: ["Easy", "Cheap", "Vegetarian", "Tapas"],
      breakfast: ["Easy", "Healthy", "Vegetarian"],
    };
    const usedIds = new Set(
      mealPlans.filter((mp) => mp.mealType === mealType).map((mp) => mp.recipeId)
    );
    const available = mockRecipes.filter(
      (r) =>
        r.categories.some((c) =>
          mealTypeToCategories[mealType].includes(c as RecipeCategory)
        ) && !usedIds.has(r.id)
    );
    const pick = available[0];
    if (pick) {
      setMealPlans((prev) => [
        ...prev,
        {
          id: `added-meal-${Date.now()}-${mealType}`,
          date: new Date().toISOString(),
          mealType,
          recipeId: pick.id,
          createdBy: "user-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          slotIndex: prev.filter(mp => mp.mealType === mealType).length,
        },
      ]);
    }
  };

  // Invite
  const handleInvite = () => {
    alert("Feature coming soon: Invite users");
  };

  return (
    <div className="container max-w-xl py-8">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-2">
        Meal Planner
      </h1>
      {/* Randomise button above all lists */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleRandomMealSelection}
          size="sm"
          className="bg-sage hover:bg-sage/90 flex items-center whitespace-nowrap"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Randomise
        </Button>
        <Button
          onClick={handleShareMealPlan}
          size="sm"
          variant="outline"
          className="flex items-center whitespace-nowrap"
        >
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button
          onClick={handleInvite}
          size="sm"
          variant="outline"
          className="flex items-center whitespace-nowrap"
        >
          <Users className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>
      {mealTypes.map((mealType) => (
        <div key={mealType}>
          <div className="flex items-center mb-1">
            <h2 className="text-lg font-semibold text-navy capitalize flex-1">{mealType}</h2>
            <Button
              size="icon"
              variant="ghost"
              className="ml-2"
              onClick={() => handleAddMeal(mealType)}
              title="Add meal"
            >
              <Plus className="h-5 w-5 text-navy" />
              <span className="sr-only">Add {mealType}</span>
            </Button>
          </div>
          <ul className="space-y-2 mb-6">
            {getMealPlansForType(mealType).map((plan) => {
              const recipe = getRecipeById(plan.recipeId);
              return (
                <li key={plan.id} className="flex items-center justify-between bg-white rounded p-2 shadow">
                  <Link
                    to={`/recipes/${plan.recipeId}`}
                    className="font-medium flex-1 hover:underline"
                  >
                    {recipe ? recipe.title : "Unknown"}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 text-muted-foreground"
                    onClick={() => handleRemoveMeal(plan.id)}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <Button asChild variant="outline" size="sm" className="mt-6 flex items-center">
        <Link to="/shopping-list" className="flex items-center">
          <ListChecks className="mr-2 h-4 w-4" />
          Shopping List
        </Link>
      </Button>
    </div>
  );
}
