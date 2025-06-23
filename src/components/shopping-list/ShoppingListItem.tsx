
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  getRecipeNames
}: ShoppingListItemProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recipes } = useRecipes();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCopy = async () => {
    try {
      const itemText = `${name}${quantity && quantity > 1 ? ` (${quantity}${unit ? ` ${unit}` : ''})` : ''}`;
      await navigator.clipboard.writeText(itemText);
      onCopy();
      
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: `"${itemText}" has been copied`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleRecipeClick = (recipeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe?.slug) {
      navigate(`/my-recipes/${recipe.slug}`);
    }
  };

  const formatQuantity = () => {
    if (!quantity || quantity <= 1) return '';
    return ` (${quantity}${unit ? ` ${unit}` : ''})`;
  };

  const recipeNames = getRecipeNames(recipeIds);
  const uniqueRecipeIds = [...new Set(recipeIds)];

  return (
    <div className={`flex items-start gap-3 py-2 transition-all duration-200 ${
      isChecked ? 'opacity-60' : 'opacity-100'
    }`}>
      <Checkbox
        checked={isChecked}
        onCheckedChange={onCheck}
        className="mt-1 flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm leading-tight transition-all duration-200 ${
          isChecked ? 'line-through text-gray-500' : 'text-gray-900'
        }`}>
          {name}{formatQuantity()}
        </div>
        
        {uniqueRecipeIds.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            {uniqueRecipeIds.length === 1 ? (
              <button
                onClick={(e) => handleRecipeClick(uniqueRecipeIds[0], e)}
                className="hover:text-blue-600 transition-colors cursor-pointer underline decoration-dotted"
              >
                {recipeNames}
              </button>
            ) : (
              <div className="space-y-1">
                <span className="text-gray-400">From recipes:</span>
                <div className="flex flex-wrap gap-1">
                  {uniqueRecipeIds.map((recipeId, index) => {
                    const recipe = recipes.find(r => r.id === recipeId);
                    const recipeName = recipe ? recipe.title : `Recipe ${recipeId.substring(0, 8)}`;
                    
                    return (
                      <span key={recipeId}>
                        <button
                          onClick={(e) => handleRecipeClick(recipeId, e)}
                          className="hover:text-blue-600 transition-colors cursor-pointer underline decoration-dotted"
                        >
                          {recipeName}
                        </button>
                        {index < uniqueRecipeIds.length - 1 && <span className="text-gray-400">, </span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={`flex-shrink-0 h-8 w-8 p-0 transition-all duration-200 ${
          copiedItemId === id ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
        } ${isAnimating ? 'scale-110' : 'scale-100'}`}
      >
        {copiedItemId === id ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
