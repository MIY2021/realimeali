import { Recipe } from '@/types';
import { ShufflePhase } from '@/hooks/useRecipeShuffle';
import { Clock } from 'lucide-react';

interface ShuffleCardProps {
  recipe: Recipe;
  phase: ShufflePhase;
  animationDelay: number;
}

export function ShuffleCard({ recipe, phase, animationDelay }: ShuffleCardProps) {
  const getAnimationClass = () => {
    if (phase === 'shuffling') {
      return 'animate-shuffle-fast';
    }
    if (phase === 'decelerating') {
      return 'animate-shuffle-slow';
    }
    return 'opacity-0';
  };

  const getBlurClass = () => {
    if (phase === 'shuffling') {
      return 'blur-[8px]';
    }
    if (phase === 'decelerating') {
      return 'blur-[4px]';
    }
    return 'blur-none';
  };

  const totalTime = recipe.prep_time && recipe.cook_time 
    ? recipe.prep_time + recipe.cook_time 
    : null;

  // Use image_thumbnail for performance during shuffle animation
  const recipeImage = (recipe as any).image_thumbnail || recipe.image;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${getAnimationClass()}`}
      style={{
        animationDelay: `${animationDelay}ms`,
        willChange: 'transform, filter',
        backfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)',
      }}
    >
      <div className={`bg-card rounded-2xl shadow-lg overflow-hidden w-52 transition-all duration-300 ${getBlurClass()}`}>
        {recipeImage ? (
          <div className="relative aspect-[3/4] bg-muted">
            <img 
              src={recipeImage} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              <h3 className="text-white font-semibold text-lg line-clamp-2">
                {recipe.title}
              </h3>
              {totalTime && (
                <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{totalTime} min</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gradient-to-br from-sage to-terracotta flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h3 className="font-semibold text-lg line-clamp-3">{recipe.title}</h3>
              {totalTime && (
                <div className="flex items-center justify-center gap-1 text-sm mt-2">
                  <Clock className="w-3 h-3" />
                  <span>{totalTime} min</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
