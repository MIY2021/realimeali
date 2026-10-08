import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeSelectionView } from "@/components/recipes/RecipeSelectionView";
import { FreetypeMealDialog } from "@/components/meal-planner/FreetypeMealDialog";
import { Recipe, MealType } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { Sparkles, Loader } from "lucide-react";

interface MealPlannerRecipeSelectionProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  recipes: Recipe[];
  onSelectRecipe: (recipeId: string) => void;
  onAddFreetypeMeal: (mealName: string, servings: number) => void;
  onGenerateMeal?: () => Promise<void>;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
  sides: "Sides",
  desserts: "Desserts",
  drinks: "Drinks",
  appetizers: "Appetizers / Starters",
  sauce: "Sauce"
};

export function MealPlannerRecipeSelection({
  open,
  onClose,
  mealType,
  recipes,
  onSelectRecipe,
  onAddFreetypeMeal,
  onGenerateMeal = async () => {},
}: MealPlannerRecipeSelectionProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("recipes");
  const [showFreetypeDialog, setShowFreetypeDialog] = useState(false);
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab("recipes");
      setShowFreetypeDialog(false);
      setIsGeneratingMeal(false);
    }
  }, [open]);

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe.id);
    onClose();
  };

  const handleFreetypeMeal = (mealName: string, servings: number) => {
    onAddFreetypeMeal(mealName, servings);
    setShowFreetypeDialog(false);
    onClose();
  };

  const handleGenerateMeal = async () => {
    setIsGeneratingMeal(true);
    try {
      await onGenerateMeal();
      onClose();
    } catch {
      // Parent handles the user-facing error.
    } finally {
      setIsGeneratingMeal(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "custom") {
      setShowFreetypeDialog(true);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-screen w-full bg-white p-0 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 py-4 bg-white border-b">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle>Add {MEAL_TYPE_LABELS[mealType]}</SheetTitle>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerateMeal}
                disabled={isGeneratingMeal}
                className="h-9 shrink-0 rounded-full px-3"
              >
                {isGeneratingMeal ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="ml-1.5">Generate</span>
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <TabsContent value="recipes" className="h-full m-0 p-0">
                  <div className={`h-full ${isMobile ? 'overflow-y-auto scrollbar-hide' : 'overflow-y-auto'}`}>
                    <div className={`${isMobile ? 'px-4' : 'max-w-7xl mx-auto px-8'} py-4`}>
                       <RecipeSelectionView
                         recipes={recipes}
                         isLoading={false}
                         onSelectRecipe={handleSelectRecipe}
                         prefilterMealType={mealType}
                         showAddToMealPlan={true}
                         defaultMobileLayout="2"
                         onAddToMealPlan={(recipe) => onSelectRecipe(recipe.id)}
                       />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="h-full m-0 p-0">
                  {showFreetypeDialog && (
                    <div className="p-4">
                      <FreetypeMealDialog
                        mealType={mealType}
                        onAddFreetypeMeal={handleFreetypeMeal}
                        onCancel={() => {
                          setShowFreetypeDialog(false);
                          setActiveTab("recipes");
                        }}
                      />
                    </div>
                  )}
                </TabsContent>
              </div>

              <TabsList className="grid w-full grid-cols-2 bg-white border-t rounded-none h-12 mx-0">
                <TabsTrigger value="recipes" className="rounded-none">My Recipes</TabsTrigger>
                <TabsTrigger value="custom" className="rounded-none">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}