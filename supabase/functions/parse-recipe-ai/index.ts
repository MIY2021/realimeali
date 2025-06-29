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

// Enhanced website content extraction with better redirect handling
async function extractWebsiteContent(url: string, extractImages: boolean = false) {
  try {
    console.log('Fetching website content from:', url);
    
    // Enhanced fetch with better redirect handling and headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow', // Explicitly allow redirects
      // Increase timeout for slow websites
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${response.statusText}`);
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Successfully fetched ${html.length} characters from ${response.url}`);
    
    let extractedImages: string[] = [];
    
    // Extract images if requested
    if (extractImages) {
      console.log('Extracting images from website with enhanced patterns...');
      
      const imageUrls = new Set<string>();
      const finalUrl = response.url; // Use the final URL after redirects
      
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
          
          // Convert relative URLs to absolute using the final URL
          if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
          } else if (imageUrl.startsWith('/')) {
            const urlObj = new URL(finalUrl);
            imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
          } else if (!imageUrl.startsWith('http')) {
            const urlObj = new URL(finalUrl);
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
            const urlObj = new URL(finalUrl);
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
          const urlObj = new URL(finalUrl);
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
      console.log(`Extracted ${extractedImages.length} prioritized images`);
    }
    
    // Extract text content with better cleaning
    let content = html;
    
    // Remove script and style tags
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    // Extract text from HTML tags
    content = content.replace(/<[^>]*>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();
    
    // Look for recipe-specific content with better filtering
    const recipeKeywords = ['ingredients', 'instructions', 'directions', 'recipe', 'cook', 'prep', 'method', 'steps'];
    const lines = content.split(/[.\n\r]/).filter(line => line.trim().length > 0);
    
    // Filter for relevant content
    const relevantLines = lines.filter(line => {
      const cleanLine = line.trim().toLowerCase();
      return cleanLine.length > 20 && (
        recipeKeywords.some(keyword => cleanLine.includes(keyword)) ||
        cleanLine.length > 50 // Include longer descriptive lines
      );
    });
    
    const extractedContent = relevantLines.join('\n').substring(0, 12000); // Increase content limit
    
    console.log('Extracted content length:', extractedContent.length);
    console.log('Number of relevant lines:', relevantLines.length);
    
    return { content: extractedContent, images: extractedImages };
    
  } catch (error) {
    console.error('Error extracting website content:', error);
    
    // Provide more specific error messages
    if (error.name === 'TimeoutError') {
      throw new Error(`Website timeout: The website took too long to respond. This often happens with slow or overloaded websites.`);
    } else if (error.message?.includes('redirect')) {
      throw new Error(`Too many redirects: The website redirected too many times. This might be due to website configuration issues or geo-blocking.`);
    } else if (error.message?.includes('fetch')) {
      throw new Error(`Network error: Could not connect to the website. This might be due to network issues or the website blocking automated requests.`);
    } else {
      throw new Error(`Could not extract content from website: ${error.message}`);
    }
  }
}

// OpenAI API call for recipe parsing
async function callOpenAI(systemPrompt: string, userPrompt: string, imageData?: string) {
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  if (imageData) {
    // Use GPT-4o for vision capabilities
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: userPrompt },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageData}`
          }
        }
      ]
    });
  } else {
    messages.push({ role: 'user', content: userPrompt });
  }

  const requestBody = {
    model: imageData ? 'gpt-4o' : 'gpt-4o-mini',
    messages,
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

// Helper function to clean JSON response from OpenAI
function cleanJsonResponse(content: string): string {
  // Remove markdown code blocks if present
  let cleaned = content.trim();
  
  // Remove ```json at the start
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  }
  
  // Remove ``` at the end
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  
  // Remove any remaining markdown formatting
  cleaned = cleaned.replace(/^```\w*\s*/, '').replace(/\s*```$/, '');
  
  return cleaned.trim();
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

IMPORTANT: When parsing ingredients, preserve section headers by including them as separate entries in the ingredients array. For example:
- If you see "For the sauce:" followed by ingredients, include "For the sauce:" as its own entry
- If you see "For the garnish:" followed by ingredients, include "For the garnish:" as its own entry
- Section headers should end with a colon and be included exactly as they appear

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["For the duck ragú:", "2 duck breasts, trimmed", "1 tbsp olive oil", "For the garnish:", "6 slices pancetta"],
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
- mainIngredient: MUST be one of these EXACT values: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

IMPORTANT: For mainIngredient, if the primary ingredient doesn't match exactly, choose the closest match:
- Hot dogs/sausages → pork (or beef if beef hot dogs)
- Seafood/shellfish → fish
- Any beans/legumes → lentils_beans
- Mixed vegetables → vegetables
- Bread/flour items → pasta (closest grain option)
- Dairy items → cheese
- Nuts or seeds → nuts_seeds

If you detect ANY meat ingredients (ground beef, mince, chicken, etc.), do NOT include "vegetarian" in dietLifestyle array. Leave dietLifestyle empty if unsure.

Return ONLY valid JSON. No explanations.`;

      userPrompt = `Extract recipe information from this website content:\n\n${websiteContent}`;
      
    } else if (body.recipeText) {
      systemPrompt = `You are a recipe parsing assistant. Extract recipe information from text and classify it across 6 dimensions. 

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

IMPORTANT: When parsing ingredients, preserve section headers by including them as separate entries in the ingredients array. For example:
- If you see "For the sauce:" followed by ingredients, include "For the sauce:" as its own entry
- If you see "For the garnish:" followed by ingredients, include "For the garnish:" as its own entry
- Section headers should end with a colon and be included exactly as they appear

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["For the duck ragú:", "2 duck breasts, trimmed", "1 tbsp olive oil", "For the garnish:", "6 slices pancetta"],
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
- mainIngredient: MUST be one of these EXACT values: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

IMPORTANT: For mainIngredient, if the primary ingredient doesn't match exactly, choose the closest match:
- Hot dogs/sausages → pork (or beef if beef hot dogs)
- Seafood/shellfish → fish
- Any beans/legumes → lentils_beans
- Mixed vegetables → vegetables
- Bread/flour items → pasta (closest grain option)
- Dairy items → cheese
- Nuts or seeds → nuts_seeds

If you detect ANY meat ingredients (ground beef, mince, chicken, etc.), do NOT include "vegetarian" in dietLifestyle array. Leave dietLifestyle empty if unsure.

Return ONLY valid JSON. No explanations.`;

      userPrompt = `Parse this recipe text and classify it:\n\n${body.recipeText}`;
      
    } else if (body.image && body.mimeType) {
      // Handle image processing with OCR
      console.log('Processing image with OCR:', body.mimeType);
      
      systemPrompt = `You are a recipe parsing assistant with vision capabilities. Read and extract recipe information from the provided image and classify it across 6 dimensions.

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

IMPORTANT: When parsing ingredients, preserve section headers by including them as separate entries in the ingredients array. For example:
- If you see "For the sauce:" followed by ingredients, include "For the sauce:" as its own entry
- If you see "For the garnish:" followed by ingredients, include "For the garnish:" as its own entry
- Section headers should end with a colon and be included exactly as they appear

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["For the duck ragú:", "2 duck breasts, trimmed", "1 tbsp olive oil", "For the garnish:", "6 slices pancetta"],
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
- dietLifestyle: ONLY include if if 100% certain - check ALL ingredients carefully for meat/dairy/gluten: vegetarian, vegan, pescatarian, gluten_free, dairy_free, low_carb_keto, high_protein, paleo, diabetic_friendly, budget_meals, kid_friendly, pregnancy_safe
- complexityLevel: quick_easy, standard, complex
- mainIngredient: MUST be one of these EXACT values: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

IMPORTANT: For mainIngredient, if the primary ingredient doesn't match exactly, choose the closest match:
- Hot dogs/sausages → pork (or beef if beef hot dogs)
- Seafood/shellfish → fish
- Any beans/legumes → lentils_beans
- Mixed vegetables → vegetables
- Bread/flour items → pasta (closest grain option)
- Dairy items → cheese
- Nuts or seeds → nuts_seeds

If you detect ANY meat ingredients (ground beef, mince, chicken, etc.), do NOT include "vegetarian" in dietLifestyle array. Leave dietLifestyle empty if unsure.

Return ONLY valid JSON. No explanations.`;

      userPrompt = `Please read this recipe image and extract all the recipe information including title, ingredients, instructions, cooking times, and servings. Look carefully for all text in the image, including handwritten notes, printed text, or any recipe details visible in the photo.`;
      
    } else if (body.generateRequest) {
      // AI recipe generation
      console.log('Generating recipe with AI for:', body.generateRequest);
      
      systemPrompt = `You are a creative recipe generator. Create an original recipe based on the user's request and classify it across 6 dimensions.

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

IMPORTANT: When creating ingredients, if the recipe naturally has sections (like sauce, marinade, garnish), include section headers as separate entries in the ingredients array with a colon at the end.

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
- dietLifestyle: ONLY include if if 100% certain - check ALL ingredients carefully for meat/dairy/gluten: vegetarian, vegan, pescatarian, gluten_free, dairy_free, low_carb_keto, high_protein, paleo, diabetic_friendly, budget_meals, kid_friendly, pregnancy_safe
- complexityLevel: quick_easy, standard, complex
- mainIngredient: MUST be one of these EXACT values: chicken, beef, pork, lamb, fish, tofu_tempeh, eggs, cheese, pasta, rice, lentils_beans, vegetables, potatoes, fruit, nuts_seeds, chocolate

IMPORTANT: For mainIngredient, if the primary ingredient doesn't match exactly, choose the closest match:
- Hot dogs/sausages → pork (or beef if beef hot dogs)
- Seafood/shellfish → fish
- Any beans/legumes → lentils_beans
- Mixed vegetables → vegetables
- Bread/flour items → pasta (closest grain option)
- Dairy items → cheese
- Nuts or seeds → nuts_seeds

If you detect ANY meat ingredients (ground beef, mince, chicken, etc.), do NOT include "vegetarian" in dietLifestyle array. Leave dietLifestyle empty if unsure.

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
      throw new Error('Missing required parameters. Provide websiteUrl, recipeText, image with mimeType, or generateRequest.');
    }

    // Make OpenAI API call with retry logic
    const data = await callOpenAI(systemPrompt, userPrompt, body.image);
    const content_text = data.choices[0].message.content;

    console.log('OpenAI response received, parsing JSON...');

    try {
      // Clean the JSON response before parsing
      const cleanedContent = cleanJsonResponse(content_text);
      console.log('Cleaned content:', cleanedContent);
      
      const parsedRecipe = JSON.parse(cleanedContent);
      
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

      // Return response based on request type
      if (body.image && body.mimeType) {
        // For image processing, return the recipe data
        return new Response(JSON.stringify({ recipe: cleanedRecipe }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // For other requests, return parsedRecipe format
        const response = { 
          parsedRecipe: cleanedRecipe,
          ...(websiteImages.length > 0 && { websiteImages })
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
