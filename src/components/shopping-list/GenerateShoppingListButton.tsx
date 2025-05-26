
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GenerateShoppingListButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  weekNumber: 1 | 2;
  hasItems: boolean;
}

export default function GenerateShoppingListButton({ 
  onGenerate, 
  isGenerating, 
  weekNumber, 
  hasItems 
}: GenerateShoppingListButtonProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'mb-4' : 'mb-6'} flex justify-center`}>
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        size={isMobile ? "default" : "lg"}
        className={`
          ${hasItems ? 'variant-outline' : 'bg-primary hover:bg-primary/90'} 
          flex items-center gap-3 px-6 py-3 rounded-lg font-medium
          transition-all duration-300 ease-in-out
          ${isGenerating ? 'scale-95' : 'hover:scale-105'}
          shadow-lg hover:shadow-xl
          ${isGenerating ? 'animate-pulse' : ''}
        `}
        variant={hasItems ? "outline" : "default"}
      >
        {isGenerating ? (
          <>
            <Sparkles className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} animate-spin`} />
            <span className="animate-fade-in">
              {isMobile ? 'Generating...' : 'Generating Shopping List...'}
            </span>
          </>
        ) : (
          <>
            <svg 
              className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
              />
            </svg>
            <span>
              {hasItems 
                ? (isMobile ? 'Regenerate List' : `Regenerate Week ${weekNumber} List`)
                : (isMobile ? 'Generate List' : `Generate Week ${weekNumber} Shopping List`)
              }
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
