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
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sage" />
          Discover New Recipes
        </h2>
      </div>
      
      {isLoading ? (
        <div className="relative">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-[300px] space-y-3">
                <Skeleton className="h-56 w-full rounded-2xl" />
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
                    <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                      <ImportedRecipeCard
                        recipe={recipe}
                        mobileLayout="1"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg" />
            </Carousel>
            
            {/* Carousel dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index + 1 === current ? 'w-8 bg-sage' : 'w-2 bg-gray-300'
                  }`}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
          </div>
          
          {/* Discover More Button */}
          <div className="flex justify-center pt-2">
            <Link to="/discover-recipes">
              <button className="px-8 py-3 bg-gradient-to-r from-sage to-emerald-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
                Discover More Recipes →
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md">
          <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            No recipes available at the moment.
          </p>
          <Link to="/discover-recipes">
            <button className="px-6 py-2 bg-sage text-white rounded-full font-medium hover:bg-sage/90 transition-colors">
              Explore Recipes
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};