
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Recipe, MealType, RecipeCategory } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
};

export function AddRecipeToMealModal({ open, onClose, mealType, recipes, onSelectRecipe }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<RecipeCategory | "All">("All");

  const allCategories = useMemo(() => {
    const set = new Set<RecipeCategory>();
    recipes.forEach(r => r.categories.forEach(c => set.add(c)));
    return ["All", ...Array.from(set).sort()];
  }, [recipes]);

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchesCategory = category === "All" || r.categories.includes(category);
      const matchesSearch = search.trim() === "" || 
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [recipes, category, search]);

  const RecipeItem = ({ recipe }: { recipe: Recipe }) => {
    const [imgError, setImgError] = useState(false);
    
    return (
      <div className="flex gap-3 items-center border rounded-lg p-3 hover:bg-accent transition-colors">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {!imgError && recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">No img</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium leading-tight">{recipe.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{recipe.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {recipe.prepTime + recipe.cookTime} min
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {recipe.servings} servings
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.categories.slice(0, 3).map(cat => (
              <span key={cat} className="inline-flex items-center rounded-full bg-sage/20 px-2 py-0.5 text-xs font-medium text-sage">
                {cat}
              </span>
            ))}
            {recipe.categories.length > 3 && (
              <span className="text-xs text-muted-foreground">+{recipe.categories.length - 3}</span>
            )}
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={() => { onSelectRecipe(recipe.id); onClose(); }}
          className="bg-terracotta hover:bg-terracotta/90"
        >
          Add
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[100vw] w-[100vw] md:max-w-2xl h-[100vh] md:h-auto max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select recipe for {mealType}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mb-4">
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as RecipeCategory | "All")} 
            className="border p-2 rounded w-full"
          >
            {allCategories.map(c => (
              <option value={c} key={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {filtered.length > 0 ? (
            filtered.map(recipe => (
              <RecipeItem key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recipes found matching your criteria.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
