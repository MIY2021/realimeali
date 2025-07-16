
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Pencil, Copy, X, Check } from "lucide-react";
import { generateSlug } from "@/utils/slugUtils";
import { Link } from "react-router-dom";
import { useShoppingListInteractions } from "./ShoppingListInteractions";
import { useToast } from "@/hooks/use-toast";
import { extractIngredientName } from "@/utils/shoppingListUtils";
import { categorizeShoppingItem } from "@/utils/shoppingListCategorizer";

interface ShoppingListItemProps {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  isChecked: boolean;
  recipeIds: string[];
  copiedItemId: string | null;
  onCheck: (checked: boolean) => void;
  onCopy: () => void;
  getRecipeNames: (recipeIds: string[]) => string;
}

export function ShoppingListItem({ 
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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editQuantity, setEditQuantity] = useState(quantity?.toString() || '');
  const [editUnit, setEditUnit] = useState(unit || '');
  const { toast } = useToast();

  const handleCopyName = async () => {
    try {
      // Use AI to extract clean ingredient name
      const cleanName = await extractIngredientName(name);
      navigator.clipboard.writeText(cleanName);
      onCopy(); // This triggers the visual feedback
      toast({
        title: "Copied to clipboard",
        description: `"${cleanName}" copied to clipboard`,
      });
    } catch (error) {
      // Fallback to copying the original name
      navigator.clipboard.writeText(name);
      onCopy();
      toast({
        title: "Copied to clipboard",
        description: `"${name}" copied to clipboard`,
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

  const handleSaveEdit = () => {
    // Note: Since we don't have updateShoppingListItem in the context,
    // we'll just close the edit mode for now
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(name);
    setEditQuantity(quantity?.toString() || '');
    setEditUnit(unit || '');
    setIsEditing(false);
  };

  const handleToggleCheck = () => {
    onCheck(!isChecked);
  };

  // Get category icon for the item
  const category = categorizeShoppingItem(name);
  const CategoryIcon = category.icon;

  // Get recipe names for display - need to get individual recipe names with their IDs
  const getRecipeNamesWithIds = (recipeIds: string[]) => {
    // Get unique recipe IDs
    const uniqueRecipeIds = [...new Set(recipeIds)];
    
    // Get the full recipe names string and split by commas
    const recipeNamesString = getRecipeNames(uniqueRecipeIds);
    const recipeNames = recipeNamesString.split(', ');
    
    // Map each recipe name to its corresponding ID
    return uniqueRecipeIds.map((recipeId, index) => ({
      id: recipeId,
      name: recipeNames[index] || `Recipe ${recipeId.substring(0, 8)}`
    }));
  };

  const recipeData = getRecipeNamesWithIds(recipeIds);

  const handleRecipeLinkClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Store scroll position restore flag
    sessionStorage.setItem('restoreShoppingListScroll', 'true');
    
    // Navigate programmatically to ensure proper routing
    const target = e.currentTarget as HTMLElement;
    const href = target.getAttribute('href');
    if (href) {
      // Use window.location for more reliable navigation
      window.location.href = href;
    }
  };

  return (
    <div 
      className={`flex items-center p-3 rounded-lg transition-colors ${
        isChecked ? 'bg-gray-50 opacity-75' : 'bg-white'
      } ${copiedItemId === id ? 'bg-green-50' : ''}`}
      onTouchStart={!isEditing ? handleTouchStart : undefined}
      onTouchEnd={!isEditing ? handleTouchEnd : undefined}
      onTouchMove={!isEditing ? handleTouchMove : undefined}
      onMouseDown={!isEditing ? handleMouseDown : undefined}
      onMouseUp={!isEditing ? handleMouseUp : undefined}
      onMouseLeave={!isEditing ? handleMouseLeave : undefined}
    >
      {/* Category Icon on the left */}
      <div className="flex items-center mr-3">
        <CategoryIcon className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Main content in the middle */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              placeholder="Qty"
              className="w-20"
              autoFocus={false}
            />
            <Input
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              placeholder="Unit"
              className="w-20"
              autoFocus={false}
            />
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1"
              autoFocus={true}
              onFocus={(e) => {
                // Select all text when input is focused
                e.target.select();
              }}
            />
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div>
            <div className={`${isChecked ? 'line-through text-gray-500' : ''}`}>
              {quantity && (
                <span className="font-medium">
                  {quantity} {unit && unit}{' '}
                </span>
              )}
              <span>{name}</span>
            </div>
            
            {recipeIds.length > 0 && (
              <div className="mt-1 text-xs text-green-600">
                from{' '}
                {recipeData.map((recipe, index) => {
                  const slug = generateSlug(recipe.name.trim());
                  return (
                    <span key={`${recipe.id}-${recipe.name}`}>
                      <Link 
                        to={`/my-recipes/${slug}`}
                        className="hover:underline cursor-pointer touch-manipulation"
                        onClick={handleRecipeLinkClick}
                        onTouchEnd={handleRecipeLinkClick}
                        style={{ 
                          touchAction: 'manipulation',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        {recipe.name.trim()}
                      </Link>
                      {index < recipeData.length - 1 && ', '}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions and checkbox on the right */}
      <div className="flex items-center space-x-2 ml-3">
        {!isEditing && (
          <>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCopyName}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </>
        )}
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleToggleCheck}
        />
      </div>
    </div>
  );
}
