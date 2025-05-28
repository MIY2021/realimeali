
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import { RecipeList } from "@/components/recipes/RecipeList";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useRecipesLoader } from "@/hooks/useRecipesLoader";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useIsMobile } from "@/hooks/use-mobile";

export default function RecipesPage() {
  useDocumentTitle("My Recipes | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading } = useRecipes();
  const { restoreScrollPosition, setScrollKey, clearScrollPosition } = useScrollPosition();
  const { navigationState, clearNavigationState } = useNavigationState();
  const isMobile = useIsMobile();

  // Mobile layout state
  const [mobileLayout, setMobileLayout] = useState<string>(() => {
    return localStorage.getItem('mobileRecipeLayout') || '1';
  });

  // Load recipes automatically
  useRecipesLoader();

  // Set up scroll position tracking for this page with enhanced restoration
  useEffect(() => {
    setScrollKey('recipes');
    
    // Check if we should restore scroll position
    if (navigationState.shouldRestoreScroll || 
        sessionStorage.getItem('restoreRecipesScroll') === 'true') {
      console.log('Restoring scroll position on recipes page');
      
      // Wait for recipes to load before attempting scroll restoration
      if (!isLoading && recipes.length > 0) {
        const currentLayout = localStorage.getItem('mobileRecipeLayout') || '1';
        restoreScrollPosition('recipes', currentLayout);
        
        // Clean up session storage
        sessionStorage.removeItem('restoreRecipesScroll');
        sessionStorage.removeItem('navigatedFromRecipes');
        clearNavigationState();
      }
    }
  }, [setScrollKey, restoreScrollPosition, navigationState.shouldRestoreScroll, isLoading, recipes.length, clearNavigationState]);

  // Clear scroll position when layout changes
  useEffect(() => {
    const handleLayoutChange = () => {
      console.log('Layout changed, clearing scroll position');
      clearScrollPosition('recipes');
    };

    // Only clear if layout actually changed
    const savedLayout = localStorage.getItem('mobileRecipeLayout') || '1';
    if (savedLayout !== mobileLayout) {
      handleLayoutChange();
    }
  }, [mobileLayout, clearScrollPosition]);

  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-sage" />
            <span className="truncate">
              {currentHousehold ? `${currentHousehold.name} - My Recipes` : 'My Recipes'}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your saved recipe collection
          </p>
        </div>
        {user && currentHousehold && (
          <Button asChild className="bg-terracotta hover:bg-terracotta/90 w-full sm:w-auto">
            <Link to="/my-recipes/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Recipe
            </Link>
          </Button>
        )}
      </div>

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
            <Button asChild className="bg-terracotta hover:bg-terracotta/90">
              <Link to="/household">
                Manage Household
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <RecipeList 
          recipes={recipes}
          isLoading={isLoading}
          mobileLayout={isMobile ? mobileLayout : undefined}
        />
      )}
    </div>
  );
}
