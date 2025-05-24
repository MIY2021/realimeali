
import { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MealType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { ChevronDown } from "lucide-react";

interface RecipeListProps {
  recipes: Recipe[];
  onAddToMealPlan?: (recipe: Recipe, mealType: MealType, week: 1 | 2) => void;
}

export function RecipeList({ recipes, onAddToMealPlan }: RecipeListProps) {
  const { recipeCategories } = useHouseholdShopping();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortType, setSortType] = useState<string>("title-asc");
  const [displayCount, setDisplayCount] = useState(10);
  
  // New state for meal plan dialog
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [mealTypeDialogOpen, setMealTypeDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<1 | 2 | null>(null);
  const { toast } = useToast();

  // Get categories from household context instead of hardcoded array
  const allCategories = recipeCategories.map(cat => cat.name);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || 
                          recipe.categories.includes(categoryFilter as any);

    return matchesSearch && matchesCategory;
  });

  // Sort recipes
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
    return 0;
  });

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  // New handlers for meal plan dialog
  const handleAddToMealPlan = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setMealTypeDialogOpen(true);
    setSelectedWeek(null);
  };

  const handleSelectMealType = (mealType: MealType) => {
    if (!selectedWeek) {
      toast({
        title: "Select Week",
        description: "Please select which week to add this meal to.",
        variant: "destructive"
      });
      return;
    }

    if (selectedRecipe && onAddToMealPlan) {
      onAddToMealPlan(selectedRecipe, mealType, selectedWeek);
      setMealTypeDialogOpen(false);
      setSelectedRecipe(null);
      setSelectedWeek(null);
    }
  };

  const visibleRecipes = sortedRecipes.slice(0, displayCount);
  const hasMoreRecipes = displayCount < sortedRecipes.length;
  const mealTypes: MealType[] = ["dinner", "lunch", "breakfast", "snacks"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48 relative">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full border rounded p-2 pr-8 appearance-none bg-white"
          >
            <option value="all">All Categories</option>
            {allCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
      </div>
      {sortedRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onAddToMealPlan={() => handleAddToMealPlan(recipe)} 
              />
            ))}
          </div>
          
          {hasMoreRecipes && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} variant="outline">
                Load More Recipes
              </Button>
            </div>
          )}
        </>
      )}

      {/* Meal Type Dialog - Improved mobile layout */}
      <Dialog open={mealTypeDialogOpen} onOpenChange={setMealTypeDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Add to Meal Plan
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <div className="text-base font-semibold mb-1">{selectedRecipe?.title}</div>
            <div className="text-sm text-muted-foreground">{selectedRecipe?.description}</div>
          </div>
          <div className="flex flex-col gap-3 mb-3">
            <label className="font-semibold text-sm">Select Week</label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((wk) => (
                <Button
                  key={wk}
                  variant={selectedWeek === wk ? "default" : "outline"}
                  className={selectedWeek === wk ? "bg-terracotta text-white" : ""}
                  onClick={() => setSelectedWeek(wk as 1 | 2)}
                >
                  Week {wk}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mealTypes.map(type => (
              <Button 
                key={type} 
                onClick={() => handleSelectMealType(type)}
                className="capitalize"
                variant="outline"
              >
                {type}
              </Button>
            ))}
            <Button 
              variant="outline" 
              onClick={() => setMealTypeDialogOpen(false)}
              className="col-span-2"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
