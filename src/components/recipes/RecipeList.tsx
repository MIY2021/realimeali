import { Recipe, RecipeCategory } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { ChevronDown, Columns } from "lucide-react";
import { AddToMealPlanDialog } from "./AddToMealPlanDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipeListProps {
  recipes: Recipe[];
  showActions?: boolean;
  isLoading?: boolean;
  mobileLayout?: string;
}

export function RecipeList({ 
  recipes, 
  showActions = false, 
  isLoading = false,
  mobileLayout 
}: RecipeListProps) {
  const { recipeCategories } = useHouseholdShopping();
  const isMobile = useIsMobile();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("date-newest");
  const [displayCount, setDisplayCount] = useState(12);
  
  // State for meal plan dialog
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealPlanDialogOpen, setMealPlanDialogOpen] = useState(false);

  // Mobile layout state - force re-render when changed
  const [localMobileLayout, setLocalMobileLayout] = useState<string>(() => {
    return localStorage.getItem('mobileRecipeLayout') || '1';
  });
  const [layoutKey, setLayoutKey] = useState(0); // Force re-render key

  // Use prop layout if provided, otherwise use local state
  const currentMobileLayout = mobileLayout || localMobileLayout;

  const handleMobileLayoutChange = (value: string) => {
    if (value) {
      setLocalMobileLayout(value);
      localStorage.setItem('mobileRecipeLayout', value);
      setLayoutKey(prev => prev + 1); // Force re-render
    }
  };

  // Force re-render when layout changes
  useEffect(() => {
    setLayoutKey(prev => prev + 1);
  }, [currentMobileLayout]);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || 
                          recipe.categories.includes(categoryFilter as any);

    return matchesSearch && matchesCategory;
  });

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortType === "title-asc") {
      return a.title.localeCompare(b.title);
    }
    if (sortType === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    if (sortType === "prep-asc") {
      return a.prepTime - b.prepTime;
    }
    if (sortType === "prep-desc") {
      return b.prepTime - a.prepTime;
    }
    if (sortType === "date-newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortType === "date-oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  const handleAddToMealPlan = (recipe: Recipe) => {
    console.log("Opening meal plan dialog for recipe:", recipe.title);
    setSelectedRecipe(recipe);
    setMealPlanDialogOpen(true);
  };

  const visibleRecipes = sortedRecipes.slice(0, displayCount);
  const hasMoreRecipes = displayCount < sortedRecipes.length;

  // Determine grid classes based on mobile layout or default responsive layout
  const getGridClasses = () => {
    if (isMobile) {
      // Mobile with layout preference
      return currentMobileLayout === '1' 
        ? 'grid grid-cols-1 gap-4 sm:gap-6'
        : 'grid grid-cols-2 gap-3 sm:gap-4';
    }
    // Default responsive layout for desktop
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6';
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
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          
          {/* Mobile Layout Dropdown - compact design */}
          {isMobile && (
            <Select value={currentMobileLayout} onValueChange={handleMobileLayoutChange}>
              <SelectTrigger className="w-[60px] h-10 px-2">
                <Columns className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Single Column</SelectItem>
                <SelectItem value="2">Two Columns</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="w-full sm:w-48 relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full border rounded p-2 pr-8 appearance-none bg-white text-sm sm:text-base"
          >
            <option value="all">All Categories</option>
            {recipeCategories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
        <div className="w-full sm:w-48">
          <Select value={sortType} onValueChange={setSortType}>
            <SelectTrigger className="text-sm sm:text-base">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="prep-asc">Prep Time (Low to High)</SelectItem>
              <SelectItem value="prep-desc">Prep Time (High to Low)</SelectItem>
              <SelectItem value="date-newest">Date Added (Newest)</SelectItem>
              <SelectItem value="date-oldest">Date Added (Oldest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div key={layoutKey} className={getGridClasses()} data-testid="recipe-list">
            {visibleRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onAddToMealPlan={() => handleAddToMealPlan(recipe)}
                showActions={false}
              />
            ))}
          </div>
          
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
