
import { CommunityRecipe } from "@/hooks/useCommunityRecipes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommunityRecipeCardProps {
  recipe: CommunityRecipe;
  mobileLayout?: string;
  onOpen?: () => void;
}

export function CommunityRecipeCard({ recipe, mobileLayout = "1", onOpen }: CommunityRecipeCardProps) {
  const isMobile = useIsMobile();

  const handleVisitSite = () => {
    if (onOpen) return onOpen();
    window.open(recipe.source_url, '_blank', 'noopener,noreferrer');
  };

  // Format cooking time like the external recipes
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Use AI-generated description if available, otherwise fall back to original description
  const displayDescription = recipe.ai_generated_description || recipe.description;

  // Determine if we should use compact layout (mobile two-column layout)
  const isCompactLayout = isMobile && mobileLayout === '2';

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
      {/* Image Container - Use aspect-[4/3] for one-column mobile, h-48 for two-column */}
      <div 
        className={`relative cursor-pointer overflow-hidden ${
          isMobile && mobileLayout === '1' ? 'aspect-[4/3]' : 'h-48'
        }`}
        onClick={handleVisitSite}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVisitSite(); } }}
      >
        {recipe.ai_generated_image_url ? (
          <img
            src={recipe.ai_generated_image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        
        {/* External badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs font-medium">
            External
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 
          className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:underline"
          onClick={handleVisitSite}
        >
          {recipe.title}
        </h3>

        {/* Description/Intro text with dynamic truncation */}
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
          {(recipe.prep_time > 0 || recipe.cook_time > 0) && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(recipe.prep_time + recipe.cook_time)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings}</span>
          </div>
        </div>

        {/* Source */}
        <div className="mt-auto">
          {recipe.source_url && (
            <p className="text-xs text-muted-foreground mb-2">
              Source: {new URL(recipe.source_url).hostname}
            </p>
          )}

          {/* View recipe button */}
          <Button 
            size="sm" 
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
            onClick={handleVisitSite}
            aria-label={`View recipe on ${recipe.source_url ? new URL(recipe.source_url).hostname : 'external site'}`}
          >
            <Link className="h-4 w-4 mr-2" />
            Visit Recipe Site
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
