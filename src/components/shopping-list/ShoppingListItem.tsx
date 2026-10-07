
import { Button } from "@/components/ui/button";
import { CheckCircle2, Check, ShoppingCart } from "lucide-react";
import { createRecipeUrl } from "@/utils/slugUtils";
import { Link, useNavigate } from "react-router-dom";
import { useRecipes } from "@/contexts/RecipesContext";
import { useMealPlan } from "@/contexts/MealPlanContext";
import { useShoppingListInteractions } from "./ShoppingListInteractions";
import { useToast } from "@/hooks/use-toast";
import { formatQuantity } from "@/utils/shoppingListUtils";
import { getShoppingSearchName } from "@/utils/shoppingIngredientUtils";
import { SortOption } from "@/utils/shoppingListSorting";
import { openOcadoSearch } from "@/utils/ocadoShopping";

interface ShoppingListItemProps {
  id: string;
  name: string;
  quantity?: number;
  quantityDisplay?: string;
  unit?: string;
  isChecked: boolean;
  recipeIds: string[];
  copiedItemId: string | null;
  onCheck: (checked: boolean) => void;
  onCopy: () => void;
  getRecipeNames: (recipeIds: string[]) => string;
  sortOption?: SortOption;
}

export function ShoppingListItem({
  id,
  name,
  quantity,
  quantityDisplay,
  unit,
  isChecked,
  recipeIds,
  copiedItemId,
  onCheck,
  onCopy,
  getRecipeNames,
  sortOption = "none"
}: ShoppingListItemProps) {
  const { toast } = useToast();
  const { recipes } = useRecipes();
  const { mealPlans: allMealPlans } = useMealPlan();
  const navigate = useNavigate();

  const shoppingSearchName = getShoppingSearchName(name, quantity, unit);

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(shoppingSearchName);
      onCopy();
      toast({
        title: "Copied to clipboard",
        description: '"' + shoppingSearchName + '" copied to clipboard',
      });
    } catch {
      toast({
        title: "Couldn't copy item",
        description: "Please try copying the item again.",
        variant: "destructive",
      });
    }
  };

  const handleOcadoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const opened = openOcadoSearch(shoppingSearchName);

    if (!opened) {
      toast({
        title: "Couldn't open Ocado",
        description: "Please try opening Ocado in your browser.",
        variant: "destructive",
      });
    }
  };

  const {
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave
  } = useShoppingListInteractions(isChecked, onCheck, handleCopyName);

  const handleToggleCheck = () => onCheck(!isChecked);

  const getRecipeNamesWithIds = (recipeIds: string[]) => {
    if (name.toLowerCase().startsWith("everything for")) {
      return [{ id: recipeIds[0] || "custom", name: "Custom Entry" }];
    }

    const uniqueRecipeIds = [...new Set(recipeIds)];

    if (uniqueRecipeIds.length === 1) {
      return [{
        id: uniqueRecipeIds[0],
        name: getRecipeNames(uniqueRecipeIds)
      }];
    }

    return uniqueRecipeIds.map((recipeId) => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) return { id: recipeId, name: recipe.title };

      const customMeal = allMealPlans?.find(mp => mp.id === recipeId && mp.is_freetyped && mp.meal_name);
      if (customMeal) return { id: recipeId, name: "Custom Entry" };

      return { id: recipeId, name: "Recipe " + recipeId.substring(0, 8) };
    });
  };

  const recipeData = getRecipeNamesWithIds(recipeIds);

  const getRecipeUrl = (recipeId: string, recipeName: string): string | null => {
    if (recipeName === "Custom Entry" || recipeName.toLowerCase().includes("custom")) return null;

    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) return createRecipeUrl(recipe);

    if (recipeName && !recipeName.startsWith("Recipe ")) {
      return createRecipeUrl({ title: recipeName });
    }

    return null;
  };

  const handleRecipeClick = (e: React.MouseEvent, recipeId: string, recipeName: string) => {
    e.stopPropagation();
    e.preventDefault();

    const url = getRecipeUrl(recipeId, recipeName);
    if (url) {
      sessionStorage.setItem("restoreShoppingListScroll", "true");
      navigate(url);
    }
  };

  return (
    <div
      className={
        "group flex min-h-[68px] items-center gap-3 py-3 transition-all duration-200 " +
        (isChecked ? "opacity-55 " : "") +
        (copiedItemId === id ? "bg-green-50/70" : "")
      }
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggleCheck}
        className={
          "h-10 w-10 shrink-0 rounded-full p-0 touch-manipulation " +
          (isChecked
            ? "bg-green-50 text-green-600 hover:bg-green-100"
            : "text-muted-foreground hover:bg-muted hover:text-foreground")
        }
        title={isChecked ? "Mark as incomplete" : "Mark as complete"}
        aria-label={isChecked ? "Mark " + name + " as incomplete" : "Mark " + name + " as complete"}
      >
        {isChecked ? (
          <div className="relative">
            <CheckCircle2 className="h-6 w-6 fill-current" />
            <Check className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white stroke-[3]" />
          </div>
        ) : (
          <CheckCircle2 className="h-6 w-6" />
        )}
      </Button>

      <div className="min-w-0 flex-1">
        <div className={"flex items-baseline gap-1.5 leading-tight text-[15px] " + (isChecked ? "line-through" : "")}>
          {quantity !== undefined && (
            <span className="shrink-0 font-semibold text-muted-foreground">
              {quantityDisplay || formatQuantity(quantity)}{unit && unit !== "pcs" ? " " + unit : ""}
            </span>
          )}
          <span className="font-medium break-words text-foreground">{name}</span>
        </div>

        {recipeIds.length > 0 && sortOption !== "recipe" && (
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {recipeData.map((recipe, index) => {
              const recipeUrl = getRecipeUrl(recipe.id, recipe.name);
              const recipeName = recipe.name.trim();

              return (
                <span key={recipe.id + "-" + recipe.name}>
                  {recipeUrl ? (
                    <Link
                      to={recipeUrl}
                      onClick={(e) => handleRecipeClick(e, recipe.id, recipe.name)}
                      className="hover:underline"
                    >
                      {recipeName}
                    </Link>
                  ) : (
                    recipeName
                  )}
                  {index < recipeData.length - 1 && " · "}
                </span>
              );
            })}
          </div>
        )}

        {recipeIds.length === 0 && (
          <div className="mt-1 text-xs text-muted-foreground">Manually added</div>
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={handleOcadoClick}
        className="h-10 w-10 shrink-0 rounded-full p-0 text-muted-foreground hover:bg-[#F5B82E]/15 hover:text-foreground touch-manipulation"
        title="Shop on Ocado"
        aria-label={"Shop for " + name + " on Ocado"}
      >
        <ShoppingCart className="h-[18px] w-[18px]" />
      </Button>

      <span className="sr-only">Long press or touch-hold to copy the shopping item name.</span>
    </div>
  );
}
