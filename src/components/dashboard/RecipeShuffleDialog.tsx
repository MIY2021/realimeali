import { useEffect } from 'react';
import { Recipe } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ShuffleCard } from './ShuffleCard';
import { RecipeHeroCard } from './RecipeHeroCard';
import { ShufflePhase } from '@/hooks/useRecipeShuffle';
import { X } from 'lucide-react';

interface RecipeShuffleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  phase: ShufflePhase;
  selectedRecipe: Recipe | null;
  shuffleCards: Recipe[];
  onViewRecipe: () => void;
  onShuffleAgain: () => void;
}

export function RecipeShuffleDialog({
  isOpen,
  onOpenChange,
  phase,
  selectedRecipe,
  shuffleCards,
  onViewRecipe,
  onShuffleAgain
}: RecipeShuffleDialogProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && phase === 'revealed') {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, phase, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-full h-full border-0 p-0 flex items-center justify-center [&>button:first-child]:hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.88) 100%)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Recipe shuffle animation"
      >
        {/* Custom close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 z-50 p-2 transition-opacity hover:opacity-70"
          aria-label="Close"
        >
          <X className="w-7 h-7 text-white" strokeWidth={2.5} />
        </button>

        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Shuffling cards */}
          {(phase === 'shuffling' || phase === 'decelerating') && shuffleCards.map((recipe, index) => (
            <ShuffleCard
              key={`${recipe.id}-${index}`}
              recipe={recipe}
              phase={phase}
              animationDelay={index * 100}
            />
          ))}

          {/* Hero card reveal */}
          {phase === 'revealed' && selectedRecipe && (
            <RecipeHeroCard
              recipe={selectedRecipe}
              onViewRecipe={onViewRecipe}
              onShuffleAgain={onShuffleAgain}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
