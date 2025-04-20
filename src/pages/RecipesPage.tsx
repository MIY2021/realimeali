
import { useState } from "react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { mockRecipes } from "@/data/mockData";

export default function RecipesPage() {
  const [recipes] = useState(mockRecipes);
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy">Recipes</h1>
          <p className="text-muted-foreground mt-1">
            Browse all your favorite recipes
          </p>
        </div>
        
        <Button className="bg-terracotta hover:bg-terracotta/90">
          <Plus className="h-4 w-4 mr-2" />
          Add New Recipe
        </Button>
      </div>
      
      <RecipeList recipes={recipes} />
    </div>
  );
}
