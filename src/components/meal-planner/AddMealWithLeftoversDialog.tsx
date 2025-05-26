
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Recipe, MealType, RecipeCategory } from "@/types";

interface AddMealWithLeftoversDialogProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string, leftoverServings?: number) => void;
}

// Define meal type category mappings
const mealTypeToCategories: Record<MealType, RecipeCategory[]> = {
  dinner: [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", 
    "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", "Faffy", 
    "Pricey!", "Not Yet Made", "Lunch"
  ],
  lunch: [
    "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", 
    "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", "Faffy", 
    "Pricey!", "Not Yet Made", "Lunch"
  ],
  breakfast: ["Breakfast"],
  snacks: ["Snacks"],
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

  // Filter recipes based on meal type categories and search term
  const allowedCategories = mealTypeToCategories[mealType];
  const filteredRecipes = recipes.filter(recipe => {
    // Check if recipe has any category that's allowed for this meal type
    const hasAllowedCategory = recipe.categories.some(cat => 
      allowedCategories.includes(cat as RecipeCategory)
    );
    
    // Check search term
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return hasAllowedCategory && matchesSearch;
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
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search recipes</Label>
            <Input
              id="search"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredRecipes.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No {mealType} recipes found. Try adjusting your search or create recipes with appropriate categories.
              </div>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRecipeId === recipe.id
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedRecipeId(recipe.id)}
                >
                  <div className="font-medium">{recipe.title}</div>
                  <div className="text-sm text-gray-600">
                    {recipe.servings} servings • {recipe.categories.join(", ")}
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
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedRecipeId}
              className="flex-1"
            >
              Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
