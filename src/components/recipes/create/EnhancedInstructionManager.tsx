
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";

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
    <Card className="p-3 space-y-3 bg-white/60 backdrop-blur-sm border-white/30 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Instructions</h3>
        <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
          {instructions.length}
        </Badge>
      </div>

      {instructions.length > 0 && (
        <div className="space-y-2 sm:max-h-64 sm:overflow-y-auto">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className="flex gap-2 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors group"
            >
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                
                {/* Reorder buttons - more compact */}
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveInstruction(index, 'up')}
                    disabled={index === 0}
                    className="h-6 w-6 p-0 hover:bg-blue-100 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveInstruction(index, 'down')}
                    disabled={index === instructions.length - 1}
                    className="h-6 w-6 p-0 hover:bg-blue-100 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {editingIndex === index ? (
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 min-h-[60px] text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={saveEdit} className="text-xs h-7">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit} className="text-xs h-7">
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
                    className="opacity-70 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 flex-shrink-0 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Textarea
          value={newInstruction}
          onChange={(e) => setNewInstruction(e.target.value)}
          placeholder="Describe the next step..."
          className="min-h-[60px] text-sm"
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
