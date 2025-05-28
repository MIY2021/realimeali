
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Heart, ExternalLink } from "lucide-react";
import { SpoonacularRecipe } from "@/hooks/useSpoonacularApi";
import { SaveRecipeDialog } from "./SaveRecipeDialog";

interface SpoonacularRecipeCardProps {
  recipe: SpoonacularRecipe;
}

export const SpoonacularRecipeCard = ({ recipe }: SpoonacularRecipeCardProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const cleanSummary = (summary?: string) => {
    if (!summary) return "";
    // Remove HTML tags and truncate
    const cleaned = summary.replace(/<[^>]*>/g, "").substring(0, 120);
    return cleaned.length < summary.replace(/<[^>]*>/g, "").length ? cleaned + "..." : cleaned;
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={recipe.image || "/placeholder.svg"}
              alt={recipe.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/90 text-xs">
                via Spoonacular
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-navy group-hover:text-terracotta transition-colors">
            {recipe.title}
          </h3>

          {cleanSummary(recipe.summary) && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
              {cleanSummary(recipe.summary)}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {recipe.readyInMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{recipe.readyInMinutes}m</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>

          {recipe.diets && recipe.diets.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.diets.slice(0, 2).map((diet) => (
                <Badge key={diet} variant="outline" className="text-xs">
                  {diet}
                </Badge>
              ))}
              {recipe.diets.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.diets.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => setShowSaveDialog(true)}
              className="flex-1 bg-terracotta hover:bg-terracotta/90"
              size="sm"
            >
              <Heart className="h-4 w-4 mr-2" />
              Save to My Recipes
            </Button>
            {recipe.sourceUrl && (
              <Button
                onClick={() => window.open(recipe.sourceUrl, '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SaveRecipeDialog
        recipe={recipe}
        isOpen={showSaveDialog}
        onOpenChange={setShowSaveDialog}
      />
    </>
  );
};
