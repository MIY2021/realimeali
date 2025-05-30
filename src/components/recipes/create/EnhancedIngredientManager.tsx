
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";

interface EnhancedIngredientManagerProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export function EnhancedIngredientManager({ ingredients, onIngredientsChange }: EnhancedIngredientManagerProps) {
  const [newIngredient, setNewIngredient] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addIngredient = () => {
    if (newIngredient.trim()) {
      onIngredientsChange([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    onIngredientsChange(ingredients.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(ingredients[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newIngredients = [...ingredients];
      newIngredients[editingIndex] = editValue.trim();
      onIngredientsChange(newIngredients);
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const moveIngredient = (fromIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && fromIndex === 0) ||
      (direction === 'down' && fromIndex === ingredients.length - 1)
    ) {
      return;
    }

    const newIngredients = [...ingredients];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    
    [newIngredients[fromIndex], newIngredients[toIndex]] = [newIngredients[toIndex], newIngredients[fromIndex]];
    
    onIngredientsChange(newIngredients);
  };

  return (
    <Card className="p-3 space-y-3 bg-white/60 backdrop-blur-sm border-white/30 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
          {ingredients.length}
        </Badge>
      </div>

      {ingredients.length > 0 && (
        <div className="space-y-1 sm:max-h-64 sm:overflow-y-auto flex-1">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-white/50 hover:bg-white/70 transition-colors group"
            >
              {/* Reorder buttons - more compact */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveIngredient(index, 'up')}
                  disabled={index === 0}
                  className="h-5 w-5 p-0 hover:bg-blue-100 disabled:opacity-30"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveIngredient(index, 'down')}
                  disabled={index === ingredients.length - 1}
                  className="h-5 w-5 p-0 hover:bg-blue-100 disabled:opacity-30"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              
              {editingIndex === index ? (
                <div className="flex-1 flex flex-col gap-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                    className="flex-1 text-sm h-7"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={saveEdit} className="px-2 text-xs h-6">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit} className="px-2 text-xs h-6">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span
                    className="flex-1 text-sm cursor-pointer hover:text-blue-600 transition-colors break-words leading-snug"
                    onClick={() => startEditing(index)}
                  >
                    {ingredient}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeIngredient(index)}
                    className="opacity-70 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 h-5 w-5 p-0 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 mt-auto">
        <Input
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Add ingredient (e.g., 2 cups flour)"
          className="text-sm h-8"
          onKeyPress={(e) => handleKeyPress(e, addIngredient)}
        />
        <Button 
          onClick={addIngredient} 
          disabled={!newIngredient.trim()}
          className="w-full h-8 text-sm"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Ingredient
        </Button>
      </div>
    </Card>
  );
}
