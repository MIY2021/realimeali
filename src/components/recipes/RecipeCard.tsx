
import { Recipe } from "@/types";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, Users, Plus, Pencil, Share, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";

interface RecipeCardProps {
  recipe: Recipe;
  onAddToMealPlan?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  onShare?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onAddToMealPlan, onEdit, onDelete, onShare }: RecipeCardProps) {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { id, title, description, prepTime, cookTime, servings, image, categories } = recipe;
  const totalTime = prepTime + cookTime;
  const [imgError, setImgError] = useState(false);

  // Allow editing/deleting if user is part of the same household
  const canEdit = user && currentHousehold && onEdit;
  const canDelete = user && currentHousehold && onDelete;
  const canShare = onShare;

  // Create URL-friendly slug from recipe title
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const recipeSlug = createSlug(title);
  const recipeUrl = `/recipes/${id}/${recipeSlug}`;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md relative flex flex-col h-full">
      <Link to={recipeUrl}>
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
            to={recipeUrl}
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
      <CardContent className="p-4 pt-2 flex-grow">
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-between p-4 pt-0 text-sm text-muted-foreground space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs hover:bg-terracotta hover:text-white"
          asChild
        >
          <Link to={recipeUrl}>View Recipe</Link>
        </Button>
        
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

        {/* Action buttons for edit, share, delete */}
        <div className="flex w-full gap-1">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs hover:bg-sage hover:text-white flex items-center justify-center"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onEdit(recipe); 
              }}
              title="Edit recipe"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          
          {canShare && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs hover:bg-blue-500 hover:text-white flex items-center justify-center"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onShare(recipe); 
              }}
              title="Share recipe"
            >
              <Share className="h-3 w-3" />
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs hover:bg-red-500 hover:text-white flex items-center justify-center"
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onDelete(recipe); 
              }}
              title="Delete recipe"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
