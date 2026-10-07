import { Button } from "@/components/ui/button";
import { ClipboardCopy, CheckCircle2, Check, ShoppingCart } from "lucide-react";
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
        description: `"${shoppingSearchName}" copied to clipboard`,
      });
    } catch (error) {
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

  // Set up touch interactions
  const {
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave
  } = useShoppingListInteractions(isChecked, onCheck, handleCopyName);

  const handleToggleCheck = () => {
    onCheck(!isChecked);
  };

  // Get recipe names for display - need to get individual recipe names with their IDs
  const getRecipeNamesWithIds = (recipeIds: string[]) => {
    // If this item starts with "Everything for", it's always a custom meal
    if (name.toLowerCase().startsWith('everything for')) {
      return [{
        id: recipeIds[0] || 'custom',
        name: 'Custom Entry'
      }];
    }
    
    // Get unique recipe IDs
    const uniqueRecipeIds = [...new Set(recipeIds)];
    
    // If only one recipe, return it directly without splitting
    if (uniqueRecipeIds.length === 1) {
      const recipeName = getRecipeNames(uniqueRecipeIds);
      return [{
        id: uniqueRecipeIds[0],
        name: recipeName
      }];
    }
    
    // For multiple recipes, we need to get each recipe name individually
    // to avoid splitting recipe titles that contain commas
    return uniqueRecipeIds.map((recipeId) => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        return {
          id: recipeId,
          name: recipe.title
        };
      }
      
      // Check if it's a custom meal
      const customMeal = allMealPlans?.find(mp => mp.id === recipeId && mp.is_freetyped && mp.meal_name);
      if (customMeal) {
        return {
          id: recipeId,
          name: 'Custom Entry'
        };
      }
      
      return {
        id: recipeId,
        name: `Recipe ${recipeId.substring(0, 8)}`
      };
    });
  };

  const recipeData = getRecipeNamesWithIds(recipeIds);

  const getRecipeUrl = (recipeId: string, recipeName: string): string | null => {
    // Don't link custom entries
    if (recipeName === 'Custom Entry' || recipeName.toLowerCase().includes('custom')) {
      return null;
    }
    
    // Find the recipe by ID
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      return createRecipeUrl(recipe);
    }
    
    // If recipe not found, try to create URL from name
    if (recipeName && !recipeName.startsWith('Recipe ')) {
      return createRecipeUrl({ title: recipeName });
    }
    
    return null;
  };

  const handleRecipeClick = (e: React.MouseEvent, recipeId: string, recipeName: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const url = getRecipeUrl(recipeId, recipeName);
    if (url) {
      // Store scroll position restore flag
      sessionStorage.setItem('restoreShoppingListScroll', 'true');
      navigate(url);
    }
  };

  return (
    <div 
      className={`flex items-center transition-all duration-200 ${
        isChecked ? 'opacity-60' : ''
      } ${copiedItemId === id ? 'bg-green-50 rounded-md p-1 -m-1' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Triangle icon on the left */}
      <div className="flex items-center mr-2">
        <span className="h-4 w-4 flex items-center justify-center text-muted-foreground text-xs">▷</span>
      </div>

      {/* Main content - limited width to make room for buttons */}
      <div className="flex-1 min-w-0">
        <div>
            <div className={`text-sm ${isChecked ? 'line-through' : ''}`} style={{ color: isChecked ? 'hsl(var(--shopping-grey))' : 'hsl(var(--shopping-navy))' }}>
              {quantity !== undefined && recipeIds.length > 0 && !getRecipeNames(recipeIds).includes('Custom Entry') && (
                <span className="text-sm mr-1" style={{ color: 'hsl(var(--shopping-grey))' }}>
                  {quantityDisplay || formatQuantity(quantity)}{unit && unit !== "pcs" ? ` ${unit}` : ""}
                </span>
              )}
              <span className="font-medium break-words">{name}</span>
            </div>
            
            {recipeIds.length > 0 && sortOption !== "recipe" && (
              <div className="mt-0.5 text-xs truncate" style={{ color: 'hsl(var(--shopping-action-green))' }}>
                {recipeData.map((recipe, index) => {
                  const recipeUrl = getRecipeUrl(recipe.id, recipe.name);
                  const recipeName = recipe.name.trim();
                  
                  if (recipeUrl) {
                    return (
                      <span key={`${recipe.id}-${recipe.name}`}>
                        <Link
                          to={recipeUrl}
                          onClick={(e) => handleRecipeClick(e, recipe.id, recipe.name)}
                          className="hover:underline cursor-pointer"
                          style={{ color: 'hsl(var(--shopping-action-green))' }}
                        >
                          {recipeName}
                        </Link>
                        {index < recipeData.length - 1 && ', '}
                      </span>
                    );
                  } else {
                    return (
                      <span key={`${recipe.id}-${recipe.name}`}>
                        {recipeName}
                        {index < recipeData.length - 1 && ', '}
                      </span>
                    );
                  }
                })}
              </div>
            )}
            
            {recipeIds.length === 0 && (
              <div className="mt-0.5 text-xs" style={{ color: 'hsl(var(--shopping-action-green))' }}>
                Manually Added Item
              </div>
            )}
          </div>
      </div>

      {/* Actions and checkbox on the right - closer together with more padding */}
      <div className="flex items-center gap-2 ml-4 -mr-4 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleOcadoClick}
          className="h-10 w-10 p-0 hover:bg-muted touch-manipulation"
          title="Shop on Ocado"
          aria-label={`Shop for ${name} on Ocado`}
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleCopyName}
          className="h-10 w-10 p-0 hover:bg-muted touch-manipulation"
          title="Copy item name"
        >
          <ClipboardCopy className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleToggleCheck}
          className={`h-10 w-10 p-0 touch-manipulation relative ${
            isChecked 
              ? 'bg-green-50 text-green-600 hover:bg-green-100' 
              : 'hover:bg-muted text-gray-400'
          }`}
          title={isChecked ? "Mark as incomplete" : "Mark as complete"}
        >
          {isChecked ? (
            <div className="relative">
              <CheckCircle2 className="h-5 w-5 fill-current" />
              <Check className="h-3 w-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white stroke-[3]" />
            </div>
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
