
import { useState } from "react";
import { Recipe, MealType, RecipeCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Users, ChevronDown, ArrowLeft, X } from "lucide-react";
import { getAllowedCategoriesForMealType } from "@/utils/mealCategoryUtils";

interface EnhancedAddRecipeToMealModalProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
}

export function EnhancedAddRecipeToMealModal({
  open,
  onClose,
  mealType,
  recipes,
  onSelectRecipe,
}: EnhancedAddRecipeToMealModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get allowed categories for this meal type
  const allowedCategories = getAllowedCategoriesForMealType(mealType);
  
  // Filter recipes based on meal type categories
  const mealTypeFilteredRecipes = recipes.filter(recipe => 
    allowedCategories.some(category => recipe.categories.includes(category))
  );

  console.log(`Filtering recipes for ${mealType}:`);
  console.log("Allowed categories:", allowedCategories);
  console.log("Filtered recipes count:", mealTypeFilteredRecipes.length);

  // Get categories that exist in the filtered recipes
  const availableCategories = [...new Set(
    mealTypeFilteredRecipes.flatMap(r => r.categories.filter(cat => allowedCategories.includes(cat)))
  )];

  const filteredRecipes = mealTypeFilteredRecipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || 
                          recipe.categories.includes(categoryFilter as RecipeCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSelectRecipe = (recipeId: string) => {
    onSelectRecipe(recipeId);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[100vw] h-[100vh] max-w-none max-h-none m-0 p-0 rounded-none">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 p-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClose}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <DialogTitle className="text-xl font-semibold">
                  Add Recipe to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </DialogTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Filters */}
          <div className="flex-shrink-0 p-6 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 max-w-4xl">
              <div className="flex-1">
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-64 relative">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full border rounded-md p-2 pr-8 appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>
            
            {mealTypeFilteredRecipes.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>No recipes available for {mealType}.</strong> 
                  {mealType === 'dinner' 
                    ? " Make sure you have recipes that aren't specifically marked as breakfast, lunch, or snacks."
                    : ` Please add recipes with the "${mealType}" category.`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Recipe List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {mealTypeFilteredRecipes.length === 0 
                    ? `No recipes available for ${mealType}` 
                    : "No recipes match your search"
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm("")}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 max-w-4xl">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="border rounded-lg p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectRecipe(recipe.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-navy mb-2">{recipe.title}</h4>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {recipe.prepTime + recipe.cookTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {recipe.servings} servings
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recipe.categories.slice(0, 4).map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center rounded-full bg-sage/20 px-3 py-1 text-sm font-medium text-sage"
                            >
                              {category}
                            </span>
                          ))}
                          {recipe.categories.length > 4 && (
                            <span className="text-sm text-muted-foreground">
                              +{recipe.categories.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-24 h-24 object-cover rounded-md ml-6 flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
