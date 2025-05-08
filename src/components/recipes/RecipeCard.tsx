
import { Recipe } from "@/types";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RecipeCardProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onAddToMealPlan }: RecipeCardProps) {
  const { id, title, description, prepTime, cookTime, servings, image, categories } = recipe;
  const totalTime = prepTime + cookTime;
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md relative">
      <Link to={`/recipes/${id}`}>
        <div className="aspect-video w-full overflow-hidden bg-muted relative">
          {!imgError && image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                setImgError(true);
                (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Link
            to={`/recipes/${id}`}
            className="text-lg font-semibold hover:text-terracotta transition-colors"
            title={title}
          >
            {title}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {categories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center rounded-full bg-sage/20 px-2 py-1 text-xs font-medium text-sage"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="mt-3">
          <div className="flex items-center gap-4 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalTime} min</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{servings}</span>
            </span>
          </div>
          {onAddToMealPlan && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs hover:bg-terracotta hover:text-white flex items-center justify-center"
              onClick={(e) => { e.preventDefault(); onAddToMealPlan(recipe); }}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Add to Meal Plan</span>
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0 text-sm text-muted-foreground">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs hover:bg-terracotta hover:text-white"
            asChild
          >
            <Link to={`/recipes/${id}`}>View Recipe</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
