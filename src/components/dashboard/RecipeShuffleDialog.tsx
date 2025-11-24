import { useEffect } from 'react';
import { Recipe } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ShuffleCard } from './ShuffleCard';
import { RecipeHeroCard } from './RecipeHeroCard';
import { ShufflePhase } from '@/hooks/useRecipeShuffle';

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
        className="max-w-full h-full border-0 bg-black/90 p-0 flex items-center justify-center"
        aria-label="Recipe shuffle animation"
      >
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
