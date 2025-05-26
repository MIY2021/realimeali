
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed, LayoutGrid } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function RecipesPage() {
  useDocumentTitle("Recipes | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { recipes, isLoading } = useRecipes();
  const { restoreScrollPosition, setScrollKey } = useScrollPosition();
  const { navigationState } = useNavigationState();
  const isMobile = useIsMobile();

  // Mobile layout state
  const [mobileLayout, setMobileLayout] = useState<string>(() => {
    return localStorage.getItem('mobileRecipeLayout') || '1';
  });

  // Load recipes automatically
  useRecipesLoader();

  // Set up scroll position tracking for this page
  useEffect(() => {
    setScrollKey('recipes');
    
    // Check if we should restore scroll position
    if (navigationState.shouldRestoreScroll || sessionStorage.getItem('restoreRecipesScroll') === 'true') {
      console.log('Restoring scroll position on recipes page');
      restoreScrollPosition('recipes');
      sessionStorage.removeItem('restoreRecipesScroll');
    }
  }, [setScrollKey, restoreScrollPosition, navigationState.shouldRestoreScroll]);

  // Handle mobile layout change
  const handleMobileLayoutChange = (value: string) => {
    if (value) {
      setMobileLayout(value);
      localStorage.setItem('mobileRecipeLayout', value);
    }
  };

  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="truncate">
              {currentHousehold ? `${currentHousehold.name} Recipes` : 'Recipes'}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover and manage your recipe collection
          </p>
        </div>
        {user && currentHousehold && (
          <Button asChild className="bg-terracotta hover:bg-terracotta/90 w-full sm:w-auto">
            <Link to="/recipes/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Recipe
            </Link>
          </Button>
        )}
      </div>

      {/* Mobile Layout Toggle */}
      {isMobile && (
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="h-4 w-4" />
          <span className="text-sm font-medium">Layout:</span>
          <ToggleGroup 
            type="single" 
            value={mobileLayout} 
            onValueChange={handleMobileLayoutChange}
            className="border rounded-md p-1"
          >
            <ToggleGroupItem value="1" aria-label="Single column" className="text-xs px-3 py-1">
              1 Col
            </ToggleGroupItem>
            <ToggleGroupItem value="2" aria-label="Two columns" className="text-xs px-3 py-1">
              2 Col
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {!user ? (
        <div className="py-10 text-center px-4">
          <p className="text-muted-foreground mb-4">Please log in to view and manage recipes.</p>
        </div>
      ) : !currentHousehold ? (
        <div className="py-10 text-center px-4">
          <p className="text-muted-foreground mb-4">Please create or select a household to view recipes.</p>
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
