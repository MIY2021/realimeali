
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, X, Check, ArrowRight } from "lucide-react";
import { generateSlug } from "@/utils/slugUtils";
import { Link } from "react-router-dom";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editQuantity, setEditQuantity] = useState(quantity?.toString() || '');
  const [editUnit, setEditUnit] = useState(unit || '');

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
    <div className={`flex items-center justify-between p-3 border rounded-lg ${
      isChecked ? 'bg-gray-50 opacity-75' : 'bg-white'
    }`}>
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
              <div className="flex flex-wrap gap-1 mt-1">
                {individualRecipeNames.map((recipeName, index) => (
                  <Badge 
                    key={`${recipeIds[index] || index}-${recipeName}`}
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-blue-50"
                  >
                    <Link 
                      to={`/my-recipes/${generateSlug(recipeName.trim())}`}
                      className="flex items-center gap-1"
                    >
                      {recipeName.trim()}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Badge>
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
            onClick={onCopy}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
