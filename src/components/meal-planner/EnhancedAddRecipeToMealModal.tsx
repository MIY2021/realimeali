
import { useState } from "react";
import { Recipe, MealType } from "@/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Users, ChevronDown, ArrowLeft, X, Search } from "lucide-react";
import { getDisplayLabel } from "@/utils/recipeClassification";

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
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all");

  // Get meal types that exist in the recipes
  const availableMealTypes = [...new Set(
    recipes.filter(r => r.meal_type).map(r => r.meal_type!)
  )];

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMealType = mealTypeFilter === "all" || recipe.meal_type === mealTypeFilter;
    return matchesSearch && matchesMealType;
  });

  const handleSelectRecipe = (recipeId: string) => {
    onSelectRecipe(recipeId);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setMealTypeFilter("all");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-full p-0 flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <SheetTitle className="text-lg font-semibold">
              Add to {getDisplayLabel(mealType, 'mealType')}
            </SheetTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 space-y-3 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          
          <div className="relative">
            <select
              value={mealTypeFilter}
              onChange={e => setMealTypeFilter(e.target.value)}
              className="w-full border rounded-lg p-3 pr-10 appearance-none bg-white text-sm"
            >
              <option value="all">All Meal Types</option>
              {availableMealTypes.map((type) => (
                <option key={type} value={type}>
                  {getDisplayLabel(type, 'mealType')}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
          </div>
        </div>

        {/* Recipe List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-sm">
                  No recipes found matching your search
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                    onClick={() => handleSelectRecipe(recipe.id)}
                  >
                    <div className="flex gap-4">
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base text-gray-900 mb-1 line-clamp-1">
                          {recipe.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {recipe.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recipe.prep_time + recipe.cook_time} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings} servings
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {recipe.meal_type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getDisplayLabel(recipe.meal_type, 'mealType')}
                            </span>
                          )}
                          {recipe.complexity_level && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {getDisplayLabel(recipe.complexity_level, 'complexityLevel')}
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
