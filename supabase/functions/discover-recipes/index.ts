import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EDAMAM_APP_ID = Deno.env.get('EDAMAM_APP_ID');
const EDAMAM_APP_KEY = Deno.env.get('EDAMAM_APP_KEY');

interface DiscoverRecipeFilters {
  mealType?: string;
  cuisineType?: string;
  diet?: string[];
  time?: string;
  keyword?: string;
  from?: number;
  to?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error('Edamam API credentials not configured');
    }

    const { filters }: { filters: DiscoverRecipeFilters } = await req.json();
    
    // For first page (from=0), don't add random offset to ensure consistent pagination
    let adjustedFrom = filters.from || 0;
    let adjustedTo = filters.to || 20;
    
    // Ensure we don't exceed the API's limit of 100 results per session
    if (adjustedFrom >= 100) {
      adjustedFrom = 80; // Fallback to near the end
    }
    if (adjustedTo > 100) {
      adjustedTo = 100;
    }
    
    // Build query string
    const params = new URLSearchParams();
    params.append('type', 'public');
    params.append('app_id', EDAMAM_APP_ID);
    params.append('app_key', EDAMAM_APP_KEY);
    params.append('from', adjustedFrom.toString());
    params.append('to', adjustedTo.toString());

    // Add keyword search - make it more specific based on meal type
    if (filters.keyword) {
      params.append('q', filters.keyword);
    } else {
      // Use broader meal type keywords for more diverse results
      const mealTypeKeywords = {
        'breakfast': 'breakfast',
        'lunch': 'lunch',
        'dinner': 'dinner',
        'snack': 'snack',
        'teatime': 'side'
      };
      const keyword = filters.mealType && mealTypeKeywords[filters.mealType as keyof typeof mealTypeKeywords] 
        ? mealTypeKeywords[filters.mealType as keyof typeof mealTypeKeywords]
        : 'recipe';
      params.append('q', keyword);
    }

    // Add meal type filter
    if (filters.mealType) {
      params.append('mealType', filters.mealType);
    }

    // Add cuisine type filter
    if (filters.cuisineType) {
      params.append('cuisineType', filters.cuisineType);
    }

    // Add diet/health filters
    if (filters.diet && filters.diet.length > 0) {
      filters.diet.forEach(diet => {
        // Determine if it's a diet or health label
        const dietLabels = ['balanced', 'high-fiber', 'high-protein', 'low-carb', 'low-fat', 'low-sodium'];
        if (dietLabels.includes(diet)) {
          params.append('diet', diet);
        } else {
          params.append('health', diet);
        }
      });
    }

    // Add time filter (converted to calories range as proxy for complexity)
    if (filters.time) {
      switch (filters.time) {
        case '1-15':
          params.append('time', '1-15');
          break;
        case '15-30':
          params.append('time', '15-30');
          break;
        case '30-60':
          params.append('time', '30-60');
          break;
        case '60+':
          params.append('time', '60+');
          break;
      }
    }

    console.log('Making Edamam API call with params:', params.toString());

    // Make API call to Edamam
    const response = await fetch(`https://api.edamam.com/api/recipes/v2?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edamam API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      }
      
      throw new Error(`Edamam API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Found ${data.hits?.length || 0} recipes from API`);

    // Filter out recipes without proper images or titles
    const filteredHits = (data.hits || []).filter(hit => 
      hit.recipe && 
      hit.recipe.label && 
      hit.recipe.image && 
      hit.recipe.source
    );
    
    console.log(`Filtered to ${filteredHits.length} relevant recipes`);
    
    // Check if there are more results available
    const hasMoreResults = !!(data._links && data._links.next && data._links.next.href);
    
    const response_data = {
      hits: filteredHits,
      hasMore: hasMoreResults,
      nextFrom: (filters.from || 0) + (filters.to || 20) - (filters.from || 0),
      totalFetched: (filters.from || 0) + filteredHits.length,
      count: data.count || 0
    };

    return new Response(JSON.stringify(response_data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in discover-recipes function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        hits: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});