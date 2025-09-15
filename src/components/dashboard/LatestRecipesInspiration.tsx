import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipeCard } from "@/components/discover-recipes/ImportedRecipeCard";
import { ImportedRecipe } from "@/services/importedRecipeService";
import { Skeleton } from "@/components/ui/skeleton";

export const LatestRecipesInspiration = () => {
  // Fetch newest imported recipes
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['newest-imported-recipes'],
    queryFn: async (): Promise<ImportedRecipe[]> => {
      const { data, error } = await supabase
        .from('imported_recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching newest recipes:', error);
        throw new Error(`Failed to fetch newest recipes: ${error.message}`);
      }

      return (data || []) as unknown as ImportedRecipe[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  if (error) {
    return null; // Silently fail if we can't fetch inspiration recipes
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sage" />
          Discover Recipes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <ImportedRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  mobileLayout="1"
                />
              ))}
            </div>
            
            {/* Discover More Button at bottom */}
            <div className="flex justify-center pt-2">
              <Button variant="outline" asChild>
                <Link to="/discover-recipes">
                  Discover More Recipes
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
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
  );
};