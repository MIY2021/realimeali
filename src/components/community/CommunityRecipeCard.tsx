
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommunityRecipeCardProps {
  recipe: CommunityRecipe;
  mobileLayout?: string;
}

export function CommunityRecipeCard({ recipe, mobileLayout = "1" }: CommunityRecipeCardProps) {
  const isMobile = useIsMobile();

  const handleVisitSource = () => {
    window.open(recipe.source_url, '_blank', 'noopener,noreferrer');
  };

  // Use AI-generated description if available, otherwise fall back to original description
  const displayDescription = recipe.ai_generated_description || recipe.description;

  // Determine if we should use compact layout (mobile two-column layout)
  const isCompactLayout = isMobile && mobileLayout === '2';

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      {/* Image Container - Changed from aspect-square to aspect-[4/3] */}
      <div className="relative aspect-[4/3] overflow-hidden">
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

        {/* Description with dynamic truncation using inline styles */}
        {displayDescription && (
          <p 
            className="text-sm text-muted-foreground mb-3 flex-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: isCompactLayout ? 1 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.4em',
              maxHeight: isCompactLayout ? '1.4em' : '2.8em'
            }}
          >
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
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15,3 21,3 21,9"/>
                  <line x1="10" x2="21" y1="14" y2="3"/>
                </svg>
                Visit Recipe Site
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
