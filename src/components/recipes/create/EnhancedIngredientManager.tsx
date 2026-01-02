
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Plus, GripVertical, Edit, LayoutGrid } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface EnhancedIngredientManagerProps {
  ingredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

export function EnhancedIngredientManager({ ingredients, onIngredientsChange }: EnhancedIngredientManagerProps) {
  const [newIngredient, setNewIngredient] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editIsGroup, setEditIsGroup] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const addIngredient = () => {
    if (newIngredient.trim()) {
      onIngredientsChange([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const addGroup = () => {
    if (newGroup.trim()) {
      const groupHeader = newGroup.trim().endsWith(':') ? newGroup.trim() : `${newGroup.trim()}:`;
      onIngredientsChange([...ingredients, groupHeader]);
      setNewGroup("");
      setIsAddingGroup(false);
    }
  };

  const removeIngredient = (index: number) => {
    onIngredientsChange(ingredients.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    const currentValue = ingredients[index];
    setEditValue(currentValue);
    setEditIsGroup(isHeader(currentValue));
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newIngredients = [...ingredients];
      let finalValue = editValue.trim();
      // If marked as group, ensure it ends with colon
      if (editIsGroup && !finalValue.endsWith(':')) {
        finalValue = `${finalValue}:`;
      }
      newIngredients[editingIndex] = finalValue;
      onIngredientsChange(newIngredients);
    }
    setEditingIndex(null);
    setEditValue("");
    setEditIsGroup(false);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
    setEditIsGroup(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const isHeader = (ingredient: string) => {
    return ingredient.trim().endsWith(':') && !ingredient.match(/\d+.*:/);
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
    <Card className="rounded-[12px] border border-[#E3E3E3] shadow-sm bg-white p-4 sm:p-5 space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1A1A1A]">Ingredients</h3>
        <Badge variant="secondary" className="bg-sage/10 text-sage-dark text-[10px] px-2 py-0.5">
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
                {ingredients.map((ingredient, index) => {
                  const ingredientIsHeader = isHeader(ingredient);
                  
                  return (
                    <Draggable key={`ingredient-${index}`} draggableId={`ingredient-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            flex items-center gap-1.5 p-2 rounded-[8px] transition-all duration-200 group
                            ${ingredientIsHeader 
                              ? 'bg-sage/10 border-l-3 border-sage font-medium text-sage-dark' 
                              : 'bg-[#FAF9F6] hover:bg-white border border-transparent hover:border-[#E3E3E3]'
                            }
                            ${snapshot.isDragging ? 'shadow-md scale-[1.02] z-50 bg-white border border-sage' : ''}
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
                            <GripVertical className="h-3.5 w-3.5 text-[#6B6B6B] hover:text-sage cursor-grab active:cursor-grabbing transition-colors" />
                          </div>
                          
                          {/* Group/Header indicator */}
                          {ingredientIsHeader && (
                            <LayoutGrid className="h-3 w-3 text-sage flex-shrink-0" />
                          )}
                          
                          {editingIndex === index ? (
                            <div className="flex-1 flex flex-col gap-1.5">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                                className="flex-1 text-sm h-8 rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
                                autoFocus
                                placeholder={editIsGroup ? "Group name (e.g., For the sauce)" : "Ingredient (e.g., 2 cups flour)"}
                              />
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`group-checkbox-${index}`}
                                  checked={editIsGroup}
                                  onCheckedChange={(checked) => setEditIsGroup(checked === true)}
                                  className="h-4 w-4"
                                />
                                <Label 
                                  htmlFor={`group-checkbox-${index}`}
                                  className="text-xs text-[#6B6B6B] cursor-pointer"
                                >
                                  This is a group
                                </Label>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" onClick={saveEdit} className="px-2 text-xs h-7 bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A]">
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit} className="px-2 text-xs h-7 border-[#E3E3E3]">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className={`flex-1 text-sm break-words leading-snug select-text ${
                                ingredientIsHeader ? 'font-semibold text-sage-dark' : ''
                              }`}>
                                {ingredient}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(index)}
                                className="opacity-70 group-hover:opacity-100 transition-opacity hover:bg-sage/10 hover:text-sage h-6 w-6 p-0 flex-shrink-0 rounded-md"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeIngredient(index)}
                                className="opacity-70 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 h-6 w-6 p-0 flex-shrink-0 rounded-md"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="space-y-2 mt-auto">
        {/* Add Group Input */}
        {isAddingGroup ? (
          <div className="space-y-1">
            <Input
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="Group name (e.g., 'For the sauce')"
              className="text-sm h-9 rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
              onKeyPress={(e) => handleKeyPress(e, addGroup)}
              autoFocus
            />
            <div className="flex gap-1">
              <Button 
                onClick={addGroup} 
                disabled={!newGroup.trim()}
                className="flex-1 h-8 text-xs bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A] rounded-[8px]"
                size="sm"
              >
                <LayoutGrid className="h-3 w-3 mr-1" />
                Add Group
              </Button>
              <Button 
                onClick={() => {
                  setIsAddingGroup(false);
                  setNewGroup("");
                }}
                variant="outline"
                className="h-8 text-xs px-2 border-[#E3E3E3] rounded-[8px]"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Regular ingredient input */}
            <Input
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              placeholder="Add ingredient (e.g., 2 cups flour)"
              className="text-sm h-9 rounded-[8px] border-[#E3E3E3] focus:border-sage focus:ring-sage"
              onKeyPress={(e) => handleKeyPress(e, addIngredient)}
            />
            
            {/* Action buttons */}
            <div className="flex gap-1">
              <Button 
                onClick={addIngredient} 
                disabled={!newIngredient.trim()}
                className="flex-1 h-9 text-sm rounded-[8px] bg-[#CFE6D6] hover:bg-[#B8D9C5] text-[#1A1A1A]"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Ingredient
              </Button>
              <Button 
                onClick={() => setIsAddingGroup(true)}
                variant="outline"
                className="h-9 text-xs px-3 rounded-[8px] border-[#E3E3E3] hover:border-sage hover:bg-sage/5"
                size="sm"
                title="Add ingredient group (e.g., 'For the sauce:')"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Group
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
