
import { Button } from "@/components/ui/button";
import { ShoppingBag, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface ShoppingListWeekSelectorProps {
  selectedWeek: 1 | 2;
  onWeekSelect: (week: 1 | 2) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasItems: boolean;
}

const humorousMessages = [
  "Rummaging through cupboards...",
  "Counting garlic cloves...",
  "Hunting for the good olive oil...",
  "Checking if we really need more pasta...",
  "Debating organic vs regular...",
  "Finding the perfect avocados...",
  "Calculating cheese requirements...",
  "Searching for that one spice...",
  "Organizing by grocery store aisles...",
  "Making sure we don't forget bread..."
];

export default function ShoppingListWeekSelector({ 
  selectedWeek, 
  onWeekSelect,
  onGenerate,
  isGenerating,
  hasItems
}: ShoppingListWeekSelectorProps) {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % humorousMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2].map((week) => (
            <Button
              key={week}
              size="sm"
              variant={selectedWeek === week ? "default" : "outline"}
              className={selectedWeek === week ? "bg-terracotta text-white" : ""}
              onClick={() => onWeekSelect(week as 1 | 2)}
            >
              Week {week}
            </Button>
          ))}
        </div>
        
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="sm"
          className={`
            ${hasItems ? 'variant-outline' : 'bg-primary hover:bg-primary/90'} 
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium
            transition-all duration-300 ease-in-out
            ${isGenerating ? 'scale-95' : 'hover:scale-105'}
            shadow-lg hover:shadow-xl
            ${isGenerating ? 'animate-pulse' : ''}
          `}
          variant={hasItems ? "outline" : "default"}
        >
          {isGenerating ? (
            <>
              <RotateCcw className="h-4 w-4 animate-spin" />
              <span className="animate-fade-in">
                Generate List
              </span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>
                {hasItems ? 'Regenerate List' : 'Generate List'}
              </span>
            </>
          )}
        </Button>
      </div>
      
      {isGenerating && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground animate-fade-in">
            {humorousMessages[currentMessage]}
          </p>
        </div>
      )}
    </div>
  );
}
