
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

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
  "Organizing by grocery store aisles...",
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
  "Organizing ingredients by urgency...",
  "Adding backup dinner options...",
  "Checking if we need more coffee...",
  "Preparing for cooking adventures...",
  "Mapping out the perfect shop...",
  "Adding treats for good behavior...",
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
      // Generate a random index instead of cycling sequentially
      const randomIndex = Math.floor(Math.random() * humorousMessages.length);
      setCurrentMessage(randomIndex);
    }, 2000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2">
        {[1, 2].map((week) => (
          <Button
            key={week}
            size="sm"
            variant="outline"
            className={`rounded-lg font-medium border transition-all ${
              selectedWeek === week 
                ? 'shadow-sm' 
                : 'bg-white'
            }`}
            style={
              selectedWeek === week
                ? { 
                    backgroundColor: 'hsl(var(--shopping-yellow))',
                    borderColor: 'hsl(var(--shopping-yellow))',
                    color: 'hsl(var(--shopping-navy))'
                  }
                : { 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--shopping-navy))'
                  }
            }
            onClick={() => onWeekSelect(week as 1 | 2)}
          >
            Week {week}
          </Button>
        ))}
        
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="sm"
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ml-auto"
          style={{ 
            backgroundColor: 'hsl(var(--shopping-green))',
            color: 'hsl(var(--shopping-navy))'
          }}
        >
          {isGenerating ? (
            <>
              <svg 
                className="h-4 w-4 animate-spin" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              <span className="animate-fade-in">
                Generating List
              </span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>
                Generate Shopping List
              </span>
            </>
          )}
        </Button>
      </div>
      
      {isGenerating && (
        <div className="flex items-center gap-3 text-left">
          <div className="dancing-bird">
            🐦
          </div>
          <p className="text-sm text-muted-foreground animate-fade-in">
            {humorousMessages[currentMessage]}
          </p>
        </div>
      )}
      
      <style>{`
        .dancing-bird {
          animation: dance 1s ease-in-out infinite alternate;
          font-size: 16px;
        }
        
        @keyframes dance {
          0% {
            transform: translateY(0px) rotate(-5deg);
          }
          100% {
            transform: translateY(-4px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
