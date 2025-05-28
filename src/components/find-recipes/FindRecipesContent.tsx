
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { CommunityRecipeCard } from "@/components/community/CommunityRecipeCard";
import { Link } from "react-router-dom";
import { FindRecipesFilters } from "./FindRecipesFilters";
import { Skeleton } from "@/components/ui/skeleton";

export const FindRecipesContent = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  
  const { recipes, isLoading, totalCount, fetchCommunityRecipes } = useCommunityRecipes();

  const RECIPES_PER_PAGE = 12;

  // Available categories and cuisines for filtering
  const [categories] = useState([
    "Breakfast", "Lunch", "Dinner", "Appetizer", "Dessert", "Snack", 
    "Beverage", "Soup", "Salad", "Side Dish", "Main Course"
  ]);

  const [cuisines] = useState([
    "American", "Italian", "Chinese", "Mexican", "Indian", "French", 
    "Thai", "Greek", "Japanese", "Mediterranean", "British", "Korean", 
    "Vietnamese", "Spanish", "Other"
  ]);

  // Load initial recipes
  useEffect(() => {
    if (user && currentHousehold) {
      loadRecipes(true);
    }
  }, [user, currentHousehold]);

  // Load recipes with current filters
  const loadRecipes = async (reset = false) => {
    const offset = reset ? 0 : currentPage * RECIPES_PER_PAGE;
    
    const filters = {
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      cuisine: selectedCuisine !== "all" ? selectedCuisine : undefined,
      search: searchQuery.trim() || undefined,
      limit: RECIPES_PER_PAGE,
      offset: offset
    };

    await fetchCommunityRecipes(filters);
    
    if (reset) {
      setAllRecipes(recipes);
      setCurrentPage(0);
    } else {
      setAllRecipes(prev => [...prev, ...recipes]);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Handle search
  const handleSearch = () => {
    loadRecipes(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedCuisine("all");
    setCurrentPage(0);
    setAllRecipes([]);
    loadRecipes(true);
  };

  // Load more recipes
  const handleLoadMore = () => {
    loadRecipes(false);
  };

  // Auto-search when filters change
  useEffect(() => {
    if (user && currentHousehold) {
      const timeoutId = setTimeout(() => {
        loadRecipes(true);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedCategory, selectedCuisine]);

  if (!user) {
    return (
      <div className="py-10 text-center px-4">
        <p className="text-muted-foreground mb-4">Please log in to discover and save recipes.</p>
      </div>
    );
  }

  if (!currentHousehold) {
    return (
      <div className="py-10 text-center px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-navy mb-2">No Household Selected</h2>
          <p className="text-muted-foreground mb-6">
            You need to create or join a household to discover and save recipes.
          </p>
          <Button asChild className="bg-terracotta hover:bg-terracotta/90">
            <Link to="/household">
              Manage Household
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayRecipes = currentPage === 0 ? recipes : allRecipes;
  const hasMore = displayRecipes.length < totalCount;

  return (
    <>
      <FindRecipesFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedArea={selectedCuisine}
        setSelectedArea={setSelectedCuisine}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        onKeyPress={handleKeyPress}
        popularIngredients={[]} // Not used for community recipes
        categories={categories}
        categoriesLoading={false}
      />

      <div className="space-y-6">
        {/* Recipe count display */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {displayRecipes.length > 0 
              ? `Showing ${displayRecipes.length} of ${totalCount} community recipes`
              : 'No community recipes found'
            }
          </p>
        </div>

        {/* Recipe grid */}
        {isLoading && displayRecipes.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : displayRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">No recipes found</p>
            <p className="text-sm text-muted-foreground">
              Be the first to share a recipe! Use the "Add Recipe" feature to import and share recipes with the community.
            </p>
            <Button asChild className="mt-4 bg-terracotta hover:bg-terracotta/90">
              <Link to="/create-recipe">
                Add Your First Recipe
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayRecipes.map((recipe) => (
              <CommunityRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* Load more section */}
        {hasMore && !isLoading && (
          <div className="flex flex-col items-center gap-4 pt-4">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="px-8"
            >
              Load More Recipes
            </Button>
          </div>
        )}

        {/* Loading indicator for load more */}
        {isLoading && displayRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`loading-${i}`} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
