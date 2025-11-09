
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Recipe, MealType, CuisineRegion } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RecipeCard } from "@/components/recipes/RecipeCard";

interface AddRecipeToMealModalProps {
  open: boolean;
  onClose: () => void;
  mealSlot: {
    date: string;
    mealType: MealType;
  };
  onAddRecipe: (recipeId: string, servings: number) => Promise<void>;
}

export function AddRecipeToMealModal({
  open,
  onClose,
  mealSlot,
  onAddRecipe,
}: AddRecipeToMealModalProps) {
  const { recipes, isLoading, error } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedCuisineRegion, setSelectedCuisineRegion] = useState<CuisineRegion | null>(null);

  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks", "sides", "desserts", "drinks"];
  const cuisineRegions: CuisineRegion[] = ["british", "italian", "chinese", "mexican", "indian", "mediterranean", "american", "french", "middle_eastern", "greek"];

  useEffect(() => {
    if (error) {
      console.error("Error fetching recipes:", error);
    }
  }, [error]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const searchRegex = new RegExp(searchTerm, "i");
      if (!searchRegex.test(recipe.title) && !searchRegex.test(recipe.description)) {
        return false;
      }

      if (selectedMealType && !((recipe.meal_types && recipe.meal_types.includes(selectedMealType)) || recipe.meal_type === selectedMealType)) return false;
      if (selectedCuisineRegion && recipe.cuisine_region !== selectedCuisineRegion) return false;

      return true;
    });
  }, [recipes, searchTerm, selectedMealType, selectedCuisineRegion]);

  const handleRecipeSelect = async (recipe: Recipe) => {
    await onAddRecipe(recipe.id, recipe.servings);
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-white border-white">
          <DialogHeader>
            <DialogTitle>Add Recipe to {mealSlot.mealType}</DialogTitle>
            <DialogDescription>Loading recipes...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] sm:max-h-[90%] bg-white border-white">
        <DialogHeader>
          <DialogTitle>Add Recipe to {mealSlot.mealType}</DialogTitle>
          <DialogDescription>
            Choose a recipe to add to your meal plan for {mealSlot.date}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search Recipes</Label>
              <Input
                type="search"
                id="search"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select
                  value={selectedMealType || undefined}
                  onValueChange={(value) =>
                    setSelectedMealType(value === "all" ? null : (value as MealType))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    {selectedMealType ? selectedMealType : "All Meal Types"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meal Types</SelectItem>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Select
                  value={selectedCuisineRegion || undefined}
                  onValueChange={(value) =>
                    setSelectedCuisineRegion(value === "all" ? null : (value as CuisineRegion))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    {selectedCuisineRegion ? selectedCuisineRegion : "All Cuisines"}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cuisines</SelectItem>
                    {cuisineRegions.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border rounded-md">
            <ScrollArea className="h-[400px] sm:h-[500px] p-4">
              {filteredRecipes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recipes found matching your criteria.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onAddToMealPlan={() => handleRecipeSelect(recipe)}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
