
import { useState, useMemo } from "react";
import { Recipe, MealType, RecipeCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  onAddNewMeal?: () => void; // Optionally handle adding a new meal
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Group recipes by category, pre-filtered by search and relevant type
  const groupedRecipes = useMemo(() => {
    const byCategory: Record<string, Recipe[]> = {};
    recipes.forEach((recipe) => {
      recipe.categories.forEach((category) => {
        // Optionally filter by meal type (if you want only relevant ones)
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            Add {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              className="whitespace-nowrap"
              onClick={onAddNewMeal}
              type="button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Meal
            </Button>
          </div>

          <ScrollArea className="h-[320px] rounded-md border p-2">
            {groupedRecipes.length > 0 ? (
              <div className="space-y-2">
                {groupedRecipes.map(([category, recipeList]) => (
                  <div key={category}>
                    <div className="text-xs font-semibold text-navy mb-1">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {recipeList.map((recipe) => (
                        <button
                          key={recipe.id}
                          onClick={() => handleSelectRecipe(recipe.id)}
                          className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-accent transition"
                          type="button"
                        >
                          <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center">
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
                            <span className="block font-medium text-sm line-clamp-1">{recipe.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4 text-xs">No meals found</div>
            )}
          </ScrollArea>

          <div>
            <Input
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
