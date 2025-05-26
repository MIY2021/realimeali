
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PublicRecipeShare {
  id: string;
  public_share_id: string;
  slug: string;
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
  console.log('=== Recipe-meta function called ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('User-Agent:', req.headers.get('user-agent'));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    console.log('Path parts:', pathParts);
    
    // Extract recipe identifier from various URL patterns
    let recipeSlug = '';
    
    if (pathParts.includes('share') && pathParts.length >= 2) {
      const shareIndex = pathParts.indexOf('share');
      recipeSlug = pathParts[shareIndex + 1];
      console.log('Share format: /share/' + recipeSlug);
    } else if (pathParts.includes('recipe') && pathParts.length >= 2) {
      const recipeIndex = pathParts.indexOf('recipe');
      recipeSlug = pathParts[recipeIndex + 1];
      console.log('Recipe format: /recipe/' + recipeSlug);
    } else {
      // Fallback for direct edge function calls
      recipeSlug = pathParts[pathParts.length - 1];
      console.log('Direct format:', recipeSlug);
    }

    if (!recipeSlug) {
      console.log('No recipe slug found, redirecting to app');
      return redirectToApp('');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching recipe data for slug:', recipeSlug);

    // Try to fetch by slug first, then fall back to public_share_id
    let { data: recipe, error } = await supabase
      .from('public_recipe_shares')
      .select('*')
      .eq('slug', recipeSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Slug lookup error:', error);
    }

    if (!recipe) {
      console.log('Slug lookup failed, trying public_share_id fallback');
      const { data: fallbackRecipe, error: fallbackError } = await supabase
        .from('public_recipe_shares')
        .select('*')
        .eq('public_share_id', recipeSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (fallbackError) {
        console.error('Fallback lookup error:', fallbackError);
      }

      if (!fallbackRecipe) {
        console.log('Recipe not found in database');
        return redirectToApp(recipeSlug);
      }
      
      recipe = fallbackRecipe;
    }

    console.log('Recipe found:', recipe.title);
    console.log('Recipe has image:', !!recipe.image);

    // Check if this is a social media crawler by User-Agent
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const isCrawler = userAgent.includes('facebookexternalhit') || 
                     userAgent.includes('twitterbot') || 
                     userAgent.includes('linkedinbot') || 
                     userAgent.includes('slackbot') || 
                     userAgent.includes('whatsapp') ||
                     userAgent.includes('telegram') ||
                     userAgent.includes('discord');

    console.log('Is crawler?', isCrawler);
    console.log('User agent:', userAgent);

    if (isCrawler) {
      // Serve HTML with meta tags for crawlers
      const html = generateCrawlerHTML(recipe);
      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } else {
      // Redirect humans to the React app
      const redirectUrl = `https://realimeali.com/share/${recipe.slug || recipe.public_share_id}`;
      return Response.redirect(redirectUrl, 302);
    }

  } catch (error) {
    console.error('Error in recipe-meta function:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

function generateCrawlerHTML(recipe: PublicRecipeShare): string {
  const recipeUrl = `https://realimeali.com/share/${recipe.slug || recipe.public_share_id}`;
  
  // Handle image URL - convert base64 to placeholder if needed
  let imageUrl = 'https://realimeali.com/lovable-uploads/48805e49-e8eb-4205-a741-e7fb6446e6d1.png';
  
  if (recipe.image) {
    if (recipe.image.startsWith('data:')) {
      // Base64 image - use placeholder instead as social media can't access base64
      console.log('Recipe has base64 image, using placeholder');
    } else if (recipe.image.startsWith('http')) {
      // Valid URL
      imageUrl = recipe.image;
    } else if (recipe.image.startsWith('/')) {
      // Relative URL - make absolute
      imageUrl = `https://realimeali.com${recipe.image}`;
    }
  }
  
  const title = `${recipe.title} Recipe | RealiMeali`;
  
  // Create rich description
  let description = recipe.description || '';
  if (!description.trim()) {
    description = `A delicious recipe shared by ${recipe.shared_by_name || 'a fellow cook'}`;
  }
  
  // Add timing and serving info
  const recipeInfo = `Prep: ${recipe.prep_time}min, Cook: ${recipe.cook_time}min, Serves: ${recipe.servings}`;
  description = `${description}. ${recipeInfo}`;
  
  // Ensure description isn't too long for social media
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }

  console.log('Generated meta data:');
  console.log('- Title:', title);
  console.log('- Description:', description);
  console.log('- Image URL:', imageUrl);
  console.log('- Recipe URL:', recipeUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${recipeUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="RealiMeali">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${recipeUrl}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(description)}">
  <meta property="twitter:image" content="${imageUrl}">
  
  <!-- Additional Meta -->
  <meta name="author" content="${escapeHtml(recipe.shared_by_name || 'RealiMeali User')}">
  <meta name="keywords" content="recipe, cooking, food, ${recipe.categories.join(', ')}">
  
  <!-- Structured Data for Recipe -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": "${escapeHtml(recipe.title)}",
    "description": "${escapeHtml(description)}",
    "image": "${imageUrl}",
    "author": {
      "@type": "Person",
      "name": "${escapeHtml(recipe.shared_by_name || 'RealiMeali User')}"
    },
    "prepTime": "PT${recipe.prep_time}M",
    "cookTime": "PT${recipe.cook_time}M",
    "recipeYield": "${recipe.servings} servings",
    "recipeCategory": "${recipe.categories.join(', ')}"
  }
  </script>
  
  <!-- Auto-redirect for human users -->
  <script>
    // Only redirect if not a crawler
    if (!navigator.userAgent.includes('bot') && !navigator.userAgent.includes('crawler')) {
      window.location.href = "${recipeUrl}";
    }
  </script>
  
  <!-- Fallback meta refresh -->
  <meta http-equiv="refresh" content="0; url=${recipeUrl}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <img src="${imageUrl}" alt="${escapeHtml(recipe.title)}" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #333; margin-bottom: 10px;">${escapeHtml(recipe.title)}</h1>
    <p style="color: #666; margin-bottom: 20px;">${escapeHtml(description)}</p>
    <p style="color: #999; font-size: 14px;">
      If you are not redirected automatically, 
      <a href="${recipeUrl}" style="color: #e38165;">click here to view the recipe</a>.
    </p>
  </div>
</body>
</html>`;
}

function redirectToApp(slug: string): Response {
  const redirectUrl = slug ? `https://realimeali.com/share/${slug}` : 'https://realimeali.com';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recipe Not Found | RealiMeali</title>
  <script>
    window.location.href = "${redirectUrl}";
  </script>
  <meta http-equiv="refresh" content="0; url=${redirectUrl}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>Recipe Not Found</h1>
    <p>Redirecting to recipe page...</p>
    <p><a href="${redirectUrl}">Click here if not redirected</a></p>
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

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
