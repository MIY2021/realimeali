
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
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [initialRandomRecipes, setInitialRandomRecipes] = useState<any[]>([]);
  const [popularIngredients] = useState([
    "chicken", "beef", "pork", "salmon", "shrimp", "bacon", "cheese", 
    "tomato", "onion", "garlic", "potato", "rice", "pasta", "egg"
  ]);
  
  const { searchRecipes, getRandomRecipes, getCategories, recipes, isLoading } = useMealDBApi();

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      if (user && currentHousehold) {
        setCategoriesLoading(true);
        try {
          const categoriesData = await getCategories();
          const categoryNames = categoriesData.map((cat: any) => cat.strCategory);
          setCategories(categoryNames);
        } catch (error) {
          console.error("Failed to load categories:", error);
        } finally {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();
  }, [getCategories, user, currentHousehold]);

  // Load random recipes on mount only once
  useEffect(() => {
    if (user && currentHousehold && !hasInitialLoad) {
      console.log("Loading initial random recipes");
      const loadInitialRecipes = async () => {
        await getRandomRecipes(20); // Load more initial recipes for better variety
        setHasInitialLoad(true);
      };
      loadInitialRecipes();
    }
  }, [getRandomRecipes, user, currentHousehold, hasInitialLoad]);

  // Cache initial random recipes
  useEffect(() => {
    if (hasInitialLoad && recipes.length > 0 && initialRandomRecipes.length === 0) {
      setInitialRandomRecipes([...recipes]);
    }
  }, [recipes, hasInitialLoad, initialRandomRecipes.length]);

  // Auto-search when filters change (but not on initial load)
  useEffect(() => {
    if (hasInitialLoad) {
      const hasFilters = selectedCategory !== "all" || selectedArea !== "all" || selectedIngredient !== "all";
      
      if (hasFilters) {
        console.log("Filter changed, triggering search", { selectedCategory, selectedArea, selectedIngredient });
        searchRecipes({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          area: selectedArea !== "all" ? selectedArea : undefined,
          ingredient: selectedIngredient !== "all" ? selectedIngredient : undefined,
          number: 20
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedArea, selectedIngredient, hasInitialLoad]);

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
  };

  // Determine which recipes to show
  const displayRecipes = () => {
    const hasFilters = selectedCategory !== "all" || selectedArea !== "all" || selectedIngredient !== "all" || searchQuery.trim();
    
    if (!hasFilters && initialRandomRecipes.length > 0) {
      return initialRandomRecipes;
    }
    
    return recipes;
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
        categories={categories}
        categoriesLoading={categoriesLoading}
      />

      <MealDBRecipeList 
        recipes={displayRecipes()}
        isLoading={isLoading}
      />
    </>
  );
};
