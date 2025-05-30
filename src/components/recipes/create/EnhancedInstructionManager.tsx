
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface EnhancedInstructionManagerProps {
  instructions: string[];
  onInstructionsChange: (instructions: string[]) => void;
}

export function EnhancedInstructionManager({ instructions, onInstructionsChange }: EnhancedInstructionManagerProps) {
  const [newInstruction, setNewInstruction] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addInstruction = () => {
    if (newInstruction.trim()) {
      onInstructionsChange([...instructions, newInstruction.trim()]);
      setNewInstruction("");
    }
  };

  const removeInstruction = (index: number) => {
    onInstructionsChange(instructions.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(instructions[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newInstructions = [...instructions];
      newInstructions[editingIndex] = editValue.trim();
      onInstructionsChange(newInstructions);
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
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

    const newInstructions = Array.from(instructions);
    const [reorderedItem] = newInstructions.splice(sourceIndex, 1);
    newInstructions.splice(destinationIndex, 0, reorderedItem);

    onInstructionsChange(newInstructions);
  };

  return (
    <Card className="p-3 space-y-3 bg-white/60 backdrop-blur-sm border-white/30 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
        <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
          {instructions.length}
        </Badge>
      </div>

      {instructions.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="instructions">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-0.5 sm:max-h-64 sm:overflow-y-auto flex-1 transition-all duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg p-2' : ''
                }`}
              >
                {instructions.map((instruction, index) => (
                  <Draggable key={`instruction-${index}`} draggableId={`instruction-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          flex gap-1.5 p-1 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-200 group
                          ${snapshot.isDragging ? 'shadow-lg scale-105 rotate-1 z-50 bg-white border-2 border-blue-300' : ''}
                        `}
                        style={{
                          ...provided.draggableProps.style,
                          ...(snapshot.isDragging && {
                            transform: `${provided.draggableProps.style?.transform} translateY(-4px)`,
                          }),
                        }}
                      >
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="touch-none"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors" />
                          </div>
                          
                          {/* Step number */}
                          <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </div>
                        </div>

                        {editingIndex === index ? (
                          <div className="flex-1 space-y-1">
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 min-h-[50px] text-sm"
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={saveEdit} className="text-xs h-6">
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="text-xs h-6">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-between gap-2">
                            <p
                              className="text-sm leading-relaxed cursor-pointer hover:text-blue-600 transition-colors flex-1 break-words"
                              onClick={() => startEditing(index)}
                            >
                              {instruction}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeInstruction(index)}
                              className="opacity-70 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 flex-shrink-0 h-5 w-5 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
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
        <Textarea
          value={newInstruction}
          onChange={(e) => setNewInstruction(e.target.value)}
          placeholder="Describe the next step..."
          className="min-h-[50px] text-sm"
        />
        <Button 
          onClick={addInstruction} 
          disabled={!newInstruction.trim()}
          className="w-full h-8 text-sm"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Step {instructions.length + 1}
        </Button>
      </div>
    </Card>
  );
}
