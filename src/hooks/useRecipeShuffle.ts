import { useState } from 'react';
import { Recipe } from '@/types';

export type ShufflePhase = 'shuffling' | 'decelerating' | 'revealed';

export function useRecipeShuffle(recipes: Recipe[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<ShufflePhase>('shuffling');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shuffleCards, setShuffleCards] = useState<Recipe[]>([]);

  const startShuffle = () => {
    if (!recipes || recipes.length === 0) {
      return;
    }

    // Select final recipe
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    setSelectedRecipe(randomRecipe);

    // Select 10 other random recipes for shuffle animation
    const otherRecipes = recipes.filter(r => r.id !== randomRecipe.id);
    const shuffled: Recipe[] = [];
    
    // If we have other recipes, use them; otherwise duplicate the random recipe
    if (otherRecipes.length > 0) {
      for (let i = 0; i < 10; i++) {
        shuffled.push(otherRecipes[Math.floor(Math.random() * otherRecipes.length)]);
      }
    } else {
      // Only one recipe - still show animation with duplicates
      for (let i = 0; i < 10; i++) {
        shuffled.push(randomRecipe);
      }
    }
    
    setShuffleCards(shuffled);

    // Start animation sequence
    setIsOpen(true);
    setPhase('shuffling');

    // Phase transitions - adjusted for smoother flow
    setTimeout(() => setPhase('decelerating'), 2000);
    setTimeout(() => setPhase('revealed'), 3800);
  };

  const reset = () => {
    setPhase('shuffling');
    setSelectedRecipe(null);
    setShuffleCards([]);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after dialog closes
    setTimeout(reset, 300);
  };

  return {
    isOpen,
    setIsOpen: handleClose,
    phase,
    selectedRecipe,
    shuffleCards,
    startShuffle,
    reset
  };
}
