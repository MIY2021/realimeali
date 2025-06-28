
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
    
    // Check if this is a social media crawler
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

    // If not a crawler, redirect to the React app
    if (!isCrawler) {
      const redirectUrl = `https://realimeali.com${url.pathname}`;
      return Response.redirect(redirectUrl, 302);
    }

    // Handle different route patterns for crawlers
    if (pathParts.includes('share') && pathParts.length >= 2) {
      // Handle public recipe shares
      const shareIndex = pathParts.indexOf('share');
      const recipeSlug = pathParts[shareIndex + 1];
      return await handlePublicRecipeShare(recipeSlug);
    } else if (pathParts.includes('my-recipes') && pathParts.length >= 2) {
      // Handle my-recipes routes
      return generateCrawlerHTML({
        title: 'My Recipes | RealiMeali',
        description: 'Browse and manage your personal recipe collection. Create, edit, and organize your favorite dishes for easy meal planning.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
        url: `https://realimeali.com${url.pathname}`,
        type: 'website'
      });
    } else if (pathParts.includes('meal-planner')) {
      // Handle meal planner routes
      return generateCrawlerHTML({
        title: 'Meal Planner | RealiMeali',
        description: 'Plan your weekly meals with ease. Organize breakfast, lunch, and dinner for the entire week and never wonder what\'s for dinner again.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
        url: `https://realimeali.com${url.pathname}`,
        type: 'website'
      });
    } else if (pathParts.includes('shopping-list')) {
      // Handle shopping list routes
      return generateCrawlerHTML({
        title: 'Shopping List | RealiMeali',
        description: 'Create and manage your shopping lists. Generate lists automatically from your meal plans or create custom lists for efficient grocery shopping.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
        url: `https://realimeali.com${url.pathname}`,
        type: 'website'
      });
    } else if (pathParts.includes('find-recipes')) {
      // Handle find recipes routes
      return generateCrawlerHTML({
        title: 'Find Recipes | RealiMeali',
        description: 'Discover thousands of recipes from our community. Find new dishes to try, explore different cuisines, and expand your cooking repertoire.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
        url: `https://realimeali.com${url.pathname}`,
        type: 'website'
      });
    } else {
      // Handle home page and other routes
      return generateCrawlerHTML({
        title: 'RealiMeali | All-in-one meal planning',
        description: 'Your all-in-one meal planning and recipe management system. Plan meals, manage recipes, and generate shopping lists effortlessly.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center',
        url: 'https://realimeali.com',
        type: 'website'
      });
    }

  } catch (error) {
    console.error('Error in recipe-meta function:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});

async function handlePublicRecipeShare(recipeSlug: string) {
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

  // Generate crawler HTML with recipe-specific meta tags
  const recipeUrl = `https://realimeali.com/share/${recipe.slug || recipe.public_share_id}`;
  
  // Handle image URL - convert base64 to placeholder if needed
  let imageUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop&crop=center';
  
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

  return generateCrawlerHTML({
    title,
    description,
    image: imageUrl,
    url: recipeUrl,
    type: 'article',
    author: recipe.shared_by_name,
    keywords: 'recipe, cooking, food, shared recipe'
  });
}

function generateCrawlerHTML(meta: {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  author?: string;
  keywords?: string;
}): Response {
  console.log('Generated meta data:');
  console.log('- Title:', meta.title);
  console.log('- Description:', meta.description);
  console.log('- Image URL:', meta.image);
  console.log('- Recipe URL:', meta.url);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${meta.type}">
  <meta property="og:url" content="${meta.url}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:image" content="${meta.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="RealiMeali">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${meta.url}">
  <meta property="twitter:title" content="${escapeHtml(meta.title)}">
  <meta property="twitter:description" content="${escapeHtml(meta.description)}">
  <meta property="twitter:image" content="${meta.image}">
  
  <!-- Additional Meta -->
  ${meta.author ? `<meta name="author" content="${escapeHtml(meta.author)}">` : ''}
  ${meta.keywords ? `<meta name="keywords" content="${meta.keywords}">` : ''}
  
  <!-- Auto-redirect for human users -->
  <script>
    // Only redirect if not a crawler
    if (!navigator.userAgent.includes('bot') && !navigator.userAgent.includes('crawler')) {
      window.location.href = "${meta.url}";
    }
  </script>
  
  <!-- Fallback meta refresh -->
  <meta http-equiv="refresh" content="0; url=${meta.url}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <img src="${meta.image}" alt="${escapeHtml(meta.title)}" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #333; margin-bottom: 10px;">${escapeHtml(meta.title)}</h1>
    <p style="color: #666; margin-bottom: 20px;">${escapeHtml(meta.description)}</p>
    <p style="color: #999; font-size: 14px;">
      If you are not redirected automatically, 
      <a href="${meta.url}" style="color: #e38165;">click here to view the page</a>.
    </p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function redirectToApp(slug: string): Response {
  const redirectUrl = slug ? `https://realimeali.com/share/${slug}` : 'https://realimeali.com';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found | RealiMeali</title>
  <script>
    window.location.href = "${redirectUrl}";
  </script>
  <meta http-equiv="refresh" content="0; url=${redirectUrl}">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>Page Not Found</h1>
    <p>Redirecting to page...</p>
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
