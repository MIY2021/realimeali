import { Recipe } from '@/types';
import { Button } from '@/components/ui/button';
import { Shuffle, Star, Clock, Users } from 'lucide-react';

interface RecipeHeroCardProps {
  recipe: Recipe;
  onViewRecipe: () => void;
  onShuffleAgain: () => void;
}

export function RecipeHeroCard({ recipe, onViewRecipe, onShuffleAgain }: RecipeHeroCardProps) {
  const totalTime = recipe.prep_time && recipe.cook_time 
    ? recipe.prep_time + recipe.cook_time 
    : null;

  return (
    <div 
      className="animate-hero-reveal"
      style={{
        willChange: 'transform, opacity, filter',
      }}
    >
      <div className="bg-card rounded-2xl shadow-2xl overflow-hidden max-w-xs w-full mx-4">
        {recipe.image ? (
          <div className="relative aspect-[3/4] bg-muted">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gradient-to-br from-sage to-terracotta flex items-center justify-center">
            <Star className="w-16 h-16 text-white" />
          </div>
        )}
        
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              {recipe.title}
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {totalTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{totalTime} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onShuffleAgain}
              className="flex-1 group"
            >
              <Shuffle className="w-4 h-4 mr-2 group-hover:animate-spin" />
              Shuffle Again
            </Button>
            <Button
              onClick={onViewRecipe}
              className="flex-1 bg-sage hover:bg-sage/90"
            >
              <Star className="w-4 h-4 mr-2" />
              View Recipe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
