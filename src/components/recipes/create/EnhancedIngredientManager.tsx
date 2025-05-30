
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, GripVertical } from "lucide-react";

interface EnhancedIngredientManagerProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export function EnhancedIngredientManager({ ingredients, onIngredientsChange }: EnhancedIngredientManagerProps) {
  const [newIngredient, setNewIngredient] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newIngredients = [...ingredients];
    const draggedItem = newIngredients[draggedIndex];
    
    // Remove the dragged item
    newIngredients.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newIngredients.splice(insertIndex, 0, draggedItem);
    
    onIngredientsChange(newIngredients);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {ingredients.length > 0 && (
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              draggable={editingIndex !== index}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors group cursor-move ${
                dragOverIndex === index ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col gap-1">
                <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing" />
                {/* Touch-friendly reorder buttons for mobile */}
                <div className="flex flex-col gap-0.5 sm:hidden">
                  <button
                    onClick={() => moveIngredient(index, 'up')}
                    disabled={index === 0}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveIngredient(index, 'down')}
                    disabled={index === ingredients.length - 1}
                    className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </div>
              
              {editingIndex === index ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={saveEdit} className="px-3">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit} className="px-3">
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <span
                    className="flex-1 text-sm cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => startEditing(index)}
                  >
                    {ingredient}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeIngredient(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          placeholder="Add ingredient (e.g., 2 cups flour, 1 tsp salt)"
          className="flex-1"
          onKeyPress={(e) => handleKeyPress(e, addIngredient)}
        />
        <Button 
          onClick={addIngredient} 
          disabled={!newIngredient.trim()}
          className="px-6"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        💡 Tip: Drag items to reorder, click to edit, or use arrow buttons on mobile.
      </p>
    </Card>
  );
}
