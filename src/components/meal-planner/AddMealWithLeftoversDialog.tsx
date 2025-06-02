
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Recipe } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";

interface AddMealWithLeftoversDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMeal: (mealType: string, recipeName: string) => void;
}

export function AddMealWithLeftoversDialog({
  open,
  onOpenChange,
  onAddMeal,
}: AddMealWithLeftoversDialogProps) {
  const { recipes } = useRecipes();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedCuisineRegion, setSelectedCuisineRegion] = useState("");

  const filteredRecipes = recipes.filter((recipe) => {
    const searchRegex = new RegExp(searchTerm, "i");
    if (!searchRegex.test(recipe.title) && !searchRegex.test(recipe.description)) return false;

    if (selectedMealType && recipe.meal_type !== selectedMealType) return false;
    if (selectedCuisineRegion && recipe.cuisine_region !== selectedCuisineRegion) return false;

    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Meal with Leftovers</DialogTitle>
          <DialogDescription>
            Select a recipe to add as a meal with leftovers.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search" className="text-right">
              Search
            </Label>
            <Input
              type="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes..."
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mealType" className="text-right">
              Meal Type
            </Label>
            <Select onValueChange={setSelectedMealType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
                <SelectItem value="sides">Sides</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="drinks">Drinks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cuisine" className="text-right">
              Cuisine
            </Label>
            <Select onValueChange={setSelectedCuisineRegion}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="mexican">Mexican</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="greek">Greek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="divide-y divide-border rounded-md border">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => onAddMeal(selectedMealType || "dinner", recipe.title)}
                className="group flex w-full items-center justify-between p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {recipe.title}
              </button>
            ))}
            {filteredRecipes.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">
                No recipes found.
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
