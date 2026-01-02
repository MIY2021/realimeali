
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to clean markdown formatting from text
function cleanMarkdownFormatting(text: string): string {
  if (!text) return text;
  
  // Remove markdown headers (### ## #)
  text = text.replace(/^#{1,6}\s*/gm, '');
  
  // Remove markdown bold (**text** or __text__)
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  
  // Remove markdown italic (*text* or _text_)
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Remove markdown code blocks (```text```)
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code (`text`)
  text = text.replace(/`([^`]+)`/g, '$1');
  
  return text.trim();
}

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

CRITICAL: When parsing ingredients, you MUST distinguish between:

1. **Ingredient groups/headers** - Text that describes a COMPONENT or SECTION containing multiple ingredients
   - Examples: "SESAME-GINGER DRESSING" (a component made from multiple ingredients), "For the sauce:" (introduces sauce ingredients), "Marinade:" (describes a component), "Cream Cheese Frosting" (describes a component, not a single ingredient)
   - Semantic indicators: Words like dressing, sauce, marinade, topping, garnish, filling, crust, batter, glaze, rub, spice mix, seasoning, paste, puree, reduction
   - Context: Usually appears before a list of ingredients that belong to that component
   - Format: Should end with colon when included in ingredients array

2. **Individual ingredients** - Specific items with quantities needed for the recipe
   - Examples: "2 tbsp soy sauce" (specific item with quantity), "1 clove garlic" (specific item), "SESAME OIL" (specific ingredient, even if ALL CAPS), "Ginger Root" (specific ingredient), "Cream Cheese" (specific ingredient, not a component)
   - These are things you can buy or measure directly

SEMANTIC UNDERSTANDING RULES:
- If text describes something that CONTAINS or IS MADE FROM multiple ingredients → it's a group header
- If text is a specific item you can buy/measure → it's an individual ingredient
- Groups often introduce sections: "For the [component]:", "[Component]:" followed by ingredients
- Component names (dressing, sauce, marinade, etc.) indicate groups, not individual ingredients

IMPORTANT EXAMPLES:
- "SESAME-GINGER DRESSING" describes a component (group), even without colon - add colon when including
- "SESAME OIL" is a specific ingredient (not a group), even if ALL CAPS
- "Cream Cheese Frosting" describes a component (group), not a single ingredient
- "Cream Cheese" is a specific ingredient (not a group)
- Context matters: read what follows to understand if it's introducing a section

Before finalizing ingredients, review each entry semantically: Does it describe a component/collection, or a specific item? If component, ensure it ends with colon.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["For the duck ragú:", "2 duck breasts, trimmed", "1 tbsp olive oil", "For the garnish:", "6 slices pancetta"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "alcoholicPairing": "A specific wine, beer, or cocktail that pairs well with this dish",
  "nonAlcoholicPairing": "A specific non-alcoholic beverage pairing (mocktail, tea, sparkling water, etc.)",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian" or ["italian", "mediterranean"] if multiple cuisines apply, 
    "cookingMethod": "oven_baked",
    "dietLifestyle": [],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification rules:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european (can be a single string or array of strings if multiple cuisines apply - REQUIRED: always suggest at least one cuisine based on ingredients, cooking methods, and recipe name)  
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

CRITICAL: When parsing ingredients, you MUST distinguish between:

1. **Ingredient groups/headers** - Text that describes a COMPONENT or SECTION containing multiple ingredients
   - Examples: "SESAME-GINGER DRESSING" (a component made from multiple ingredients), "For the sauce:" (introduces sauce ingredients), "Marinade:" (describes a component), "Cream Cheese Frosting" (describes a component, not a single ingredient)
   - Semantic indicators: Words like dressing, sauce, marinade, topping, garnish, filling, crust, batter, glaze, rub, spice mix, seasoning, paste, puree, reduction
   - Context: Usually appears before a list of ingredients that belong to that component
   - Format: Should end with colon when included in ingredients array

2. **Individual ingredients** - Specific items with quantities needed for the recipe
   - Examples: "2 tbsp soy sauce" (specific item with quantity), "1 clove garlic" (specific item), "SESAME OIL" (specific ingredient, even if ALL CAPS), "Ginger Root" (specific ingredient), "Cream Cheese" (specific ingredient, not a component)
   - These are things you can buy or measure directly

SEMANTIC UNDERSTANDING RULES:
- If text describes something that CONTAINS or IS MADE FROM multiple ingredients → it's a group header
- If text is a specific item you can buy/measure → it's an individual ingredient
- Groups often introduce sections: "For the [component]:", "[Component]:" followed by ingredients
- Component names (dressing, sauce, marinade, etc.) indicate groups, not individual ingredients

IMPORTANT EXAMPLES:
- "SESAME-GINGER DRESSING" describes a component (group), even without colon - add colon when including
- "SESAME OIL" is a specific ingredient (not a group), even if ALL CAPS
- "Cream Cheese Frosting" describes a component (group), not a single ingredient
- "Cream Cheese" is a specific ingredient (not a group)
- Context matters: read what follows to understand if it's introducing a section

Before finalizing ingredients, review each entry semantically: Does it describe a component/collection, or a specific item? If component, ensure it ends with colon.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["For the duck ragú:", "2 duck breasts, trimmed", "1 tbsp olive oil", "For the garnish:", "6 slices pancetta"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "alcoholicPairing": "A specific wine, beer, or cocktail that pairs well with this dish",
  "nonAlcoholicPairing": "A specific non-alcoholic beverage pairing (mocktail, tea, sparkling water, etc.)",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian" or ["italian", "mediterranean"] if multiple cuisines apply, 
    "cookingMethod": "oven_baked",
    "dietLifestyle": [],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification rules:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european (can be a single string or array of strings if multiple cuisines apply - REQUIRED: always suggest at least one cuisine based on ingredients, cooking methods, and recipe name)  
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

CRITICAL: When parsing ingredients, you MUST distinguish between:

1. **Ingredient groups/headers** - Text that describes a COMPONENT or SECTION containing multiple ingredients
   - Examples: "SESAME-GINGER DRESSING" (a component made from multiple ingredients), "For the sauce:" (introduces sauce ingredients), "Marinade:" (describes a component), "Cream Cheese Frosting" (describes a component, not a single ingredient)
   - Semantic indicators: Words like dressing, sauce, marinade, topping, garnish, filling, crust, batter, glaze, rub, spice mix, seasoning, paste, puree, reduction
   - Context: Usually appears before a list of ingredients that belong to that component
   - Format: Should end with colon when included in ingredients array

2. **Individual ingredients** - Specific items with quantities needed for the recipe
   - Examples: "2 tbsp soy sauce" (specific item with quantity), "1 clove garlic" (specific item), "SESAME OIL" (specific ingredient, even if ALL CAPS), "Ginger Root" (specific ingredient), "Cream Cheese" (specific ingredient, not a component)
   - These are things you can buy or measure directly

SEMANTIC UNDERSTANDING RULES:
- If text describes something that CONTAINS or IS MADE FROM multiple ingredients → it's a group header
- If text is a specific item you can buy/measure → it's an individual ingredient
- Groups often introduce sections: "For the [component]:", "[Component]:" followed by ingredients
- Component names (dressing, sauce, marinade, etc.) indicate groups, not individual ingredients

IMPORTANT EXAMPLES:
- "SESAME-GINGER DRESSING" describes a component (group), even without colon - add colon when including
- "SESAME OIL" is a specific ingredient (not a group), even if ALL CAPS
- "Cream Cheese Frosting" describes a component (group), not a single ingredient
- "Cream Cheese" is a specific ingredient (not a group)
- Context matters: read what follows to understand if it's introducing a section

Before finalizing ingredients, review each entry semantically: Does it describe a component/collection, or a specific item? If component, ensure it ends with colon.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["For the duck ragú:", "2 duck breasts, trimmed", "1 tbsp olive oil", "For the garnish:", "6 slices pancetta"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "alcoholicPairing": "A specific wine, beer, or cocktail that pairs well with this dish",
  "nonAlcoholicPairing": "A specific non-alcoholic beverage pairing (mocktail, tea, sparkling water, etc.)",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian" or ["italian", "mediterranean"] if multiple cuisines apply, 
    "cookingMethod": "oven_baked",
    "dietLifestyle": [],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification rules:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european (can be a single string or array of strings if multiple cuisines apply - REQUIRED: always suggest at least one cuisine based on ingredients, cooking methods, and recipe name)  
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
      
      // Check if this is a quick ideas only request
      if (body.quickIdeasOnly) {
        systemPrompt = `You are a creative recipe idea generator. Generate exactly 3 distinct recipe ideas based on the user's request.

Return ONLY a JSON array in this EXACT format:
[
  {"title": "Recipe Name 1", "description": "Brief appealing description"},
  {"title": "Recipe Name 2", "description": "Brief appealing description"},
  {"title": "Recipe Name 3", "description": "Brief appealing description"}
]

Requirements:
- Titles should be creative, appetizing, and cookbook-quality
- Descriptions should be 1 sentence, max 20 words, and make people want to cook it
- Make the 3 ideas distinct in cooking style, cuisine, or approach
- Focus on making titles irresistible and engaging

Return ONLY the JSON array, no other text.`;

        userPrompt = body.generateRequest;
        
      } else {
        // Full recipe generation
        systemPrompt = `You are a creative recipe generator. Create an original recipe based on the user's request and classify it across 6 dimensions.

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

IMPORTANT: When creating ingredients, if the recipe naturally has sections (like sauce, marinade, garnish), include section headers as separate entries in the ingredients array with a colon at the end.

IMPORTANT: Recipe titles should be clean, descriptive text WITHOUT any markdown formatting (no #, **, etc.). Just plain text titles.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)", 
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": ["step 1", "step 2"],
  "topTip": "One helpful cooking tip",
  "alcoholicPairing": "A specific wine, beer, or cocktail that pairs well with this dish",
  "nonAlcoholicPairing": "A specific non-alcoholic beverage pairing (mocktail, tea, sparkling water, etc.)",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "classification": {
    "mealType": "dinner",
    "cuisineRegion": "italian" or ["italian", "mediterranean"] if multiple cuisines apply,
    "cookingMethod": "oven_baked", 
    "dietLifestyle": [],
    "complexityLevel": "standard",
    "mainIngredient": "pasta"
  }
}

Classification rules:
- mealType: breakfast, lunch, dinner, snacks, sides, desserts, drinks, sauces_dips, soups_stews, salads, baking_breads
- cuisineRegion: british, american, italian, french, mexican, indian, chinese, japanese, thai, mediterranean, middle_eastern, african, korean, caribbean, nordic, eastern_european (can be a single string or array of strings if multiple cuisines apply - REQUIRED: always suggest at least one cuisine based on ingredients, cooking methods, and recipe name)
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
      }
      
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
      
      // Handle quick ideas response (array format)
      if (body.quickIdeasOnly) {
        const quickIdeas = JSON.parse(cleanedContent);
        
        if (Array.isArray(quickIdeas)) {
          console.log('Quick ideas generated successfully:', quickIdeas.length);
          return new Response(JSON.stringify({ quickIdeas }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          throw new Error('Expected array format for quick ideas');
        }
      }
      
      const parsedRecipe = JSON.parse(cleanedContent);
      
      // Validate and clean the response
      const rawIngredients = Array.isArray(parsedRecipe.ingredients) ? parsedRecipe.ingredients : [];
      
      // Optional: Log potential missed ingredient groups for monitoring
      // (Conservative check - only flags obvious cases with group keywords)
      const groupKeywords = ['dressing', 'sauce', 'marinade', 'topping', 'garnish', 'filling', 'crust', 'batter', 'glaze', 'rub', 'spice mix', 'seasoning', 'paste', 'puree', 'reduction', 'frosting', 'icing'];
      const measurementWords = ['cup', 'cups', 'tbsp', 'tablespoon', 'tsp', 'teaspoon', 'oz', 'ounce', 'lb', 'pound', 'g', 'gram', 'ml', 'milliliter'];
      
      const potentialMissedGroups: string[] = [];
      for (let i = 0; i < rawIngredients.length; i++) {
        const ing = String(rawIngredients[i] || '').trim();
        if (!ing || ing.endsWith(':')) continue; // Skip empty or already-formatted groups
        
        const lowerIng = ing.toLowerCase();
        const hasGroupKeyword = groupKeywords.some(kw => lowerIng.includes(kw));
        const hasQuantity = /\d/.test(ing) || measurementWords.some(mw => lowerIng.includes(mw));
        const hasFollowingIngredients = i < rawIngredients.length - 1 && rawIngredients.slice(i + 1, i + 3).length >= 2;
        const startsWithFor = /^for\s+(the\s+)?/i.test(ing);
        
        // Very conservative: only log if has keyword, no quantity, and (has context OR starts with "For")
        if (hasGroupKeyword && !hasQuantity && (hasFollowingIngredients || startsWithFor)) {
          potentialMissedGroups.push(ing);
        }
      }
      
      if (potentialMissedGroups.length > 0) {
        console.log(`[IngredientGroupDetector] Potential missed group headers (for review):`, potentialMissedGroups);
      }
      
      const cleanedRecipe = {
        title: cleanMarkdownFormatting(parsedRecipe.title) || 'Untitled Recipe',
        description: parsedRecipe.description || '',
        ingredients: rawIngredients,
        instructions: Array.isArray(parsedRecipe.instructions) ? parsedRecipe.instructions : [],
        topTip: parsedRecipe.topTip || 'Enjoy cooking this delicious recipe!',
        alcoholicPairing: parsedRecipe.alcoholicPairing || null,
        nonAlcoholicPairing: parsedRecipe.nonAlcoholicPairing || null,
        prepTime: Math.max(0, parseInt(parsedRecipe.prepTime) || 0),
        cookTime: Math.max(0, parseInt(parsedRecipe.cookTime) || 0),
        servings: Math.max(1, parseInt(parsedRecipe.servings) || 1),
        // Include classification
        mealType: parsedRecipe.classification?.mealType,
        cuisineRegion: parsedRecipe.classification?.cuisineRegion || 'british', // Can be string or array, default to british if not provided
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
