
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublicRecipeShare {
  id: string;
  public_share_id: string;
  title: string;
  description: string;
  image?: string;
  shared_by_name?: string;
  shared_by_household_name?: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  categories: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const publicShareId = pathParts[pathParts.length - 1];

    if (!publicShareId) {
      return new Response('Recipe not found', { status: 404 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the recipe data
    const { data: recipe, error } = await supabase
      .from('public_recipe_shares')
      .select('*')
      .eq('public_share_id', publicShareId)
      .eq('is_active', true)
      .single();

    if (error || !recipe) {
      console.error('Error fetching recipe:', error);
      return redirectToApp(publicShareId);
    }

    // Generate the HTML with proper meta tags
    const html = generateRecipeHTML(recipe, url.origin);
    
    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in recipe-meta function:', error);
    return new Response('Internal server error', { status: 500 });
  }
});

function generateRecipeHTML(recipe: PublicRecipeShare, origin: string): string {
  const recipeUrl = `${origin}/share/recipes/${recipe.public_share_id}`;
  const imageUrl = recipe.image || `${origin}/lovable-uploads/48805e49-e8eb-4205-a741-e7fb6446e6d1.png`;
  const title = `${recipe.title} | Shared Recipe`;
  const description = recipe.description || `A delicious recipe shared by ${recipe.shared_by_name || 'a fellow cook'}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${recipeUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="RealiMeali">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${recipeUrl}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${imageUrl}">
  
  <!-- Additional Recipe Meta -->
  <meta name="author" content="${recipe.shared_by_name || 'RealiMeali User'}">
  <meta name="keywords" content="recipe, cooking, food, ${recipe.categories.join(', ')}">
  
  <!-- Structured Data for Recipe -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": "${recipe.title}",
    "description": "${description}",
    "image": "${imageUrl}",
    "author": {
      "@type": "Person",
      "name": "${recipe.shared_by_name || 'RealiMeali User'}"
    },
    "prepTime": "PT${recipe.prep_time}M",
    "cookTime": "PT${recipe.cook_time}M",
    "recipeYield": "${recipe.servings} servings",
    "recipeCategory": "${recipe.categories.join(', ')}"
  }
  </script>
  
  <!-- Redirect to React app -->
  <script>
    window.location.href = "${recipeUrl}";
  </script>
  
  <!-- Fallback for users with JavaScript disabled -->
  <meta http-equiv="refresh" content="0; url=${recipeUrl}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>${recipe.title}</h1>
    <p>${description}</p>
    <p>If you are not redirected automatically, <a href="${recipeUrl}">click here</a>.</p>
  </div>
</body>
</html>`;
}

function redirectToApp(publicShareId: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recipe Not Found | RealiMeali</title>
  <script>
    window.location.href = "/share/recipes/${publicShareId}";
  </script>
  <meta http-equiv="refresh" content="0; url=/share/recipes/${publicShareId}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>Recipe Not Found</h1>
    <p>Redirecting to recipe page...</p>
  </div>
</body>
</html>`;
  
  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
