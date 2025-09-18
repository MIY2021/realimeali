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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sage" />
          Discover Recipes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="relative">
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-none w-[300px] space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="space-y-6">
            <div className="relative">
              <Carousel
                setApi={setApi}
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {recipes.map((recipe) => (
                    <CarouselItem key={recipe.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <ImportedRecipeCard
                        recipe={recipe}
                        mobileLayout="1"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
              </Carousel>
              
              {/* Carousel dots */}
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index + 1 === current ? 'bg-sage' : 'bg-gray-300'
                    }`}
                    onClick={() => api?.scrollTo(index)}
                  />
                ))}
              </div>
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