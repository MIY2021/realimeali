
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealDBRecipe } from "@/types/mealdb";
import { SaveMealDBRecipeDialog } from "./SaveMealDBRecipeDialog";

interface MealDBRecipeCardProps {
  recipe: MealDBRecipe;
}

export function MealDBRecipeCard({ recipe }: MealDBRecipeCardProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{recipe.strMeal}</h3>
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-48 object-cover rounded-md"
          />
          <p className="text-sm text-gray-700">{recipe.strCategory} - {recipe.strArea}</p>
          <Button size="sm" onClick={() => setSaveDialogOpen(true)}>
            Save to My Recipes
          </Button>
        </div>
      </CardContent>

      <SaveMealDBRecipeDialog
        recipe={recipe}
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
      />
    </Card>
  );
}
