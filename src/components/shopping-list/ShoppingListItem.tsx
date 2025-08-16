
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
      className={`flex items-center transition-all duration-200 ${
        isChecked ? 'opacity-60' : ''
      } ${copiedItemId === id ? 'bg-green-50 rounded-md p-1 -m-1' : ''}`}
      onTouchStart={!isEditing ? handleTouchStart : undefined}
      onTouchEnd={!isEditing ? handleTouchEnd : undefined}
      onTouchMove={!isEditing ? handleTouchMove : undefined}
      onMouseDown={!isEditing ? handleMouseDown : undefined}
      onMouseUp={!isEditing ? handleMouseUp : undefined}
      onMouseLeave={!isEditing ? handleMouseLeave : undefined}
    >
      {/* Triangle icon on the left */}
      <div className="flex items-center mr-2">
        <span className="h-4 w-4 flex items-center justify-center text-muted-foreground text-xs">▷</span>
      </div>

      {/* Main content - limited width to make room for buttons */}
      <div className="flex-1 min-w-0 max-w-[65%]">
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
            <div className={`text-sm ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {quantity && (
                <span className="font-medium text-xs text-muted-foreground mr-1">
                  {quantity}{unit && ` ${unit}`}
                </span>
              )}
              <span className="font-medium">{name}</span>
            </div>
            
            {recipeIds.length > 0 && (
              <div className="mt-0.5 text-xs text-green-600 truncate">
                from{' '}
                {recipeData.map((recipe, index) => {
                  const slug = generateSlug(recipe.name.trim());
                  return (
                    <span key={`${recipe.id}-${recipe.name}`}>
                      <Link 
                        to={`/my-recipes/${slug}`}
                        className="text-green-600 hover:underline cursor-pointer touch-manipulation font-medium"
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

      {/* Actions and checkbox on the right - evenly distributed */}
      <div className="flex items-center justify-between ml-4 min-w-[35%]">
        {!isEditing ? (
          <>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
              className="h-10 w-10 p-0 hover:bg-muted touch-manipulation"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleCopyName}
              className="h-10 w-10 p-0 hover:bg-muted touch-manipulation"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Checkbox
              checked={isChecked}
              onCheckedChange={handleToggleCheck}
              className="h-5 w-5"
            />
          </>
        ) : (
          <div className="flex justify-end w-full">
            <Checkbox
              checked={isChecked}
              onCheckedChange={handleToggleCheck}
              className="h-5 w-5"
            />
          </div>
        )}
      </div>
    </div>
  );
}
