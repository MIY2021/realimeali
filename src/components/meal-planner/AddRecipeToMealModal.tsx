
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Recipe, MealType } from "@/types";

type Props = {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
};

export function AddRecipeToMealModal({ open, onClose, mealType, recipes, onSelectRecipe }: Props) {
  const [search, setSearch] = useState("");
  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Select recipe for {mealType}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-72 overflow-y-auto space-y-1">
          {filtered.length > 0 ? filtered.slice(0, 18).map(r => (
            <Button
              key={r.id}
              variant="ghost"
              className="justify-start w-full"
              onClick={() => { onSelectRecipe(r.id); onClose(); }}
            >
              {r.title}
            </Button>
          )) : <div className="text-sm text-muted-foreground p-3">No recipes found.</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
