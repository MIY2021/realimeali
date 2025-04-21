
import { useState, useMemo } from "react";
import { Recipe, MealType } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

interface AddMealPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMealPlan: (recipeId: string, notes: string) => void;
  recipes: Recipe[];
  selectedDate: Date;
  selectedMealType: MealType;
  onAddNewMeal?: () => void;
}

export function AddMealPlanDialog({
  isOpen,
  onClose,
  onAddMealPlan,
  recipes,
  selectedDate,
  selectedMealType,
  onAddNewMeal,
}: AddMealPlanDialogProps) {
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Group recipes by category, pre-filtered by search and relevant type
  const groupedRecipes = useMemo(() => {
    const byCategory: Record<string, Recipe[]> = {};
    recipes.forEach((recipe) => {
      recipe.categories.forEach((category) => {
        // Filter by search term if provided
        if (
          searchTerm.trim() === "" ||
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          if (!byCategory[category]) byCategory[category] = [];
          byCategory[category].push(recipe);
        }
      });
    });
    // Sort categories alphabetically
    return Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b));
  }, [recipes, searchTerm]);

  const handleSelectRecipe = (recipeId: string) => {
    onAddMealPlan(recipeId, notes);
    setSearchTerm("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              Select {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={onAddNewMeal}
              type="button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Meal
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
          <Input
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-shrink-0"
          />

          <ScrollArea className="flex-1 rounded-md border p-2">
            {groupedRecipes.length > 0 ? (
              <div className="space-y-4">
                {groupedRecipes.map(([category, recipeList]) => (
                  <div key={category}>
                    <div className="text-sm font-semibold text-navy mb-2 sticky top-0 bg-background p-1 border-b">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {recipeList.map((recipe) => (
                        <button
                          key={recipe.id}
                          onClick={() => handleSelectRecipe(recipe.id)}
                          className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-accent transition border"
                          type="button"
                        >
                          <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center">
                            {recipe.image ? (
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">No image</span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="block font-medium text-sm line-clamp-2">{recipe.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {recipe.prepTime + recipe.cookTime} min • {recipe.servings} servings
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4 text-sm">No meals found</div>
            )}
          </ScrollArea>

          <div className="flex-shrink-0">
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
