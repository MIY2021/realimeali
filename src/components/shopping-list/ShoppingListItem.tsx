
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Pencil, Copy, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useShoppingListInteractions } from "./ShoppingListInteractions";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from "@/contexts/RecipesContext";
import { createRecipeUrl } from "@/utils/slugUtils";

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
  const { recipes } = useRecipes();

  const handleCopyName = () => {
    navigator.clipboard.writeText(name);
    onCopy(); // This triggers the visual feedback
    toast({
      title: "Copied to clipboard",
      description: `"${name}" copied to clipboard`,
    });
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

  // Get recipe names for display
  const recipeNames = getRecipeNames(recipeIds);
  const individualRecipeNames = recipeNames.split(', ');

  // Handle container interactions - but not when clicking on recipe links
  const handleContainerTouchStart = (e: React.TouchEvent) => {
    // Don't handle touch if clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (!isEditing) {
      handleTouchStart(e);
    }
  };

  const handleContainerTouchEnd = (e: React.TouchEvent) => {
    // Don't handle touch if clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (!isEditing) {
      handleTouchEnd(e);
    }
  };

  const handleContainerTouchMove = (e: React.TouchEvent) => {
    // Don't handle touch if clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (!isEditing) {
      handleTouchMove(e);
    }
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Don't handle mouse if clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (!isEditing) {
      handleMouseDown(e);
    }
  };

  const handleContainerMouseUp = (e: React.MouseEvent) => {
    // Don't handle mouse if clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (!isEditing) {
      handleMouseUp(e);
    }
  };

  const handleContainerMouseLeave = (e: React.MouseEvent) => {
    // Don't handle mouse if clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (!isEditing) {
      handleMouseLeave(e);
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        isChecked ? 'bg-gray-50 opacity-75' : 'bg-white'
      } ${copiedItemId === id ? 'bg-green-50' : ''}`}
      onTouchStart={handleContainerTouchStart}
      onTouchEnd={handleContainerTouchEnd}
      onTouchMove={handleContainerTouchMove}
      onMouseDown={handleContainerMouseDown}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseLeave}
    >
      <div className="flex items-center space-x-3 flex-1">
        <Checkbox
          checked={isChecked}
          onCheckedChange={handleToggleCheck}
        />
        
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
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
          <div className="flex-1">
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
                {recipeIds.map((recipeId, index) => {
                  const recipe = recipes.find(r => r.id === recipeId);
                  if (!recipe) {
                    console.log('ShoppingListItem: Recipe not found for ID:', recipeId);
                    return null;
                  }
                  
                  const recipeUrl = createRecipeUrl(recipe);
                  console.log('ShoppingListItem: Generated URL for recipe:', recipe.title, '→', recipeUrl);
                  
                  return (
                    <span key={recipeId}>
                      <Link 
                        to={recipeUrl}
                        className="hover:underline cursor-pointer"
                        onClick={(e) => {
                          console.log('ShoppingListItem: Link clicked, navigating to:', recipeUrl);
                          // Don't stop propagation here - let the link work normally
                          // Save scroll position for shopping list
                          sessionStorage.setItem('restoreShoppingListScroll', 'true');
                        }}
                      >
                        {recipe.title}
                      </Link>
                      {index < recipeIds.length - 1 && ', '}
                    </span>
                  );
                }).filter(Boolean)}
              </div>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center space-x-2">
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
        </div>
      )}
    </div>
  );
}
