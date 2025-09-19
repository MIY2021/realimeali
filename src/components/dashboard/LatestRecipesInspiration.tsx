import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipe } from "@/services/importedRecipeService";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeImage } from "@/components/ui/recipe-image";

export const LatestRecipesInspiration = () => {
  // Fetch a single random imported recipe
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['featured-recipe-inspiration'],
    queryFn: async (): Promise<ImportedRecipe | null> => {
      const { data, error } = await supabase
        .from('imported_recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching featured recipe:', error);
        return null;
      }

      return data as unknown as ImportedRecipe;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  if (error) {
    return null; // Silently fail if we can't fetch inspiration recipes
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sage" />
          Discover Recipes
        </h2>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          ) : recipe ? (
            <div className="space-y-4">
              {/* Recipe Image */}
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Recipe Details */}
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{recipe.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description || "Discover this delicious recipe and add it to your collection"}
                  </p>
                </div>
                
                {/* Recipe Meta Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {recipe.cook_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.cook_time} min</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{recipe.servings} servings</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" asChild>
                    <Link to={`/imported-recipe/${recipe.id}`}>
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/discover-recipes">
                      Discover More Recipes
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-muted-foreground mb-4">
                No recipes available at the moment.
              </p>
              <Button asChild>
                <Link to="/discover-recipes">
                  Explore Discover Recipes
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};