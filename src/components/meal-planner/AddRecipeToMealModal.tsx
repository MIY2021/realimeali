
import { useState } from "react";
import { Recipe, MealType, RecipeCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Users, ChevronDown } from "lucide-react";

interface AddRecipeToMealModalProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
}

// All available categories - ensures all categories show even if no recipes exist
const ALL_RECIPE_CATEGORIES: RecipeCategory[] = [
  "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", 
  "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", 
  "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
];

export function AddRecipeToMealModal({
  open,
  onClose,
  mealType,
  recipes,
  onSelectRecipe,
}: AddRecipeToMealModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get all categories that exist in recipes plus all standard categories
  const usedCategories = [...new Set(recipes.flatMap(r => r.categories))];
  const allCategories = [...new Set([...ALL_RECIPE_CATEGORIES, ...usedCategories])];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || 
                          recipe.categories.includes(categoryFilter as RecipeCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSelectRecipe = (recipeId: string) => {
    onSelectRecipe(recipeId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Recipe to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

        <div className="flex-1 overflow-y-auto">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recipes found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectRecipe(recipe.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-navy mb-1">{recipe.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {recipe.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.prepTime + recipe.cookTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {recipe.servings} servings
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.categories.slice(0, 3).map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center rounded-full bg-sage/20 px-2 py-1 text-xs font-medium text-sage"
                          >
                            {category}
                          </span>
                        ))}
                        {recipe.categories.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{recipe.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-16 h-16 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
