import { useState } from "react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { mockRecipes } from "@/data/recipes";
import { MealType, Recipe } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function RecipesPage() {
  const [dialogRecipe, setDialogRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Updated: expect both mealType and week
  const handleAddToMealPlan = (recipe: Recipe) => {
    setDialogRecipe(recipe);
    setDialogOpen(true);
  };

  const handleMealTypeSelect = (mealType: MealType, week: 1 | 2) => {
    toast({
      title: "Recipe added to meal plan!",
      description: `Added "${dialogRecipe?.title}" to ${mealType}, week ${week}`,
    });
    // Here add actual logic to persist to meal plan as needed (user-dependent)
    setDialogOpen(false);
  };

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Recipes</h1>
      <RecipeList recipes={mockRecipes} onAddToMealPlan={handleAddToMealPlan} />
      {dialogRecipe && (
        <AddToMealPlanDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSelect={handleMealTypeSelect}
        />
      )}
    </div>
  );
}
