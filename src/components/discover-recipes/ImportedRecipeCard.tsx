import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Plus, Eye } from 'lucide-react';
import { ImportedRecipe } from '@/services/importedRecipeService';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from "@/hooks/use-mobile";

interface ImportedRecipeCardProps {
  recipe: ImportedRecipe;
  mobileLayout?: string;
  onAddToMealPlan?: (recipe: ImportedRecipe) => void;
}

export function ImportedRecipeCard({ 
  recipe, 
  mobileLayout = '1', 
  onAddToMealPlan 
}: ImportedRecipeCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleViewRecipe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/discover-recipes/${recipe.id}`);
  };

  const handleAddToMealPlan = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToMealPlan) {
      onAddToMealPlan(recipe);
    }
  };

  const handleRecipeClick = () => {
    navigate(`/discover-recipes/${recipe.id}`);
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  
  // Determine if buttons should be stacked (mobile two-column layout)
  const shouldStackButtons = isMobile && mobileLayout === '2';
  // Determine if we should use compact layout (mobile two-column layout)
  const isCompactLayout = isMobile && mobileLayout === '2';
  
  return (
    <Card className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <div className="relative overflow-hidden rounded-t-lg">
        <div onClick={handleRecipeClick} className="cursor-pointer">
          {recipe.image ? (
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className={`w-full aspect-[4/3] object-cover transition-transform duration-300 ${!isMobile ? 'hover:scale-110' : ''}`}
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div onClick={handleRecipeClick} className="cursor-pointer">
          <h3 className={`font-semibold text-gray-900 mb-2 hover:text-primary transition-colors ${isCompactLayout ? 'text-sm' : 'text-lg'}`}>
            {recipe.title}
          </h3>
        </div>
        
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
          {recipe.description || 'No description available'}
        </p>
        
        {/* Recipe Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>

        <div className={`flex items-center gap-1 mb-3 ${isCompactLayout ? 'flex-wrap' : ''}`}>
          {recipe.meal_types && recipe.meal_types.length > 0 && (
            <Badge 
              variant="secondary"
              className={isCompactLayout ? 'text-xs px-2 py-0.5 h-5' : ''}
            >
              {capitalizeFirst(recipe.meal_types[0])}
            </Badge>
          )}
        </div>

        {/* Action buttons row */}
        <div className={`mt-auto ${shouldStackButtons ? 'flex flex-col gap-2' : 'flex gap-2'}`}>
          <Button
            variant="outline"
            size="sm"
            className={`text-xs px-2 ${shouldStackButtons ? 'w-full' : 'flex-1'}`}
            onClick={handleViewRecipe}
          >
            <Eye className="h-3 w-3 mr-1" />
            <span className="hidden xl:inline">View Recipe</span>
            <span className="xl:hidden">View</span>
          </Button>
          
          {onAddToMealPlan && (
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