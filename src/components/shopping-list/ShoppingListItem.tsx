
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, X, Check, ExternalLink } from "lucide-react";
import { useHouseholdShopping } from "@/contexts/HouseholdShoppingContext";
import { useRecipes } from "@/contexts/RecipesContext";
import { generateSlug } from "@/utils/slugUtils";
import { Link } from "react-router-dom";

interface ShoppingListItemProps {
  item: {
    id: string;
    name: string;
    quantity?: number;
    consolidated_quantity?: number;
    unit?: string;
    consolidated_unit?: string;
    is_checked: boolean;
    is_custom: boolean;
    recipe_ids?: string[];
  };
}

export function ShoppingListItem({ item }: ShoppingListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.consolidated_quantity?.toString() || '');
  const [editUnit, setEditUnit] = useState(item.consolidated_unit || '');
  
  const { updateShoppingListItem, deleteShoppingListItem } = useHouseholdShopping();
  const { recipes } = useRecipes();

  // Get recipe names for this item
  const itemRecipes = item.recipe_ids ? 
    recipes.filter(recipe => item.recipe_ids!.includes(recipe.id)) : [];

  const handleSaveEdit = async () => {
    const quantity = editQuantity ? parseFloat(editQuantity) : undefined;
    await updateShoppingListItem(item.id, {
      name: editName.trim(),
      consolidated_quantity: quantity,
      consolidated_unit: editUnit.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setEditQuantity(item.consolidated_quantity?.toString() || '');
    setEditUnit(item.consolidated_unit || '');
    setIsEditing(false);
  };

  const handleToggleCheck = async () => {
    await updateShoppingListItem(item.id, {
      is_checked: !item.is_checked,
    });
  };

  const displayQuantity = item.consolidated_quantity || item.quantity;
  const displayUnit = item.consolidated_unit || item.unit;

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg ${
      item.is_checked ? 'bg-gray-50 opacity-75' : 'bg-white'
    }`}>
      <div className="flex items-center space-x-3 flex-1">
        <Checkbox
          checked={item.is_checked}
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
            <div className={`${item.is_checked ? 'line-through text-gray-500' : ''}`}>
              {displayQuantity && (
                <span className="font-medium">
                  {displayQuantity} {displayUnit && displayUnit}{' '}
                </span>
              )}
              <span>{item.name}</span>
            </div>
            
            {itemRecipes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {itemRecipes.map((recipe) => (
                  <Badge 
                    key={recipe.id} 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-blue-50"
                  >
                    <Link 
                      to={`/my-recipes/${generateSlug(recipe.title)}`}
                      className="flex items-center gap-1"
                    >
                      {recipe.title}
                      <ExternalLink className="h-3 w-3" />
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
            onClick={() => deleteShoppingListItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
