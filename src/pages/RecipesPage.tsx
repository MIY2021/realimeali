import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { RecipeList } from "@/components/recipes/RecipeList";
import { RecipeFilters } from "@/components/recipes/RecipeFilters";
import { useRecipes } from "@/contexts/RecipesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { useMetaTags } from "@/hooks/useMetaTags";
import { MetaTagUtils } from "@/utils/metaTagUtils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Recipe, MealType, CuisineRegion, DietLifestyle, ComplexityLevel } from "@/types";
import { useMobileLayout } from "@/hooks/useMobileLayout";
import { MobileLayoutSelector } from "@/components/recipes/MobileLayoutSelector";
import { ToggleRecipeFilters } from "@/components/recipes/ToggleRecipeFilters";

export default function RecipesPage() {
  const navigate = useNavigate();
  const { recipes, isLoading } = useRecipes();
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { layout, setLayout } = useMobileLayout();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineRegion[]>([]);
  const [selectedDietLifestyle, setSelectedDietLifestyle] = useState<DietLifestyle[]>([]);
  const [selectedComplexity, setSelectedComplexity] = useState<ComplexityLevel[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Generate meta tags for My Recipes page
  const householdRecipes = currentHousehold 
    ? recipes.filter(recipe => recipe.household_id === currentHousehold.id)
    : [];
  
  const metaTags = MetaTagUtils.generateMyRecipesMetaTags(householdRecipes.length, currentHousehold || undefined);
  useMetaTags(metaTags);

  
  useDocumentTitle(currentHousehold ? `My Recipes - ${currentHousehold.name} | RealiMeali` : "My Recipes | RealiMeali");

  const filteredRecipes = recipes.filter((recipe) => {
    if (!currentHousehold || recipe.household_id !== currentHousehold.id) {
      return false;
    }

    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesMealType = selectedMealTypes.length === 0 || 
      (recipe.meal_type && selectedMealTypes.includes(recipe.meal_type));

    const matchesCuisine = selectedCuisines.length === 0 || 
      (recipe.cuisine_region && selectedCuisines.includes(recipe.cuisine_region));

    const matchesDietLifestyle = selectedDietLifestyle.length === 0 || 
      (recipe.diet_lifestyle && selectedDietLifestyle.some(diet => recipe.diet_lifestyle?.includes(diet)));

    const matchesComplexity = selectedComplexity.length === 0 || 
      (recipe.complexity_level && selectedComplexity.includes(recipe.complexity_level));

    const matchesFavorites = !showFavorites || recipe.is_favorite;

    return matchesSearch && matchesMealType && matchesCuisine && 
           matchesDietLifestyle && matchesComplexity && matchesFavorites;
  });

  const handleAddToMealPlan = (recipe: Recipe) => {
    navigate(`/my-recipes/${recipe.slug || recipe.id}`);
  };

  const clearFilters = () => {
    setSelectedMealTypes([]);
    setSelectedCuisines([]);
    setSelectedDietLifestyle([]);
    setSelectedComplexity([]);
    setShowFavorites(false);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedMealTypes.length > 0 || 
                          selectedCuisines.length > 0 || 
                          selectedDietLifestyle.length > 0 || 
                          selectedComplexity.length > 0 || 
                          showFavorites;

  if (!user || !currentHousehold) {
    return (
      <div className="container max-w-7xl py-8 px-6">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in and select a household to view recipes.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-7xl py-8 px-6">
        <div className="text-center">
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">My Recipes</h1>
          <p className="text-muted-foreground">
            {currentHousehold.name} • {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => navigate("/my-recipes/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search recipes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ToggleRecipeFilters 
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
          />
          
          <MobileLayoutSelector layout={layout} setLayout={setLayout} />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <RecipeFilters
          selectedMealTypes={selectedMealTypes}
          setSelectedMealTypes={setSelectedMealTypes}
          selectedCuisines={selectedCuisines}
          setSelectedCuisines={setSelectedCuisines}
          selectedDietLifestyle={selectedDietLifestyle}
          setSelectedDietLifestyle={setSelectedDietLifestyle}
          selectedComplexity={selectedComplexity}
          setSelectedComplexity={setSelectedComplexity}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Recipes Display */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters || searchTerm
              ? "Try adjusting your search or filters to find more recipes."
              : "You haven't added any recipes yet. Start by creating your first recipe!"}
          </p>
          <Button onClick={() => navigate("/my-recipes/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Recipe
          </Button>
        </div>
      ) : (
        <>
          {layout === 'grid' ? (
            <RecipeGrid 
              recipes={filteredRecipes} 
              onAddToMealPlan={handleAddToMealPlan}
            />
          ) : (
            <RecipeList 
              recipes={filteredRecipes} 
              onAddToMealPlan={handleAddToMealPlan}
            />
          )}
        </>
      )}
    </div>
  );
}
