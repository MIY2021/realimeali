
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, GripVertical, Clock } from "lucide-react";

interface EnhancedInstructionManagerProps {
  instructions: string[];
  onInstructionsChange: (instructions: string[]) => void;
}

export function EnhancedInstructionManager({ instructions, onInstructionsChange }: EnhancedInstructionManagerProps) {
  const [newInstruction, setNewInstruction] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

    const newInstructions = [...instructions];
    const draggedItem = newInstructions[draggedIndex];
    
    // Remove the dragged item
    newInstructions.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newInstructions.splice(insertIndex, 0, draggedItem);
    
    onInstructionsChange(newInstructions);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveInstruction = (fromIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && fromIndex === 0) ||
      (direction === 'down' && fromIndex === instructions.length - 1)
    ) {
      return;
    }

    const newInstructions = [...instructions];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    
    [newInstructions[fromIndex], newInstructions[toIndex]] = [newInstructions[toIndex], newInstructions[fromIndex]];
    
    onInstructionsChange(newInstructions);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
        <Badge variant="secondary" className="bg-green-50 text-green-700">
          {instructions.length} {instructions.length === 1 ? 'step' : 'steps'}
        </Badge>
      </div>

      {instructions.length > 0 && (
        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              draggable={editingIndex !== index}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex gap-3 p-4 rounded-lg transition-colors group cursor-move ${
                dragOverIndex === index ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing" />
                  {/* Touch-friendly reorder buttons for mobile */}
                  <div className="flex flex-col gap-0.5 sm:hidden">
                    <button
                      onClick={() => moveInstruction(index, 'up')}
                      disabled={index === 0}
                      className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveInstruction(index, 'down')}
                      disabled={index === instructions.length - 1}
                      className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>

              {editingIndex === index ? (
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-start justify-between">
                  <p
                    className="text-sm leading-relaxed cursor-pointer hover:text-blue-600 transition-colors flex-1 pr-4"
                    onClick={() => startEditing(index)}
                  >
                    {instruction}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeInstruction(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <Textarea
          value={newInstruction}
          onChange={(e) => setNewInstruction(e.target.value)}
          placeholder="Describe the next step in detail... (e.g., Preheat oven to 350°F and grease a 9x13 baking dish)"
          className="min-h-[80px]"
        />
        <div className="flex justify-between items-center">
          <Button 
            onClick={addInstruction} 
            disabled={!newInstruction.trim()}
            className="px-6"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Step {instructions.length + 1}
          </Button>
          <p className="text-xs text-gray-500">
            <Clock className="h-3 w-3 inline mr-1" />
            Be specific about timing and temperature
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        💡 Tip: Drag steps to reorder, click to edit, or use arrow buttons on mobile.
      </p>
    </Card>
  );
}
