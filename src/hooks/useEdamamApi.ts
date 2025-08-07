import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DiscoverRecipeFilters, EdamamHit } from "@/types/edamam";
import { useToast } from "@/hooks/use-toast";

export function useEdamamApi(filters: DiscoverRecipeFilters) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['edamam-recipes', filters],
    queryFn: async (): Promise<EdamamHit[]> => {
      try {
        const { data, error } = await supabase.functions.invoke('discover-recipes', {
          body: { filters }
        });

        if (error) {
          console.error('Edamam API error:', error);
          throw new Error(error.message || 'Failed to fetch recipes');
        }

        return data?.hits || [];
      } catch (error) {
        console.error('Error calling discover-recipes function:', error);
        toast({
          title: "Error fetching recipes",
          description: "Please try again in a moment. We may have hit our rate limit.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!(
      filters.keyword || 
      filters.mealType || 
      filters.cuisineType || 
      filters.diet?.length || 
      filters.time
    ),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
}