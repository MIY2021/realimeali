
import { useState, useMemo } from "react";
import { Recipe, MealType, RecipeCategory } from "@/types";
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
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | "all">("all");
  const [notes, setNotes] = useState<string>("");
  
  const categories = useMemo(() => {
    const allCategories = new Set<RecipeCategory>();
    recipes.forEach(recipe => {
      recipe.categories.forEach(category => {
        allCategories.add(category);
      });
    });
    return Array.from(allCategories);
  }, [recipes]);
  
  const filteredRecipes = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === "all" || recipe.categories.includes(selectedCategory as RecipeCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchTerm, selectedCategory]);
  
  const handleSelectRecipe = (recipeId: string) => {
    onAddMealPlan(recipeId, notes);
    setSearchTerm("");
    setNotes("");
    setSelectedCategory("all");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Add {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as RecipeCategory | "all")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
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
