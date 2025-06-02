
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { RecipeImage } from "@/components/ui/recipe-image";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommunityRecipeCardProps {
  recipe: CommunityRecipe;
}

export function CommunityRecipeCard({ recipe }: CommunityRecipeCardProps) {
  const isMobile = useIsMobile();

  const handleVisitRecipe = () => {
    window.open(recipe.source_url, '_blank');
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getSourceDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'External Source';
    }
  };

  // Convert CommunityRecipe to Recipe-like structure for RecipeImage
  const recipeForImage = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image_url || undefined,
  };

  return (
    <Card className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
      <div className="relative overflow-hidden rounded-t-lg">
        <div onClick={handleVisitRecipe} className="cursor-pointer">
          <RecipeImage 
            recipe={recipeForImage} 
            className={`w-full aspect-[4/3] object-cover transition-transform duration-300 ${!isMobile ? 'hover:scale-110' : ''}`} 
            iconSize="h-5 w-5" 
          />
        </div>
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm border border-white/20 shadow-sm"
        >
          Community
        </Badge>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div onClick={handleVisitRecipe} className="cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
            {recipe.title}
          </h3>
        </div>
        {recipe.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">{recipe.description}</p>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          {recipe.category && (
            <Badge variant="secondary">
              {capitalizeFirst(recipe.category)}
            </Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline">
              {capitalizeFirst(recipe.cuisine)}
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          Source: {getSourceDomain(recipe.source_url)}
        </div>

        {/* Action button */}
        <Button
          variant="default"
          size="sm"
          className="w-full text-xs px-2"
          onClick={handleVisitRecipe}
        >
          <Globe className="h-3 w-3 mr-1" />
          Visit Recipe Site
        </Button>
      </CardContent>
    </Card>
  );
}
