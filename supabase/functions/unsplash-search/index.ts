
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function requireUser(req: Request, functionName: string, limit = 20): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const serviceUrl = Deno.env.get("SUPABASE_URL"); const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceUrl || !serviceKey) return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const client = createClient(serviceUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await client.auth.getUser(authHeader.slice(7));
  if (userError || !userData.user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const { data: allowed, error: rateError } = await client.rpc("consume_edge_function_rate_limit", { p_user_id: userData.user.id, p_function_name: functionName, p_limit: limit, p_window_seconds: 60 });
  if (rateError) { console.error("Rate limit check failed", { functionName, code: rateError.code }); return new Response(JSON.stringify({ error: "Temporarily unavailable" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
  if (allowed !== true) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  return null;
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UnsplashPhoto {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
  alt_description?: string;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const authFailure = await requireUser(req, "unsplash-search", 30);
  if (authFailure) return authFailure;

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Unsplash access key from environment
    const unsplashAccessKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    
    if (!unsplashAccessKey) {
      console.log('🔍 Unsplash API: No access key configured');
      return new Response(
        JSON.stringify({
          results: [],
          total: 0,
          total_pages: 0,
          error: 'Unsplash API key not configured'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Parse request body
    const { query, page = 1, perPage = 12 } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('🔍 Unsplash API: Searching for:', query, 'Page:', page);

    // Make request to Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashAccessKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({
          results: [],
          total: 0,
          total_pages: 0,
          error: `Unsplash API error: ${response.status}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const data: UnsplashSearchResponse = await response.json();
    console.log('🔍 Unsplash API: Found', data.results?.length || 0, 'photos');

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in unsplash-search function:', error);
    return new Response(
      JSON.stringify({
        results: [],
        total: 0,
        total_pages: 0,
        error: 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
