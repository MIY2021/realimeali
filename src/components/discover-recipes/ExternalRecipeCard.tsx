import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, Clock, Users } from "lucide-react";
import { EdamamRecipe } from "@/types/edamam";

interface ExternalRecipeCardProps {
  recipe: EdamamRecipe;
  onOpen?: () => void;
}

export function ExternalRecipeCard({ recipe, onOpen }: ExternalRecipeCardProps) {
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

  // Get relevant dietary labels (limit to 3)
  const relevantLabels = [
    ...recipe.dietLabels,
    ...recipe.healthLabels.filter(label => 
      ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Paleo', 'Keto'].includes(label)
    )
  ].slice(0, 3);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.label}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        {/* External badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs bg-white/90 text-navy">
            <Link className="h-3 w-3 mr-1" />
            External
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-semibold text-navy line-clamp-2 leading-tight min-h-[2.5rem]">
            {recipe.label}
          </h3>
          
          {/* Recipe metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {recipe.totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(recipe.totalTime)}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.yield} servings
            </div>
          </div>
          
          {/* Source */}
          <p className="text-xs text-muted-foreground">
            Source: {recipe.source}
          </p>

          {/* Dietary labels */}
          {relevantLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
              {relevantLabels.map((label, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* View recipe button */}
        <Button 
          size="sm" 
          className="w-full mt-3"
          onClick={handleVisitSite}
        >
          <Link className="h-4 w-4 mr-2" />
          View Recipe
        </Button>
      </CardContent>
    </Card>
  );
}
