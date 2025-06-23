
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, GripVertical, Edit2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const newIngredients = Array.from(ingredients);
    const [reorderedItem] = newIngredients.splice(sourceIndex, 1);
    newIngredients.splice(destinationIndex, 0, reorderedItem);

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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ingredients">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-0.5 sm:max-h-64 sm:overflow-y-auto flex-1 transition-all duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg p-2' : ''
                }`}
              >
                {ingredients.map((ingredient, index) => (
                  <Draggable key={`ingredient-${index}`} draggableId={`ingredient-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          flex items-center gap-1.5 p-1 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-200 group
                          ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-1 z-50 bg-white border-2 border-blue-300' : ''}
                        `}
                        style={{
                          ...provided.draggableProps.style,
                          ...(snapshot.isDragging && {
                            transform: `${provided.draggableProps.style?.transform} translateY(-4px)`,
                          }),
                        }}
                      >
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 touch-none"
                        >
                          <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors" />
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
                            <span className="flex-1 text-sm break-words leading-snug select-text">
                              {ingredient}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(index)}
                              className="opacity-70 group-hover:opacity-100 transition-opacity hover:bg-blue-50 hover:text-blue-600 h-5 w-5 p-0 flex-shrink-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
