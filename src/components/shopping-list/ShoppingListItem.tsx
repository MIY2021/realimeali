
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { extractIngredientName, capitalizeShoppingItem } from "@/utils/shoppingListUtils";
import { useRecipes } from "@/contexts/RecipesContext";

interface ShoppingListItemProps {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  isChecked: boolean;
  recipeIds: string[];
  copiedItemId: string | null;
  onCheck: (checked: boolean) => void;
  onCopy: () => void;
  getRecipeNames: (recipeIds: string[]) => string;
}

export default function ShoppingListItem({
  id,
  name,
  quantity,
  unit,
  isChecked,
  recipeIds,
  copiedItemId,
  onCheck,
  onCopy,
}: ShoppingListItemProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { recipes } = useRecipes();

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleRecipeClick = (recipeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      const slug = createSlug(recipe.title);
      navigate(`/recipes/${slug}`);
    }
  };

  const handleCopy = () => {
    const ingredientName = extractIngredientName(name);
    navigator.clipboard.writeText(ingredientName);
    onCopy();
  };

  const handleCheckboxChange = (checked: boolean | string) => {
    onCheck(checked as boolean);
  };

  const displayName = capitalizeShoppingItem(name.replace(/^week\d+-/, ''));

  return (
    <div className={`flex items-start space-x-${isMobile ? '2' : '3'} ${isMobile ? 'p-1.5' : 'p-2'} rounded hover:bg-accent`}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleCheckboxChange}
        className={`${isMobile ? 'mt-0.5' : 'mt-1'} ${isMobile ? 'h-4 w-4' : ''}`}
      />
      <div className="flex-1 min-w-0">
        <div className={`${isChecked ? 'line-through text-muted-foreground' : ''}`}>
          <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
            {quantity && quantity > 1 && `${quantity}${unit ? ` ${unit}` : ''} `}
            {displayName}
          </span>
        </div>
        {recipeIds.length > 0 && (
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-green-600 mt-1`}>
            From: {recipeIds.map((recipeId, index) => {
              const recipe = recipes.find(r => r.id === recipeId);
              const recipeName = recipe ? recipe.title : `Recipe ${recipeId.substring(0, 8)}`;
              
              return (
                <span key={recipeId}>
                  {recipe ? (
                    <button
                      onClick={(e) => handleRecipeClick(recipeId, e)}
                      className="hover:underline cursor-pointer text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      {recipeName}
                    </button>
                  ) : (
                    <span className="text-gray-500">{recipeName}</span>
                  )}
                  {index < recipeIds.length - 1 && ', '}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8'} text-muted-foreground hover:text-primary`}
        >
          {copiedItemId === id ? (
            <Check className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-600`} />
          ) : (
            <Copy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          )}
        </Button>
      </div>
    </div>
  );
}
