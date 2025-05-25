
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { RecipeList } from "@/components/recipes/RecipeList";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function RecipesPage() {
  useDocumentTitle("Recipes | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading } = useRecipes();

  // Load recipes automatically
  useRecipesLoader();

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            {currentHousehold ? `${currentHousehold.name} Recipes` : 'Recipes'}
          </h1>
          <p className="text-muted-foreground">
            Discover and manage your recipe collection
          </p>
        </div>
        {user && currentHousehold && (
          <Button asChild className="bg-terracotta hover:bg-terracotta/90">
            <Link to="/recipes/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Recipe
            </Link>
          </Button>
        )}
      </div>

      {!user ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please log in to view and manage recipes.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Please create or select a household to view recipes.</p>
        </div>
      ) : (
        <RecipeList 
          recipes={recipes}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
