import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImportedRecipeCard } from "@/components/discover-recipes/ImportedRecipeCard";
import { ImportedRecipe } from "@/services/importedRecipeService";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";

export const LatestRecipesInspiration = () => {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // Fetch newest imported recipes
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['newest-imported-recipes'],
    queryFn: async (): Promise<ImportedRecipe[]> => {
      const { data, error } = await supabase
        .from('imported_recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

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

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (error) {
    return null; // Silently fail if we can't fetch inspiration recipes
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-extrabold">
          Discover Recipes
        </h2>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      ) : recipes && recipes.length > 0 ? (
        <div className="space-y-4">
          {/* Featured Recipe */}
          <div className="bg-surface rounded-3xl overflow-hidden shadow-sm">
            <div className="relative h-48 w-full">
              <img 
                src={recipes[0].image || '/placeholder.svg'} 
                alt={recipes[0].title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <h3 className="text-xl font-bold text-content-primary">
                {recipes[0].title}
              </h3>
              <p className="text-sm text-content-secondary line-clamp-2">
                {recipes[0].description || "A healthy and delicious recipe loaded with fresh ingredients."}
              </p>
              
              {/* Meta info */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  🍃 {recipes[0].meal_types?.[0] || 'Dinner'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  ⏰ {(recipes[0].prep_time + recipes[0].cook_time) || 25} min
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  👥 {recipes[0].servings || 4}
                </span>
              </div>
              
              {/* CTA Button */}
              <Link to={`/discover-recipes/${recipes[0].id}`} className="block">
                <button className="w-full bg-[#FFDD6B] hover:bg-[#FFDD6B]/90 text-content-primary font-semibold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2">
                  👁 View Recipe
                </button>
              </Link>
            </div>
          </div>
          
          {/* Discover More Button */}
          <Link to="/discover-recipes">
            <button className="w-full bg-surface hover:bg-surface-elevated text-content-primary font-semibold py-3 px-4 rounded-full transition-colors border border-border-subtle">
              Discover More Recipes
            </button>
          </Link>
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-3xl shadow-sm">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-content-secondary mb-4">
            No recipes available at the moment.
          </p>
          <Link to="/discover-recipes">
            <button className="px-6 py-2 bg-[#FFDD6B] text-content-primary rounded-full font-semibold hover:bg-[#FFDD6B]/90 transition-colors">
              Explore Recipes
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};