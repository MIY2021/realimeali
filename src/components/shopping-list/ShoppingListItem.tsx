
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Pencil, Copy, X, Check } from "lucide-react";
import { generateSlug } from "@/utils/slugUtils";
import { Link } from "react-router-dom";
import { useShoppingListInteractions } from "./ShoppingListInteractions";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div 
      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
        isChecked ? 'bg-gray-50 opacity-75' : 'bg-white'
      } ${copiedItemId === id ? 'bg-green-50 border-green-200' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
            />
            <Input
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              placeholder="Unit"
              className="w-20"
            />
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1"
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
                {individualRecipeNames.map((recipeName, index) => (
                  <span key={`${recipeIds[index] || index}-${recipeName}`}>
                    <Link 
                      to={`/my-recipes/${generateSlug(recipeName.trim())}`}
                      className="hover:underline"
                    >
                      {recipeName.trim()}
                    </Link>
                    {index < individualRecipeNames.length - 1 && ', '}
                  </span>
                ))}
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
