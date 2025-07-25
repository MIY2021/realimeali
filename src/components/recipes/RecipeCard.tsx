import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Plus, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";
import { useRecipes } from "@/contexts/RecipesContext";
import { RecipeImage } from "@/components/ui/recipe-image";
import { createRecipeUrl } from "@/utils/slugUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface RecipeCardProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onRecipeClick?: (recipeId: string) => void;
  showActions?: boolean;
  mobileLayout?: string;
}

export function RecipeCard({ recipe, onAddToMealPlan, onRecipeClick, showActions = true, mobileLayout }: RecipeCardProps) {
  const { toggleFavorite, toggleCookingStatus } = useRecipes();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingCooked, setIsTogglingCooked] = useState(false);
  const isMobile = useIsMobile();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsTogglingFavorite(true);
    try {
      const newFavoriteStatus = !recipe.is_favorite;
      await toggleFavorite(recipe.id, newFavoriteStatus);
      
      // Show sonner notification
      if (newFavoriteStatus) {
        toast.success("Added to favorites", {
          description: `${recipe.title} has been added to your favorites`
        });
      } else {
        toast.success("Removed from favorites", {
          description: `${recipe.title} has been removed from your favorites`
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error("Failed to update favorite status");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleToggleCooked = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsTogglingCooked(true);
    try {
      await toggleCookingStatus(recipe.id);
    } catch (error) {
      console.error('Failed to toggle cooking status:', error);
    } finally {
      setIsTogglingCooked(false);
    }
  };

  const handleAddToMealPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToMealPlan) {
      onAddToMealPlan(recipe);
    }
  };

  const handleRecipeClick = () => {
    if (onRecipeClick) {
      onRecipeClick(recipe.id);
    }
  };

  const getRecipeUrl = () => {
    return createRecipeUrl(recipe);
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Determine if buttons should be stacked (mobile two-column layout)
  const shouldStackButtons = isMobile && mobileLayout === '2';
  // Determine if we should use compact layout (mobile two-column layout)
  const isCompactLayout = isMobile && mobileLayout === '2';

  return (
    <Card className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <div className="relative overflow-hidden rounded-t-lg">
        <Link to={getRecipeUrl()} onClick={handleRecipeClick}>
          <RecipeImage 
            recipe={recipe} 
            className={`w-full aspect-[4/3] object-cover transition-transform duration-300 ${!isMobile ? 'hover:scale-110' : ''}`} 
            iconSize="h-5 w-5" 
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm border border-white/20 shadow-sm hover:bg-white/90 transition-all duration-200"
        >
          <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'}`} />
        </Button>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <Link to={getRecipeUrl()} onClick={handleRecipeClick}>
          <h3 className={`font-semibold text-gray-900 mb-2 hover:text-primary transition-colors ${isCompactLayout ? 'text-sm' : 'text-lg'}`}>
            {recipe.title}
          </h3>
        </Link>
        <p 
          className="text-sm text-gray-600 mb-3 flex-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: isCompactLayout ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4em',
            maxHeight: isCompactLayout ? '1.4em' : '2.8em'
          }}
        >
          {recipe.description}
        </p>
        
        {/* Cooking time */}
        <div className="flex items-center gap-1 mb-2">
          <Clock className="h-4 w-4 text-terracotta" />
          <span className="text-sm text-gray-600">{recipe.prep_time + recipe.cook_time} min</span>
        </div>

        <div className={`flex items-center gap-1 mb-3 ${isCompactLayout ? 'flex-wrap' : ''}`}>
          {recipe.meal_type && (
            <Badge 
              variant="secondary"
              className={isCompactLayout ? 'text-xs px-2 py-0.5 h-5' : ''}
            >
              {capitalizeFirst(recipe.meal_type)}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCooked}
            disabled={isTogglingCooked}
            className={`${isCompactLayout ? 'h-5 px-2 text-xs' : 'h-6 px-2 text-xs'} ${recipe.has_cooked 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {!isCompactLayout && <User className="h-3 w-3 mr-1" />}
            {recipe.has_cooked ? 'Cooked' : (isCompactLayout ? 'Not Cooked' : 'Not Cooked')}
          </Button>
        </div>

        {/* Action buttons row */}
        <div className={`mt-auto ${shouldStackButtons ? 'flex flex-col gap-2' : 'flex gap-2'}`}>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={`text-xs px-2 ${shouldStackButtons ? 'w-full' : 'flex-1'}`}
          >
            <Link to={getRecipeUrl()} onClick={handleRecipeClick}>
              <Eye className="h-3 w-3 mr-1" />
              <span className="hidden xl:inline">View Recipe</span>
              <span className="xl:hidden">View</span>
            </Link>
          </Button>
          
          {showActions && onAddToMealPlan && (
            <Button
              variant="default"
              size="sm"
              className={`text-xs px-2 ${shouldStackButtons ? 'w-full' : 'flex-1'}`}
              onClick={handleAddToMealPlan}
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="hidden xl:inline">Add to Meal Plan</span>
              <span className="xl:hidden">Add</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
