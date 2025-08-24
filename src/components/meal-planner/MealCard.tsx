
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { RecipeImage } from "@/components/ui/recipe-image";
import { FruitVegIndicator } from "@/components/nutrition/FruitVegIndicator";



interface MealCardProps {
  recipe: Recipe;
  onRemove: () => void;
}

export function MealCard({ recipe, onRemove }: MealCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors shadow-sm">
      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <RecipeImage recipe={recipe} className="w-full h-full" iconSize="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight truncate max-w-[calc(100%-3rem)]">{recipe.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {recipe.prep_time + recipe.cook_time} min
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {recipe.servings} servings
          </span>
          {recipe.fruit_veg_portions && recipe.fruit_veg_portions > 0 && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <FruitVegIndicator 
                portions={recipe.fruit_veg_portions} 
                size="small"
                showLabel={false}
                className="scale-75"
              />
            </>
          )}
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove meal</span>
      </Button>
    </div>
  );
}
