
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { MealDBRecipeList } from "@/components/mealdb/MealDBRecipeList";
import { useMealDBApi } from "@/hooks/useMealDBApi";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function FindRecipesPage() {
  useDocumentTitle("Find Recipes | RealiMeali");
  
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

  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
            <Search className="h-6 w-6 sm:h-8 sm:w-8 text-terracotta" />
            <span>Find Recipes</span>
          </h1>
          <div className="flex items-start gap-2">
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover thousands of free recipes from TheMealDB
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Search by recipe name, ingredient, or use filters to find recipes. Filters automatically apply when selected.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="py-10 text-center px-4">
          <p className="text-muted-foreground mb-4">Please log in to discover and save recipes.</p>
        </div>
      ) : !currentHousehold ? (
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
      ) : (
        <>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search by recipe name or ingredient (e.g., 'chicken curry' or 'bacon')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                />
              </div>
              <Button onClick={handleSearch} className="bg-terracotta hover:bg-terracotta/90">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Category</SelectItem>
                  <SelectItem value="Beef">Beef</SelectItem>
                  <SelectItem value="Chicken">Chicken</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                  <SelectItem value="Lamb">Lamb</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                  <SelectItem value="Pasta">Pasta</SelectItem>
                  <SelectItem value="Pork">Pork</SelectItem>
                  <SelectItem value="Seafood">Seafood</SelectItem>
                  <SelectItem value="Side">Side</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Vegan">Vegan</SelectItem>
                  <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Goat">Goat</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Cuisine</SelectItem>
                  <SelectItem value="American">American</SelectItem>
                  <SelectItem value="British">British</SelectItem>
                  <SelectItem value="Canadian">Canadian</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                  <SelectItem value="Croatian">Croatian</SelectItem>
                  <SelectItem value="Dutch">Dutch</SelectItem>
                  <SelectItem value="Egyptian">Egyptian</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Greek">Greek</SelectItem>
                  <SelectItem value="Indian">Indian</SelectItem>
                  <SelectItem value="Irish">Irish</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                  <SelectItem value="Jamaican">Jamaican</SelectItem>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                  <SelectItem value="Kenyan">Kenyan</SelectItem>
                  <SelectItem value="Malaysian">Malaysian</SelectItem>
                  <SelectItem value="Mexican">Mexican</SelectItem>
                  <SelectItem value="Moroccan">Moroccan</SelectItem>
                  <SelectItem value="Polish">Polish</SelectItem>
                  <SelectItem value="Portuguese">Portuguese</SelectItem>
                  <SelectItem value="Russian">Russian</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="Thai">Thai</SelectItem>
                  <SelectItem value="Tunisian">Tunisian</SelectItem>
                  <SelectItem value="Turkish">Turkish</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                  <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Main Ingredient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Ingredient</SelectItem>
                  {popularIngredients.map((ingredient) => (
                    <SelectItem key={ingredient} value={ingredient}>
                      {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          <MealDBRecipeList 
            recipes={recipes}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
