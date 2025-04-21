
import { useState } from "react";
import { MealPlan, MealType, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ListChecks, Share, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { mockMealPlans } from "@/data/mealPlans";
import { mockRecipes } from "@/data/recipes";

export default function MealPlanner() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans);
  const { toast } = useToast();

  // Simply: three mealTypes only, no calendar/dates/slots 
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast"];

  // Helper to get recipes for a mealType:
  const getMealPlansForType = (mealType: MealType) => {
    return mealPlans.filter((plan) => plan.mealType === mealType);
  };

  const getRecipeById = (id: string) => {
    return mockRecipes.find((r) => r.id === id);
  };

  // RANDOMISE — picks random recipe for each mealType (5 each)
  const handleRandomMealSelection = () => {
    const newMealPlans: MealPlan[] = [];
    const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
      dinner: ["Bulk", "Pasta", "Fish", "BBQ", "Super Tasty"],
      lunch: ["Easy", "Cheap", "Vegetarian", "Tapas"],
      breakfast: ["Easy", "Healthy", "Vegetarian"],
    };

    mealTypes.forEach((type) => {
      const eligibleRecipes = mockRecipes.filter((recipe) =>
        recipe.categories.some((category) =>
          mealTypeToCategories[type].includes(category as RecipeCategory)
        )
      );

      for (let i = 0; i < 5; i++) {
        if (eligibleRecipes.length > 0) {
          const randomIndex = Math.floor(Math.random() * eligibleRecipes.length);
          const recipe = eligibleRecipes[randomIndex];
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
        }
      }
    });
    setMealPlans(newMealPlans);
    toast({
      title: "Meal Plan Generated",
      description: "Random meals have been selected for your plan",
    });
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
      toast({
        title: "Shared to clipboard",
        description: "Meal plan text copied (share not supported on this device)"
      });
    }
  };

  // Invite button (dummy for now, could use modal/etc)
  const handleInvite = () => {
    toast({ title: "Invite sent (demo)", description: "Feature coming soon!" });
  };

  return (
    <div className="container max-w-xl py-8">
      <h1 className="text-2xl font-bold text-navy flex items-center gap-2 mb-4">
        Meal Planner
      </h1>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 mb-2">
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
            <h2 className="text-lg font-semibold text-navy capitalize mb-2">{mealType}</h2>
            <ul className="space-y-2 mb-6">
              {getMealPlansForType(mealType).map((plan) => {
                const recipe = getRecipeById(plan.recipeId);
                return (
                  <li key={plan.id} className="flex items-center justify-between bg-white rounded p-2 shadow">
                    <span className="font-medium">{recipe ? recipe.title : "Unknown"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <Button asChild variant="outline" size="sm" className="mt-6 flex items-center">
        <Link to="/shopping-list" className="flex items-center">
          <ListChecks className="mr-2 h-4 w-4" />
          Shopping List
        </Link>
      </Button>
    </div>
  );
}
