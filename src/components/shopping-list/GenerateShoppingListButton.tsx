import { Button } from "@/components/ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";
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
            <ShoppingBag className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
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
