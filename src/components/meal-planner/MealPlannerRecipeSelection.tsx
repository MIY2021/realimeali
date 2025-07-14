import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RecipeSelectionView } from "@/components/recipes/RecipeSelectionView";
import { Recipe, MealType } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface MealPlannerRecipeSelectionProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner", 
  snacks: "Snacks",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks"
};

export function MealPlannerRecipeSelection({
  open,
  onClose,
  mealType,
  recipes,
  onSelectRecipe,
}: MealPlannerRecipeSelectionProps) {
  const isMobile = useIsMobile();

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe.id);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className={`h-[90vh] sm:h-[80vh] ${
          isMobile 
            ? 'p-4' 
            : 'max-w-7xl mx-auto px-8'
        }`}
      >
        <SheetHeader className="pb-4">
          <SheetTitle>My Recipes - Add {MEAL_TYPE_LABELS[mealType]}</SheetTitle>
        </SheetHeader>

        <div className="h-full overflow-y-auto">
          <RecipeSelectionView
            recipes={recipes}
            isLoading={false}
            onSelectRecipe={handleSelectRecipe}
            prefilterMealType={mealType}
            showAddToMealPlan={false}
            defaultMobileLayout="2"
          />
        </div>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}