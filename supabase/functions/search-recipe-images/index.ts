
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipeTitle } = await req.json();

    if (!recipeTitle) {
      throw new Error('Recipe title is required');
    }

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');

    if (!googleApiKey || !searchEngineId) {
      throw new Error('Google API credentials not configured');
    }

    // Clean up the recipe title for better search results
    const searchQuery = `${recipeTitle} recipe food dish`;
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
    searchUrl.searchParams.set('key', googleApiKey);
    searchUrl.searchParams.set('cx', searchEngineId);
    searchUrl.searchParams.set('q', searchQuery);
    searchUrl.searchParams.set('searchType', 'image');
    searchUrl.searchParams.set('num', '8');
    searchUrl.searchParams.set('safe', 'active');
    searchUrl.searchParams.set('imgType', 'photo');
    searchUrl.searchParams.set('imgSize', 'medium');

    console.log('Searching for images with query:', searchQuery);

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        images: [],
        message: 'No images found for this recipe'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract image URLs and filter for valid ones
    const images = data.items
      .filter((item: any) => item.link && item.link.match(/\.(jpg|jpeg|png|webp)$/i))
      .map((item: any) => item.link)
      .slice(0, 6); // Limit to 6 images

    console.log(`Found ${images.length} images for recipe: ${recipeTitle}`);

    return new Response(JSON.stringify({ 
      success: true, 
      images,
      searchQuery: recipeTitle
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-recipe-images function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      images: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
