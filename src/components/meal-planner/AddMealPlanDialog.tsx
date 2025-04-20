
import { useState, useMemo } from "react";
import { Recipe, MealType } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const filteredRecipes = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(searchLower) &&
      recipe.categories.some(cat => cat === selectedMealType)
    );
  }, [recipes, searchTerm, selectedMealType]);
  
  const handleSelectRecipe = (recipeId: string) => {
    onAddMealPlan(recipeId, notes);
    setSearchTerm("");
    setNotes("");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Add {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe.id)}
                      className="flex items-start gap-4 rounded-lg border p-3 hover:bg-accent transition-colors text-left w-full"
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        {recipe.image ? (
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium leading-none">{recipe.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.categories.map((category) => (
                            <span
                              key={category}
                              className="inline-flex items-center rounded-full bg-sage/20 px-2 py-1 text-xs font-medium text-sage"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No recipes found
                </div>
              )}
            </div>
          </ScrollArea>
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
