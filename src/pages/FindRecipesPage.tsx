
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { SpoonacularRecipeList } from "@/components/spoonacular/SpoonacularRecipeList";
import { useSpoonacularApi } from "@/hooks/useSpoonacularApi";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FindRecipesPage() {
  useDocumentTitle("Find Recipes | RealiMeali");
  
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const { searchRecipes, getPopularRecipes, recipes, isLoading } = useSpoonacularApi();

  // Load popular recipes on mount
  useEffect(() => {
    getPopularRecipes(12);
  }, [getPopularRecipes]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchRecipes({
        query: searchQuery,
        diet: selectedDiet,
        cuisine: selectedCuisine,
        type: selectedType,
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
    setSelectedDiet("");
    setSelectedCuisine("");
    setSelectedType("");
    getPopularRecipes(12);
  };

  return (
    <div className="container max-w-7xl py-4 px-4 sm:py-8 sm:px-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy flex items-center gap-2">
            <Search className="h-6 w-6 sm:h-8 sm:w-8 text-terracotta" />
            <span>Find Recipes</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover thousands of recipes from around the world
          </p>
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
                  placeholder="Search for recipes, ingredients, or dishes..."
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
              <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Diet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Diet</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="gluten free">Gluten Free</SelectItem>
                  <SelectItem value="ketogenic">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Cuisine</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Type</SelectItem>
                  <SelectItem value="main course">Main Course</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="appetizer">Appetizer</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          <SpoonacularRecipeList 
            recipes={recipes}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
