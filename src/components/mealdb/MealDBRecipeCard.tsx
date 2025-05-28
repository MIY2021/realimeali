
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Heart, Link } from "lucide-react";
import { MealDBRecipe } from "@/hooks/useMealDBApi";
import { SaveMealDBRecipeDialog } from "./SaveMealDBRecipeDialog";

interface MealDBRecipeCardProps {
  recipe: MealDBRecipe;
}

export const MealDBRecipeCard = ({ recipe }: MealDBRecipeCardProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
                via TheMealDB
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-navy group-hover:text-terracotta transition-colors">
            {recipe.title}
          </h3>

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
              Save to My Recipes
            </Button>
            {(recipe.sourceUrl || recipe.videoUrl) && (
              <Button
                onClick={() => window.open(recipe.sourceUrl || recipe.videoUrl, '_blank')}
                variant="outline"
                size="sm"
              >
                <Link className="h-4 w-4" />
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
