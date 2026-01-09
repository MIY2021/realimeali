import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [imageLoading, setImageLoading] = useState(true);
  
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

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  
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
              className={`w-full aspect-[4/3] object-cover transition-all duration-300 ${!isMobile ? 'hover:scale-110' : ''} ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-terracotta" />
              <span>{totalTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="mt-auto flex gap-2 -mx-1">
          <button
            onClick={handleViewRecipe}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700 hover:text-gray-900 transition-all duration-150 text-xs font-medium ${isCompactLayout ? 'px-2 py-1.5' : ''}`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </button>
          
          {onAddToMealPlan && (
            <button
              onClick={handleAddToMealPlan}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-terracotta hover:bg-terracotta/90 text-white transition-all duration-150 text-xs font-medium shadow-sm hover:shadow ${isCompactLayout ? 'px-2 py-1.5' : ''}`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}