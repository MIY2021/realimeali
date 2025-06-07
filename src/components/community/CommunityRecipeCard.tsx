
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityRecipeCardProps {
  recipe: CommunityRecipe;
}

export function CommunityRecipeCard({ recipe }: CommunityRecipeCardProps) {
  const handleVisitSource = () => {
    window.open(recipe.source_url, '_blank', 'noopener,noreferrer');
  };

  // Use AI-generated description if available, otherwise fall back to original description
  const displayDescription = recipe.ai_generated_description || recipe.description;

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {recipe.ai_generated_image_url ? (
          <img
            src={recipe.ai_generated_image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        
        {/* External badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-sage text-white text-xs">
            External
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {recipe.title}
        </h3>

        {/* Description */}
        {displayDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
            {displayDescription}
          </p>
        )}

        {/* Recipe Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {recipe.prep_time > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.prep_time + recipe.cook_time}m</span>
            </div>
          )}
          {recipe.servings > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.category && (
            <Badge variant="outline" className="text-xs">
              {recipe.category}
            </Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline" className="text-xs">
              {recipe.cuisine}
            </Badge>
          )}
        </div>

        {/* Source and Visit Button */}
        <div className="mt-auto">
          {recipe.source_url && (
            <>
              <p className="text-xs text-muted-foreground mb-2">
                Source: {new URL(recipe.source_url).hostname}
              </p>
              <Button 
                onClick={handleVisitSource}
                className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Recipe Site
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
