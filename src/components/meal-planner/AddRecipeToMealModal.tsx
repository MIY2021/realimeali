
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
    return recipes.filter(r =>
      (category === "All" || r.categories.includes(category)) &&
      (search.trim() === "" || r.title.toLowerCase().includes(search.toLowerCase()))
    );
  }, [recipes, category, search]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[100vw] w-[100vw] md:max-w-md h-[100vh] md:h-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Select recipe for {mealType}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 mb-2">
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
        <div className="max-h-[calc(100vh-200px)] md:max-h-56 overflow-y-auto space-y-1 flex-1">
          {filtered.length > 0 ? filtered.slice(0, 18).map(r => (
            <div key={r.id} className="flex gap-2 items-center border rounded p-1 hover:bg-accent transition">
              <Button
                variant="ghost"
                className="justify-start w-full"
                onClick={() => { onSelectRecipe(r.id); onClose(); }}
              >
                {r.title}
              </Button>
            </div>
          )) : <div className="text-sm text-muted-foreground p-3">No recipes found.</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
