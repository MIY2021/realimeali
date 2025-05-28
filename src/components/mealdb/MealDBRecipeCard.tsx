
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Heart, ExternalLink } from "lucide-react";
import { MealDBRecipe } from "@/hooks/useMealDBApi";
import { SaveMealDBRecipeDialog } from "./SaveMealDBRecipeDialog";

interface MealDBRecipeCardProps {
  recipe: MealDBRecipe;
}

export const MealDBRecipeCard = ({ recipe }: MealDBRecipeCardProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Create a short description from the first instruction
  const getShortDescription = (instructions: string[]) => {
    if (!instructions || instructions.length === 0) return "";
    const firstInstruction = instructions[0];
    if (!firstInstruction) return "";
    
    // Clean and truncate the first instruction to create a description
    const cleaned = firstInstruction.replace(/^(STEP \d+\s*)?/i, "").trim();
    return cleaned.length > 100 ? cleaned.substring(0, 100) + "..." : cleaned;
  };

  // Extract source from the recipe data (if available)
  const getRecipeSource = () => {
    // This would come from the API if available, for now we'll show a generic source
    return "TheMealDB";
  };

  // Estimate cooking time based on recipe complexity
  const getEstimatedTime = () => {
    const instructionCount = recipe.instructions?.length || 0;
    const ingredientCount = recipe.ingredients?.length || 0;
    
    if (instructionCount <= 3 && ingredientCount <= 5) return "15-20 mins";
    if (instructionCount <= 6 && ingredientCount <= 10) return "25-35 mins";
    if (instructionCount <= 10) return "45-60 mins";
    return "60+ mins";
  };

  // Estimate servings based on ingredient quantities
  const getEstimatedServings = () => {
    const ingredientCount = recipe.ingredients?.length || 0;
    
    if (ingredientCount <= 5) return "2-3";
    if (ingredientCount <= 10) return "4-6";
    return "6-8";
  };

  const shortDescription = getShortDescription(recipe.instructions);
  const source = getRecipeSource();

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
              <Badge variant="secondary" className="bg-white/95 text-navy text-xs font-medium px-2 py-1">
                via {source}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-navy group-hover:text-terracotta transition-colors">
            {recipe.title}
          </h3>

          {shortDescription && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
              {shortDescription}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{getEstimatedTime()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{getEstimatedServings()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs">
              {recipe.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {recipe.area}
            </Badge>
            {recipe.tags && recipe.tags.slice(0, 1).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => setShowSaveDialog(true)}
              className="flex-1 bg-terracotta hover:bg-terracotta/90"
              size="sm"
            >
              <Heart className="h-4 w-4 mr-2" />
              Save Recipe
            </Button>
            {(recipe.sourceUrl || recipe.videoUrl) && (
              <Button
                onClick={() => window.open(recipe.sourceUrl || recipe.videoUrl, '_blank')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Recipe
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SaveMealDBRecipeDialog
        recipe={recipe}
        isOpen={showSaveDialog}
        onOpenChange={setShowSaveDialog}
      />
    </>
  );
};
