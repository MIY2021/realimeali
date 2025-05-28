
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { useRecipeList } from "@/hooks/useRecipeList";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { RecipeFilters } from "./RecipeFilters";
import { RecipeGrid } from "./RecipeGrid";

interface RecipeListProps {
  recipes: Recipe[];
  showActions?: boolean;
  isLoading?: boolean;
}

export function RecipeList({ 
  recipes, 
  showActions = false, 
  isLoading = false
}: RecipeListProps) {
  // State for meal plan dialog
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlanDialogOpen, setMealPlanDialogOpen] = useState(false);

  // Custom hooks for managing state
  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortType,
    setSortType,
    sortedRecipes,
    visibleRecipes,
    hasMoreRecipes,
    handleLoadMore,
  } = useRecipeList({ recipes });

  const { mobileLayout, handleMobileLayoutChange } = useMobileLayout();

  const handleAddToMealPlan = (recipe: Recipe) => {
    console.log("Opening meal plan dialog for recipe:", recipe.title);
    setSelectedRecipe(recipe);
    setMealPlanDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <RecipeFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortType={sortType}
        onSortChange={setSortType}
        mobileLayout={mobileLayout}
        onMobileLayoutChange={handleMobileLayoutChange}
      />
      
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <RecipeGrid
            recipes={visibleRecipes}
            mobileLayout={mobileLayout}
            onAddToMealPlan={handleAddToMealPlan}
          />
          
          <div className="flex flex-col items-center gap-4 mt-6 px-4">
            {hasMoreRecipes && (
              <Button onClick={handleLoadMore} variant="outline" className="w-full sm:w-auto">
                Load More Recipes
              </Button>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Showing {visibleRecipes.length} of {sortedRecipes.length} recipes
            </p>
          </div>
        </>
      )}

      <AddToMealPlanDialog
        recipe={selectedRecipe}
        open={mealPlanDialogOpen}
        onOpenChange={setMealPlanDialogOpen}
      />
    </div>
  );
}
