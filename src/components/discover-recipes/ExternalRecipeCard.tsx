import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, Clock, Users } from "lucide-react";
import { EdamamRecipe } from "@/types/edamam";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExternalRecipeCardProps {
  recipe: EdamamRecipe;
  onOpen?: () => void;
  mobileLayout?: string;
}

export function ExternalRecipeCard({ recipe, onOpen, mobileLayout = "1" }: ExternalRecipeCardProps) {
  const isMobile = useIsMobile();
  const handleVisitSite = () => {
    if (onOpen) return onOpen();
    window.open(recipe.url, '_blank', 'noopener,noreferrer');
  };

  // Format cooking time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Determine if we should use compact layout (mobile two-column layout)
  const isCompactLayout = isMobile && mobileLayout === '2';
  
  // Get intro text from ingredient lines (first few ingredients as description)
  const introText = recipe.ingredientLines?.slice(0, 3).join(', ');

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
          {/* Image Container - Use aspect-[4/3] for one-column mobile, aspect-[4/3] for two-column */}
          <div 
            className={`relative cursor-pointer overflow-hidden ${
              isMobile && mobileLayout === '1' ? 'aspect-[4/3]' : 'aspect-[4/3]'
            }`}
        onClick={handleVisitSite}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleVisitSite(); } }}
      >
        <img
          src={recipe.image}
          alt={recipe.label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
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
          {recipe.label}
        </h3>
        
        {/* Description/Intro text with dynamic truncation */}
        {introText && (
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
            {introText}
          </p>
        )}
        
        {/* Recipe Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {recipe.totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(recipe.totalTime)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.yield}</span>
          </div>
        </div>
        
        {/* Source */}
        <div className="mt-auto">
          <p className="text-xs text-muted-foreground mb-2">
            Source: {recipe.source}
          </p>

          {/* View recipe button */}
            <Button 
              size="sm" 
              className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
              onClick={handleVisitSite}
              aria-label={`View recipe on ${recipe.source}`}
            >
              <Link className="h-4 w-4 mr-2" />
              View Recipe
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
