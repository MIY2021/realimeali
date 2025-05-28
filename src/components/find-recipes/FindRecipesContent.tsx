
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { MealDBRecipeList } from "@/components/mealdb/MealDBRecipeList";
import { useMealDBApi } from "@/hooks/useMealDBApi";
import { Link } from "react-router-dom";
import { FindRecipesFilters } from "./FindRecipesFilters";

export const FindRecipesContent = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedIngredient, setSelectedIngredient] = useState("all");
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [popularIngredients] = useState([
    "chicken", "beef", "pork", "salmon", "shrimp", "bacon", "cheese", 
    "tomato", "onion", "garlic", "potato", "rice", "pasta", "egg"
  ]);
  
  const { searchRecipes, getRandomRecipes, recipes, isLoading } = useMealDBApi();

  // Load random recipes on mount only once
  useEffect(() => {
    if (user && currentHousehold && !hasInitialLoad) {
      console.log("Loading initial random recipes");
      getRandomRecipes(12);
      setHasInitialLoad(true);
    }
  }, [getRandomRecipes, user, currentHousehold, hasInitialLoad]);

  // Auto-search when filters change (but not on initial load)
  useEffect(() => {
    if (hasInitialLoad && (selectedCategory !== "all" || selectedArea !== "all" || selectedIngredient !== "all")) {
      console.log("Filter changed, triggering search", { selectedCategory, selectedArea, selectedIngredient });
      searchRecipes({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        area: selectedArea !== "all" ? selectedArea : undefined,
        ingredient: selectedIngredient !== "all" ? selectedIngredient : undefined,
        number: 20
      });
    }
  }, [selectedCategory, selectedArea, selectedIngredient, hasInitialLoad, searchRecipes]);

  const handleSearch = () => {
    const hasQuery = searchQuery.trim();
    const hasCategory = selectedCategory && selectedCategory !== "all";
    const hasArea = selectedArea && selectedArea !== "all";
    const hasIngredient = selectedIngredient && selectedIngredient !== "all";
    
    if (hasQuery || hasCategory || hasArea || hasIngredient) {
      searchRecipes({
        query: hasQuery ? searchQuery : undefined,
        category: hasCategory ? selectedCategory : undefined,
        area: hasArea ? selectedArea : undefined,
        ingredient: hasIngredient ? selectedIngredient : undefined,
        number: 20
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedArea("all");
    setSelectedIngredient("all");
    getRandomRecipes(12);
  };

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

  return (
    <>
      <FindRecipesFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedArea={selectedArea}
        setSelectedArea={setSelectedArea}
        selectedIngredient={selectedIngredient}
        setSelectedIngredient={setSelectedIngredient}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        onKeyPress={handleKeyPress}
        popularIngredients={popularIngredients}
      />

      <MealDBRecipeList 
        recipes={recipes}
        isLoading={isLoading}
      />
    </>
  );
};
