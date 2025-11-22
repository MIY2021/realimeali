import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Book } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { RecipeList } from "@/components/recipes/RecipeList";
import { PageHeader } from "@/components/layout/PageHeader";
import { AddToMealPlanDialog } from "@/components/recipes/AddToMealPlanDialog";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePageTransition } from "@/hooks/usePageTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Recipe } from "@/types";
import { useRealiChefContext } from "@/hooks/useRealiChefContext";

export default function RecipesPage() {
  useDocumentTitle("My Recipes | RealiMeali");

  const { user } = useAuth();
  const { currentHousehold, isLoadingHousehold } = useHousehold();
  const { recipes, isLoading } = useRecipes();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  // Check if we should initialize with filters
  const initialNotCookedFilter = searchParams.get("filter") === "not-cooked";
  const initialFavouritesFilter = searchParams.get("filter") === "favourites";

  // State for Add to Meal Plan dialog
  const [selectedRecipeForMealPlan, setSelectedRecipeForMealPlan] = useState<Recipe | null>(null);
  const [isMealPlanDialogOpen, setIsMealPlanDialogOpen] = useState(false);

  const handleAddToMealPlan = (recipe: Recipe) => {
    setSelectedRecipeForMealPlan(recipe);
    setIsMealPlanDialogOpen(true);
  };

  const getWelcomeText = () => {
    if (!currentHousehold) {
      return "Cursor Curate your household's favourite meals — a private collection just for you.";
    }
    return "Cursor Curate your household's favourite meals — a private collection just for you.";
  };

  // Update RealiChef with recipes context - memoize to prevent infinite loops
  const realiChefContextData = useMemo(
    () => ({
      totalRecipes: recipes.length,
      recipeMealTypes: [...new Set(recipes.map((r) => r.meal_type).filter(Boolean))],
      favoriteRecipes: recipes.filter((r) => r.is_favorite).length,
    }),
    [recipes.length, recipes],
  );

  useRealiChefContext(realiChefContextData);

  // Header shows immediately, only recipe list shows loading

  return (
    <>
      <div
        className={`container max-w-7xl py-4 px-4 sm:py-8 sm:px-6 ${isMobile ? "min-h-screen" : ""}`}
        data-scroll-content
      >
        <PageHeader
          icon={
            <Book
              className="h-6 w-6 sm:h-7 sm:w-7"
              style={{ color: "#F5B82E", stroke: "#F5B82E" }}
              aria-hidden="true"
            />
          }
          title="My Recipes"
          description={getWelcomeText()}
        />

        {!user ? (
          <div className="py-10 text-center px-4">
            <p className="text-muted-foreground mb-4">Please log in to view and manage recipes.</p>
          </div>
        ) : !currentHousehold ? (
          <div className="py-10 text-center px-4">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-navy mb-2">No Household Selected</h2>
              <p className="text-muted-foreground mb-6">
                You need to create or join a household to view and manage recipes.
              </p>
              <Button asChild style={{ backgroundColor: "#81b29a" }}>
                <Link to="/settings">Manage Household</Link>
              </Button>
            </div>
          </div>
        ) : (
          <RecipeList
            recipes={recipes}
            isLoading={isLoading}
            onAddToMealPlan={handleAddToMealPlan}
            initialNotCookedFilter={initialNotCookedFilter}
            initialFavouritesFilter={initialFavouritesFilter}
          />
        )}
      </div>

      <AddToMealPlanDialog
        recipe={selectedRecipeForMealPlan}
        open={isMealPlanDialogOpen}
        onOpenChange={setIsMealPlanDialogOpen}
      />
    </>
  );
}
