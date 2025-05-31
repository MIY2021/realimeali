
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recipe, MealType } from "@/types";

interface SimpleMealSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner", 
  snacks: "Snacks",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks"
};

export function SimpleMealSelectionDialog({
  open,
  onClose,
  mealType,
  recipes,
  onSelectRecipe,
}: SimpleMealSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter recipes by meal type and search term
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMealType = recipe.meal_type === mealType || (!recipe.meal_type && mealType === "dinner");
    return matchesSearch && matchesMealType;
  });

  const handleSelectRecipe = (recipeId: string) => {
    onSelectRecipe(recipeId);
    onClose();
    setSearchTerm("");
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {MEAL_TYPE_LABELS[mealType]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <ScrollArea className="h-[300px]">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No recipes found for {MEAL_TYPE_LABELS[mealType]}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectRecipe(recipe.id)}
                  >
                    <div className="flex gap-3">
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{recipe.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">
                          {recipe.servings} servings • {recipe.prep_time + recipe.cook_time} min
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
