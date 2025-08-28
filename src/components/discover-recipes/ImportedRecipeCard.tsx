import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Plus, Eye } from 'lucide-react';
import { ImportedRecipe } from '@/services/importedRecipeService';
import { useNavigate } from 'react-router-dom';

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
  
  const handleViewRecipe = () => {
    navigate(`/discover-recipes/${recipe.id}`);
  };

  const handleAddToMealPlan = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToMealPlan) {
      onAddToMealPlan(recipe);
    }
  };

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  
  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-200 border-0 bg-card"
      onClick={handleViewRecipe}
    >
      {recipe.image && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          {recipe.is_featured && (
            <Badge 
              className="absolute top-2 left-2 bg-primary text-primary-foreground"
            >
              Featured
            </Badge>
          )}
        </div>
      )}
      
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Recipe Meta Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{totalTime}m</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{recipe.servings} servings</span>
          </div>

          {recipe.view_count > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{recipe.view_count}</span>
            </div>
          )}
        </div>

        {/* Meal Types */}
        {recipe.meal_types && recipe.meal_types.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.meal_types.slice(0, 3).map((type) => (
              <Badge 
                key={type} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 capitalize"
              >
                {type}
              </Badge>
            ))}
            {recipe.meal_types.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{recipe.meal_types.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Cuisine & Diet Info */}
        <div className="flex flex-wrap gap-1 text-xs">
          {recipe.cuisine_region && (
            <span className="text-muted-foreground capitalize">
              {recipe.cuisine_region.replace('_', ' ')}
            </span>
          )}
          
          {recipe.diet_lifestyle && recipe.diet_lifestyle.length > 0 && (
            <>
              {recipe.cuisine_region && <span className="text-muted-foreground">•</span>}
              <span className="text-muted-foreground capitalize">
                {recipe.diet_lifestyle[0].replace('_', ' ')}
                {recipe.diet_lifestyle.length > 1 && ` +${recipe.diet_lifestyle.length - 1}`}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleViewRecipe}
          >
            View Recipe
          </Button>
          
          {onAddToMealPlan && (
            <Button 
              size="sm" 
              className="text-xs px-3"
              onClick={handleAddToMealPlan}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* Top Tip Preview */}
        {recipe.top_tip && (
          <div className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2 mt-2">
            💡 {recipe.top_tip.length > 60 ? `${recipe.top_tip.substring(0, 60)}...` : recipe.top_tip}
          </div>
        )}
      </CardContent>
    </Card>
  );
}