
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Recipe, MealType } from "@/types";
import { getDisplayLabel } from "@/utils/recipeClassification";

interface AddMealWithLeftoversDialogProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string, leftoverServings?: number) => void;
}

const getMealTypeFilterForRecipes = (mealType: MealType): boolean => {
  // For meal planning, we can use any recipe type but prioritize appropriate ones
  return true;
};

export function AddMealWithLeftoversDialog({
  open,
  onClose,
  mealType,
  recipes,
  onSelectRecipe,
}: AddMealWithLeftoversDialogProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [useLeftovers, setUseLeftovers] = useState(false);
  const [leftoverServings, setLeftoverServings] = useState([2]);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
  const maxLeftoverServings = selectedRecipe ? selectedRecipe.servings - 1 : 1;

  // Filter recipes based on search term and meal type appropriateness
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.mealType && getDisplayLabel(recipe.mealType, 'mealType').toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && getMealTypeFilterForRecipes(mealType);
  });

  const handleSubmit = () => {
    if (selectedRecipeId) {
      const leftoverAmount = mealType === 'dinner' && useLeftovers ? leftoverServings[0] : undefined;
      onSelectRecipe(selectedRecipeId, leftoverAmount);
      
      // Reset form
      setSelectedRecipeId("");
      setUseLeftovers(false);
      setLeftoverServings([2]);
      setSearchTerm("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search" className="text-sm font-medium">Search recipes</Label>
            <Input
              id="search"
              placeholder="Search by name or meal type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
              autoFocus={false}
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredRecipes.length === 0 ? (
              <div className="text-center text-gray-500 py-6 px-4">
                <p className="text-sm">
                  No recipes found. Try adjusting your search.
                </p>
              </div>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors touch-manipulation ${
                    selectedRecipeId === recipe.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-gray-300 active:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRecipeId(recipe.id)}
                >
                  <div className="font-medium text-sm leading-tight">{recipe.title}</div>
                  <div className="text-xs text-gray-600 mt-1 leading-tight">
                    {recipe.servings} servings
                    {recipe.mealType && ` • ${getDisplayLabel(recipe.mealType, 'mealType')}`}
                    {recipe.cuisineRegion && ` • ${getDisplayLabel(recipe.cuisineRegion, 'cuisineRegion')}`}
                  </div>
                </div>
              ))
            )}
          </div>

          {mealType === 'dinner' && selectedRecipe && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useLeftovers"
                  checked={useLeftovers}
                  onCheckedChange={(checked) => setUseLeftovers(checked as boolean)}
                />
                <Label htmlFor="useLeftovers" className="text-sm font-medium">
                  Use some servings for lunch tomorrow?
                </Label>
              </div>
              
              {useLeftovers && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Leftover servings for lunch: {leftoverServings[0]}
                  </Label>
                  <Slider
                    value={leftoverServings}
                    onValueChange={setLeftoverServings}
                    max={maxLeftoverServings}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-600">
                    Dinner: {selectedRecipe.servings - leftoverServings[0]} servings, 
                    Lunch: {leftoverServings[0]} servings
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedRecipeId}
              className="flex-1 h-11"
            >
              Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
