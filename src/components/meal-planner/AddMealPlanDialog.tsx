
import { useState } from "react";
import { Recipe, MealType } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddMealPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMealPlan: (recipeId: string, notes: string) => void;
  recipes: Recipe[];
  selectedDate: Date;
  selectedMealType: MealType;
}

export function AddMealPlanDialog({
  isOpen,
  onClose,
  onAddMealPlan,
  recipes,
  selectedDate,
  selectedMealType,
}: AddMealPlanDialogProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddMealPlan = () => {
    if (selectedRecipeId) {
      onAddMealPlan(selectedRecipeId, notes);
      setSelectedRecipeId("");
      setSearchTerm("");
      setNotes("");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Add Meal Plan for {format(selectedDate, "EEEE, MMMM d")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meal Type</label>
            <div className="rounded-md border px-3 py-2 text-sm">
              {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Recipes</label>
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Recipe</label>
            <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a recipe" />
              </SelectTrigger>
              <SelectContent>
                {filteredRecipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              placeholder="Add any special notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddMealPlan} disabled={!selectedRecipeId}>
            Add to Meal Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
