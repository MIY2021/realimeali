
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");

  // Load recipes automatically
  useRecipesLoader();

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy">
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
              Create Recipe
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
          recipes={filteredRecipes}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
