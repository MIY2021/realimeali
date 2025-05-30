
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, GripVertical } from "lucide-react";

interface DragDropIngredientManagerProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export function DragDropIngredientManager({ ingredients, onIngredientsChange }: DragDropIngredientManagerProps) {
  const [newIngredient, setNewIngredient] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(ingredients);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onIngredientsChange(items);
  };

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

  return (
    <Card className="p-2 sm:p-4 space-y-4 bg-white/60 backdrop-blur-sm border-white/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ingredients</h3>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {ingredients.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ingredients">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
              >
                {ingredients.map((ingredient, index) => (
                  <Draggable key={`ingredient-${index}`} draggableId={`ingredient-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors group ${
                          snapshot.isDragging ? 'shadow-lg bg-white rotate-2' : ''
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 p-1 hover:bg-blue-100 rounded cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical size={18} />
                        </div>
                        
                        {editingIndex === index ? (
                          <div className="flex-1 flex flex-col sm:flex-row gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                              className="flex-1 text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2 flex-shrink-0">
                              <Button size="sm" onClick={saveEdit} className="px-3 text-xs sm:text-sm">
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="px-3 text-xs sm:text-sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span
                              className="flex-1 text-sm cursor-pointer hover:text-blue-600 transition-colors break-words"
                              onClick={() => startEditing(index)}
                            >
                              {ingredient}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeIngredient(index)}
                              className="opacity-70 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
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
          className="px-4 sm:px-6 flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        💡 Tip: Drag items to reorder, click item text to edit.
      </p>
    </Card>
  );
}
