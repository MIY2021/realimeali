import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Exponential backoff retry logic
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Check if it's a retryable error
      if (error?.status === 429 || error?.status === 408) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Enhanced website content extraction with improved image extraction
async function extractWebsiteContent(url: string, extractImages: boolean = false) {
  try {
    console.log('Fetching website content from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    let extractedImages: string[] = [];
    
    // Extract images if requested
    if (extractImages) {
      console.log('Extracting images from website with enhanced patterns...');
      
      const imageUrls = new Set<string>();
      
      // 1. Extract from JSON-LD structured data (common on recipe sites)
      const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        console.log('Found JSON-LD structured data blocks:', jsonLdMatches.length);
        jsonLdMatches.forEach(match => {
          try {
            const jsonContent = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
            const data = JSON.parse(jsonContent);
            
            // Extract images from structured data
            const extractFromStructuredData = (obj: any) => {
              if (!obj) return;
              
              if (typeof obj === 'string' && obj.match(/\.(jpg|jpeg|png|webp)$/i)) {
                imageUrls.add(obj);
              } else if (Array.isArray(obj)) {
                obj.forEach(extractFromStructuredData);
              } else if (typeof obj === 'object') {
                // Look for common image properties
                ['image', 'photo', 'thumbnail', 'url'].forEach(prop => {
                  if (obj[prop]) {
                    extractFromStructuredData(obj[prop]);
                  }
                });
                
                // Recursively check other properties
                Object.values(obj).forEach(extractFromStructuredData);
              }
            };
            
            extractFromStructuredData(data);
          } catch (e) {
            console.log('Failed to parse JSON-LD block:', e);
          }
        });
      }
      
      // 2. Enhanced image tag patterns
      const imagePatterns = [
        // Standard img tags
        /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
        // Picture elements
        /<picture[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/picture>/gi,
        // Data attributes for lazy loading
        /data-src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/gi,
        /data-lazy-src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/gi,
        /data-original=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["']/gi,
        /data-srcset=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))[^"']*["']/gi,
        // Srcset attributes
        /srcset=["']([^"']*\.(?:jpg|jpeg|png|webp|gif))[^"']*["']/gi,
      ];
      
      for (const pattern of imagePatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          let imageUrl = match[1];
          
          // Skip unwanted images
          if (imageUrl.startsWith('data:') || 
              imageUrl.includes('.svg') || 
              imageUrl.includes('placeholder') ||
              imageUrl.includes('loading') ||
              imageUrl.includes('1x1') ||
              imageUrl.includes('pixel') ||
              imageUrl.includes('spacer')) {
            continue;
          }
          
          // Convert relative URLs to absolute
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            const urlObj = new URL(url);
            imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
          } else if (!imageUrl.startsWith('http')) {
            const urlObj = new URL(url);
            imageUrl = `${urlObj.protocol}//${urlObj.host}/${imageUrl}`;
          }
          
          // Filter for likely recipe images
          if (imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
            imageUrls.add(imageUrl);
          }
        }
      }
      
      // 3. OpenGraph and meta tags
      const metaImagePatterns = [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
        /<meta[^>]+property=["']article:image["'][^>]+content=["']([^"']+)["']/gi,
      ];
      
      for (const pattern of metaImagePatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          let imageUrl = match[1];
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            const urlObj = new URL(url);
            imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
          }
          if (imageUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
            imageUrls.add(imageUrl);
          }
        }
      }
      
      // 4. CSS background images
      const cssBackgroundPattern = /background-image:\s*url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp))["']?\)/gi;
      let match;
      while ((match = cssBackgroundPattern.exec(html)) !== null) {
        let imageUrl = match[1];
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
        }
        imageUrls.add(imageUrl);
      }
      
      // Convert Set to Array and prioritize recipe-related images
      const allImages = Array.from(imageUrls);
      console.log(`Found ${allImages.length} total images before filtering`);
      
      // Prioritize images that are likely to be recipe photos
      const prioritizeImage = (imageUrl: string): number => {
        let score = 0;
        
        // Higher score for recipe-related keywords in URL
        const recipeKeywords = ['recipe', 'food', 'dish', 'cooking', 'kitchen', 'meal', 'ingredient'];
        const urlLower = imageUrl.toLowerCase();
        
        recipeKeywords.forEach(keyword => {
          if (urlLower.includes(keyword)) score += 10;
        });
        
        // Prefer larger images (common pattern in URLs)
        if (urlLower.includes('large') || urlLower.includes('big') || urlLower.includes('full')) score += 5;
        if (urlLower.includes('thumb') || urlLower.includes('small') || urlLower.includes('mini')) score -= 5;
        
        // Prefer images with dimensions that suggest quality
        const dimensionMatch = imageUrl.match(/(\d{3,4})x(\d{3,4})/);
        if (dimensionMatch) {
          const width = parseInt(dimensionMatch[1]);
          const height = parseInt(dimensionMatch[2]);
          if (width >= 400 && height >= 300) score += 15;
        }
        
        // Penalize likely UI elements
        const uiKeywords = ['logo', 'icon', 'button', 'banner', 'header', 'footer', 'nav', 'menu', 'social'];
        uiKeywords.forEach(keyword => {
          if (urlLower.includes(keyword)) score -= 20;
        });
        
        return score;
      };
      
      // Sort by priority and take top images
      const prioritizedImages = allImages
        .map(url => ({ url, score: prioritizeImage(url) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8) // Increase limit to 8 images
        .map(item => item.url);
      
      extractedImages = prioritizedImages;
      console.log(`Extracted ${extractedImages.length} prioritized images:`, extractedImages.map(img => img.substring(0, 100)));
    }
    
    // Extract text content
    let content = html;
    
    // Remove script and style tags
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Extract text from HTML tags
    content = content.replace(/<[^>]*>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();
    
    // Look for recipe-specific content
    const recipeKeywords = ['ingredients', 'instructions', 'directions', 'recipe', 'cook', 'prep'];
    const lines = content.split('\n');
    const relevantLines = lines.filter(line => 
      recipeKeywords.some(keyword => line.toLowerCase().includes(keyword)) ||
      line.length > 20
    );
    
    const extractedContent = relevantLines.join('\n').substring(0, 8000); // Limit content size
    
    console.log('Extracted content length:', extractedContent.length);
    return { content: extractedContent, images: extractedImages };
  } catch (error) {
    console.error('Error extracting website content:', error);
    throw new Error(`Could not extract content from website: ${error.message}`);
  }
}

// OpenAI API call without flex processing
async function callOpenAI(systemPrompt: string, userPrompt: string) {
  const requestBody = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  };

  return await retryWithBackoff(async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      
      if (response.status === 429) {
        const error = new Error(`Resource unavailable: ${errorData.error?.message || 'Rate limited'}`);
        (error as any).status = 429;
        throw error;
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Parse recipe request:', Object.keys(body));

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';
    let websiteImages: string[] = [];

    // Handle different request types
    if (body.websiteUrl) {
      // Website URL import
      console.log('Processing website URL:', body.websiteUrl);
      
      const extractResult = await extractWebsiteContent(body.websiteUrl, body.extractImages);
      const websiteContent = extractResult.content;
      websiteImages = extractResult.images;
      
      systemPrompt = `You are a recipe parsing assistant. Extract recipe information from website content and classify it across 6 dimensions. 

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian", 
    "cookingMethod": "oven_baked",
    "dietLifestyle": [],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification rules:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european  
- cookingMethod: one_pot, oven_baked, air_fryer, slow_cooker, pressure_cooker, bbq_grilled, stir_fried, roasted, raw_no_cook
- dietLifestyle: ONLY include if 100% certain - check ALL ingredients carefully for meat/dairy/gluten: vegetarian, vegan, pescatarian, gluten_free, dairy_free, low_carb_keto, high_protein, paleo, diabetic_friendly, budget_meals, kid_friendly, pregnancy_safe
- complexityLevel: quick_easy, standard, complex
- mainIngredient: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

IMPORTANT: If you detect ANY meat ingredients (ground beef, mince, chicken, etc.), do NOT include "vegetarian" in dietLifestyle array. Leave dietLifestyle empty if unsure.

Return ONLY valid JSON. No explanations.`;

      userPrompt = `Extract recipe information from this website content:\n\n${websiteContent}`;
      
    } else if (body.recipeText) {
      systemPrompt = `You are a recipe parsing assistant. Extract recipe information from text and classify it across 6 dimensions. 

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian", 
    "cookingMethod": "oven_baked",
    "dietLifestyle": [],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification rules:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european  
- cookingMethod: one_pot, oven_baked, air_fryer, slow_cooker, pressure_cooker, bbq_grilled, stir_fried, roasted, raw_no_cook
- dietLifestyle: ONLY include if 100% certain - check ALL ingredients carefully for meat/dairy/gluten: vegetarian, vegan, pescatarian, gluten_free, dairy_free, low_carb_keto, high_protein, paleo, diabetic_friendly, budget_meals, kid_friendly, pregnancy_safe
- complexityLevel: quick_easy, standard, complex
- mainIngredient: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

IMPORTANT: If you detect ANY meat ingredients (ground beef, mince, chicken, etc.), do NOT include "vegetarian" in dietLifestyle array. Leave dietLifestyle empty if unsure.

Return ONLY valid JSON. No explanations.`;

      userPrompt = `Parse this recipe text and classify it:\n\n${body.recipeText}`;
      
    } else if (body.generateRequest) {
      // AI recipe generation
      console.log('Generating recipe with AI for:', body.generateRequest);
      
      systemPrompt = `You are a creative recipe generator. Create an original recipe based on the user's request and classify it across 6 dimensions.

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)", 
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian",
    "cookingMethod": "oven_baked", 
    "dietLifestyle": [],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification rules:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european
- cookingMethod: one_pot, oven_baked, air_fryer, slow_cooker, pressure_cooker, bbq_grilled, stir_fried, roasted, raw_no_cook  
- dietLifestyle: ONLY include if 100% certain - check ALL ingredients carefully for meat/dairy/gluten: vegetarian, vegan, pescatarian, gluten_free, dairy_free, low_carb_keto, high_protein, paleo, diabetic_friendly, budget_meals, kid_friendly, pregnancy_safe
- complexityLevel: quick_easy, standard, complex
- mainIngredient: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

IMPORTANT: If you detect ANY meat ingredients (ground beef, mince, chicken, etc.), do NOT include "vegetarian" in dietLifestyle array. Leave dietLifestyle empty if unsure.

Create realistic recipes with proper ingredient amounts and detailed cooking steps. Return ONLY valid JSON.`;

      let generationPrompt = body.generateRequest;
      
      // Add style preferences to the prompt
      if (body.stylePreferences && body.stylePreferences.length > 0) {
        const styleDescriptions = {
          'quick-easy': 'Make this recipe quick and easy with minimal prep time and simple techniques',
          'cheap-cheerful': 'Focus on budget-friendly ingredients and cost-effective cooking methods',
          'michelin-star': 'Create an elevated, restaurant-quality dish with sophisticated techniques and presentation'
        };
        
        const styles = body.stylePreferences.map(style => styleDescriptions[style] || style).join(', ');
        generationPrompt += `\n\nStyle preferences: ${styles}`;
      }
      
      userPrompt = `Generate a recipe for: ${generationPrompt}`;
      
    } else {
      throw new Error('Missing required parameters. Provide websiteUrl, recipeText, or generateRequest.');
    }

    // Make OpenAI API call with retry logic
    const data = await callOpenAI(systemPrompt, userPrompt);
    const content_text = data.choices[0].message.content;

    console.log('OpenAI response received, parsing JSON...');

    try {
      const parsedRecipe = JSON.parse(content_text);
      
      // Validate and clean the response
      const cleanedRecipe = {
        title: parsedRecipe.title || 'Untitled Recipe',
        description: parsedRecipe.description || '',
        ingredients: Array.isArray(parsedRecipe.ingredients) ? parsedRecipe.ingredients : [],
        instructions: Array.isArray(parsedRecipe.instructions) ? parsedRecipe.instructions : [],
        topTip: parsedRecipe.topTip || 'Enjoy cooking this delicious recipe!',
        prepTime: Math.max(0, parseInt(parsedRecipe.prepTime) || 0),
        cookTime: Math.max(0, parseInt(parsedRecipe.cookTime) || 0),
        servings: Math.max(1, parseInt(parsedRecipe.servings) || 1),
        // Include classification
        mealType: parsedRecipe.classification?.mealType,
        cuisineRegion: parsedRecipe.classification?.cuisineRegion,
        cookingMethod: parsedRecipe.classification?.cookingMethod,
        dietLifestyle: Array.isArray(parsedRecipe.classification?.dietLifestyle) 
          ? parsedRecipe.classification.dietLifestyle 
          : [],
        complexityLevel: parsedRecipe.classification?.complexityLevel,
        mainIngredient: parsedRecipe.classification?.mainIngredient,
      };

      console.log('Recipe parsed successfully:', {
        title: cleanedRecipe.title,
        classification: parsedRecipe.classification,
        websiteImagesFound: websiteImages.length
      });

      // Return response with images if they were extracted
      const response = { 
        parsedRecipe: cleanedRecipe,
        ...(websiteImages.length > 0 && { websiteImages })
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Raw content:', content_text);
      
      // Return a fallback response
      return new Response(JSON.stringify({
        error: 'Failed to parse recipe',
        rawResponse: content_text
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in parse-recipe-ai function:', error);
    
    // Provide specific error messages for different failure types
    let errorMessage = error.message;
    if (error.message?.includes('Resource unavailable')) {
      errorMessage = 'AI service is temporarily busy. Please try again in a moment.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try with a shorter recipe or try again later.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Too many requests. Please wait a moment before trying again.';
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
