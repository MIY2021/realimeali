import { Button } from "@/components/ui/button";
import { Sparkles, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { HeaderControls } from "@/components/layout/HeaderControls";

interface ShoppingListWeekSelectorProps {
  selectedWeek: 1 | 2;
  onWeekSelect: (week: 1 | 2) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasItems: boolean;
  mostRecentWeek?: 1 | 2 | null;
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
  "Organising by grocery store aisles...",
  "Making sure we don't forget bread...",
  "Getting my reading glasses on...",
  "Squinting at tiny recipe text...",
  "This is making me hungry already...",
  "You're in for a treat this week!",
  "Wondering if we have enough snacks...",
  "Checking the back of the pantry...",
  "Sorting through recipe chaos...",
  "Finding ingredients I can't pronounce...",
  "Adding 'just in case' items...",
  "Remembering we're out of everything...",
  "Calculating portions for leftovers...",
  "Deciding between brands...",
  "Adding emergency chocolate...",
  "Checking expiration dates mentally...",
  "Grouping by supermarket layout...",
  "Adding items we'll forget to buy...",
  "Estimating how much milk we need...",
  "Planning for midnight snack attacks...",
  "Organising ingredients by urgency...",
  "Adding backup dinner options...",
  "Checking if we need more coffee...",
  "Preparing for cooking adventures...",
  "Mapping out the perfect shop...",
  "Adding treats for good behaviour...",
  "Planning meals that won't fail..."
];

export default function ShoppingListWeekSelector({ 
  selectedWeek, 
  onWeekSelect,
  onGenerate,
  isGenerating,
  hasItems,
  mostRecentWeek
}: ShoppingListWeekSelectorProps) {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * humorousMessages.length);
      setCurrentMessage(randomIndex);
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="mb-4">
      <HeaderControls
        weekControl={
          <SegmentedControl 
            value={selectedWeek} 
            onChange={onWeekSelect} 
            disabled={isGenerating}
          />
        }
        primaryAction={
          <Button 
            variant="primary" 
            size="md" 
            onClick={onGenerate} 
            disabled={isGenerating}
            aria-busy={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline whitespace-nowrap truncate">{humorousMessages[currentMessage]}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">Generate Shopping List</span>
                <span className="sm:hidden">Generate</span>
              </>
            )}
          </Button>
        }
      />
    </div>
  );
}
