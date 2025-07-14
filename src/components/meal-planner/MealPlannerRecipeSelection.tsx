import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeSelectionView } from "@/components/recipes/RecipeSelectionView";
import { FreetypeMealDialog } from "./FreetypeMealDialog";
import { Recipe, MealType } from "@/types";
import { useState } from "react";

interface MealPlannerRecipeSelectionProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
  onAddFreetypeMeal?: (mealName: string) => void;
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
  onAddFreetypeMeal,
}: MealPlannerRecipeSelectionProps) {
  const [activeTab, setActiveTab] = useState("recipes");

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe.id);
    onClose();
  };

  const handleClose = () => {
    setActiveTab("recipes");
    onClose();
  };

  const handleAddFreetypeMeal = (mealName: string) => {
    if (onAddFreetypeMeal) {
      onAddFreetypeMeal(mealName);
    }
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[80vh]">
        <SheetHeader className="pb-4">
          <SheetTitle>Add {MEAL_TYPE_LABELS[mealType]}</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="recipes">From Recipes</TabsTrigger>
            <TabsTrigger value="custom">Custom Meal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipes" className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <RecipeSelectionView
                recipes={recipes}
                isLoading={false}
                onSelectRecipe={handleSelectRecipe}
                prefilterMealType={mealType}
                showAddToMealPlan={false}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="flex-1">
            <div className="flex flex-col h-full">
              <FreetypeMealDialog
                mealType={mealType}
                onAddFreetypeMeal={handleAddFreetypeMeal}
                onCancel={handleClose}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}