
import { useState } from "react";
import { Recipe, MealType, RecipeCategory } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Users, ChevronDown, ArrowLeft, X, Search } from "lucide-react";
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
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-full p-0 flex flex-col">
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <SheetTitle className="text-lg font-semibold">
                Add Recipe to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </SheetTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="p-2 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Fixed Filters */}
        <div className="flex-shrink-0 p-4 border-b bg-gray-50">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
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
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
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

        {/* Scrollable Recipe List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
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
              <div className="space-y-3">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectRecipe(recipe.id)}
                  >
                    <div className="flex items-start gap-4">
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base text-navy mb-1 truncate">{recipe.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prepTime + recipe.cookTime}min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {recipe.categories.slice(0, 3).map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center rounded-full bg-sage/20 px-2 py-0.5 text-xs font-medium text-sage"
                            >
                              {category}
                            </span>
                          ))}
                          {recipe.categories.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{recipe.categories.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
