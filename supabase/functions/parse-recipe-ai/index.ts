
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

// Helper function to extract recipe data from JSON-LD structured data
// Returns structured content only if BOTH ingredients AND instructions are present
function extractRecipeFromStructuredData(jsonLdData: any): string | null {
  try {
    // Handle arrays (many sites wrap structured data in arrays)
    const dataArray = Array.isArray(jsonLdData) ? jsonLdData : [jsonLdData];
    
    for (const item of dataArray) {
      // Handle @graph arrays (used by some sites)
      const itemsToCheck = item['@graph'] || [item];
      
      for (const data of itemsToCheck) {
        // Check if this is a Recipe schema
        const type = data['@type'] || data.type;
        if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
          console.log('Found Recipe structured data');
          
          const title = data.name || data.headline || '';
          const description = data.description || '';
          
          // Extract ingredients - REQUIRED
          let ingredientsText = '';
          let hasIngredients = false;
          if (data.recipeIngredient) {
            const ingredients = Array.isArray(data.recipeIngredient) 
              ? data.recipeIngredient 
              : [data.recipeIngredient];
            if (ingredients.length > 0 && ingredients.some((ing: any) => ing && ing.trim && ing.trim().length > 0)) {
              ingredientsText = 'Ingredients:\n' + ingredients.map((ing: string) => `- ${ing}`).join('\n');
              hasIngredients = true;
            }
          }
          
          // Extract instructions - REQUIRED
          let instructionsText = '';
          let hasInstructions = false;
          if (data.recipeInstructions) {
            const instructions = Array.isArray(data.recipeInstructions) 
              ? data.recipeInstructions 
              : [data.recipeInstructions];
            
            let stepIndex = 1;
            let instructionSteps: string[] = [];
            
            const extractInstructionStep = (step: any): void => {
              if (typeof step === 'string' && step.trim().length > 0) {
                instructionSteps.push(`${stepIndex}. ${step}`);
                stepIndex++;
              } else if (step.text || step.name) {
                const stepText = (step.text || step.name).trim();
                if (stepText.length > 0) {
                  instructionSteps.push(`${stepIndex}. ${stepText}`);
                  stepIndex++;
                }
              } else if (step['@type'] === 'HowToStep') {
                const stepText = (step.text || step.name || '').trim();
                if (stepText.length > 0) {
                  instructionSteps.push(`${stepIndex}. ${stepText}`);
                  stepIndex++;
                }
              } else if (step['@type'] === 'HowToSection') {
                // Handle sections that contain multiple steps
                if (step.itemListElement && Array.isArray(step.itemListElement)) {
                  step.itemListElement.forEach((item: any) => extractInstructionStep(item));
                }
              } else if (step.position) {
                const stepText = (step.text || step.name || '').trim();
                if (stepText.length > 0) {
                  instructionSteps.push(`${step.position}. ${stepText}`);
                  stepIndex++;
                }
              }
            };
            
            instructions.forEach(extractInstructionStep);
            
            if (instructionSteps.length > 0) {
              instructionsText = '\n\nInstructions:\n' + instructionSteps.join('\n');
              hasInstructions = true;
            }
          }
          
          // Only return content if BOTH ingredients AND instructions are present
          if (!hasIngredients || !hasInstructions) {
            console.log('Structured data incomplete - missing ingredients or instructions', {
              hasIngredients,
              hasInstructions
            });
            return null;
          }
          
          // Extract additional metadata (optional)
          let metadataText = '';
          if (data.prepTime) metadataText += `Prep Time: ${data.prepTime}\n`;
          if (data.cookTime) metadataText += `Cook Time: ${data.cookTime}\n`;
          if (data.totalTime) metadataText += `Total Time: ${data.totalTime}\n`;
          if (data.recipeYield) metadataText += `Servings: ${data.recipeYield}\n`;
          
          const structuredContent = [
            title ? `Recipe: ${title}` : '',
            description,
            metadataText,
            ingredientsText,
            instructionsText
          ].filter(Boolean).join('\n\n');
          
          if (structuredContent.trim().length > 0) {
            console.log('Successfully extracted complete recipe from structured data');
            return structuredContent;
          }
        }
      }
    }
  } catch (error) {
    console.log('Error extracting recipe from structured data:', error);
  }
  
  return null;
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
      
      // Check for paywall/access issues
      if (response.status === 403 || response.status === 402) {
        throw new Error('This website requires authentication or a subscription. We cannot extract recipes from paywalled content.');
      } else if (response.status === 401) {
        throw new Error('This website requires authentication. We cannot extract recipes from protected content.');
      }
      
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Successfully fetched ${html.length} characters from ${response.url}`);
    
    let extractedImages: string[] = [];
    let structuredRecipeContent: string | null = null;
    
    // First, try to extract recipe content from JSON-LD structured data (always do this)
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      console.log('Found JSON-LD structured data blocks:', jsonLdMatches.length);
      jsonLdMatches.forEach(match => {
        try {
          const jsonContent = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
          const data = JSON.parse(jsonContent);
          
          // Try to extract recipe content from structured data (only once)
          if (!structuredRecipeContent) {
            structuredRecipeContent = extractRecipeFromStructuredData(data);
          }
        } catch (e) {
          console.log('Failed to parse JSON-LD block:', e);
        }
      });
    }
    
    // Extract images if requested
    if (extractImages) {
      console.log('Extracting images from website with enhanced patterns...');
      
      const imageUrls = new Set<string>();
      const finalUrl = response.url; // Use the final URL after redirects
      
      // Extract from JSON-LD structured data for images (if not already parsed)
      if (jsonLdMatches) {
        jsonLdMatches.forEach(match => {
          try {
            const jsonContent = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
            const data = JSON.parse(jsonContent);
            
            // Extract images from structured data
            const extractImagesFromStructuredData = (obj: any) => {
              if (!obj) return;
              
              if (typeof obj === 'string' && obj.match(/\.(jpg|jpeg|png|webp)$/i)) {
                imageUrls.add(obj);
              } else if (Array.isArray(obj)) {
                obj.forEach(extractImagesFromStructuredData);
              } else if (typeof obj === 'object') {
                // Look for common image properties
                ['image', 'photo', 'thumbnail', 'url'].forEach(prop => {
                  if (obj[prop]) {
                    extractImagesFromStructuredData(obj[prop]);
                  }
                });
                
                // Recursively check other properties
                Object.values(obj).forEach(extractImagesFromStructuredData);
              }
            };
            
            extractImagesFromStructuredData(data);
          } catch (e) {
            console.log('Failed to parse JSON-LD block for images:', e);
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
    
    // Only use structured recipe data - no HTML text extraction fallback
    if (structuredRecipeContent) {
      console.log('Using structured recipe data from JSON-LD');
      return { content: structuredRecipeContent, images: extractedImages };
    }
    
    // No structured data found - return error
    console.log('No complete recipe structured data found in JSON-LD');
    throw new Error('This recipe website does not provide structured recipe data in a format we can reliably extract. We only extract recipes from sites that provide complete structured data (JSON-LD Schema.org Recipe format) to ensure accuracy.');
    
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

// OpenAI API call for recipe parsing/generation.
// Uses the current Responses API while preserving RealiMeali's existing response contract.
async function callOpenAI(systemPrompt: string, userPrompt: string, imageData?: string) {
  const inputContent: any[] = [
    { type: 'input_text', text: userPrompt }
  ];

  if (imageData) {
    inputContent.push({
      type: 'input_image',
      image_url: `data:image/jpeg;base64,${imageData}`
    });
  }

  const requestBody = {
    model: 'gpt-5.6-luna',
    instructions: systemPrompt,
    input: [
      {
        role: 'user',
        content: inputContent
      }
    ],
    max_output_tokens: 4000,
    text: {
      format: {
        type: 'json_object'
      }
    }
  };

  return await retryWithBackoff(async () => {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI Responses API error:', response.status, errorData);

      if (response.status === 429) {
        const error = new Error(`Resource unavailable: ${errorData.error?.message || 'Rate limited'}`);
        (error as any).status = 429;
        throw error;
      }

      if (response.status === 408 || response.status >= 500) {
        const error = new Error(`OpenAI service error: ${errorData.error?.message || response.statusText}`);
        (error as any).status = response.status === 408 ? 408 : 500;
        throw error;
      }

      throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  });
}

// Extract plain text from the Responses API result.
function getOpenAIText(data: any): string {
  if (typeof data?.output_text === 'string') {
    return data.output_text;
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const textParts: string[] = [];

  for (const item of output) {
    const contents = Array.isArray(item?.content) ? item.content : [];
    for (const part of contents) {
      if (typeof part?.text === 'string') {
        textParts.push(part.text);
      }
    }
  }

  return textParts.join('').trim();
}

// Helper function to clean JSON response from OpenAI
function cleanJsonResponse(content: string): string {
  let cleaned = (content || '').trim();

  if (cleaned.startsWith('\\`\\`\\`json')) {
    cleaned = cleaned.replace(/^\\`\\`\\`json\s*/, '');
  }

  if (cleaned.endsWith('\\`\\`\\`')) {
    cleaned = cleaned.replace(/\s*\\`\\`\\`$/, '');
  }

  cleaned = cleaned.replace(/^\\`\\`\\`\w*\s*/, '').replace(/\s*\\`\\`\\`$/, '');
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

CRITICAL: When parsing ingredients, distinguish between ingredient group headers (sections that contain multiple ingredients) and individual ingredients. Group headers can appear in various formats:
- ALL CAPS: "MARINADE", "FLATBREADS", "SAUCE", "GARNISH", "TOPPING"
- Title Case: "Marinade", "Flatbreads", "For the Sauce"
- With colons: "For the marinade:", "MARINADE:", "Sauce:"
- Without colons: "MARINADE", "Flatbreads"
- Common patterns: "For the [name]:", "[NAME]", "[Name]"

Look for words that represent recipe sections or components (marinade, sauce, dressing, crust, filling, topping, garnish, flatbreads, etc.) rather than actual ingredients. Use your semantic understanding to identify these section headers based on context - they typically appear before a group of related ingredients and represent a component of the recipe.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["MARINADE", "2 tbsp yogurt", "1 tsp spices", "FLATBREADS", "200g flour", "For the garnish:", "6 slices pancetta"],
  "ingredientGroupIndices": [0, 3, 6],
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

IMPORTANT: ingredientGroupIndices must be an array of zero-based indices indicating which positions in the ingredients array are group headers. For example, if "MARINADE" is at index 0, "FLATBREADS" is at index 3, and "For the garnish:" is at index 6, then ingredientGroupIndices should be [0, 3, 6]. Always include ALL section headers regardless of their format (ALL CAPS, title case, with/without colons). If there are no group headers, use an empty array [].

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
      systemPrompt = `You are a recipe parsing assistant. Convert the supplied recipe text into RealiMeali's structured format.

SOURCE-PRESERVATION RULES — THESE ARE CRITICAL:
- The supplied recipe text is the authoritative source. Do NOT rewrite, summarise, shorten, simplify, or invent recipe content.
- Preserve EVERY ingredient line, including its exact quantity, unit, ingredient name, and useful preparation detail. NEVER return an empty ingredients array when ingredients are present in the source.
- Preserve the FULL cooking method. Do NOT turn detailed method paragraphs into short step titles. If the source says "Cook the mushrooms and peppers over medium-high heat for 4–5 minutes, stirring occasionally until nicely browned", that full instruction must remain in the corresponding instructions entry.
- Keep step headings when present, but include the complete explanatory text belonging to each heading.
- Preserve important cooking temperatures, timings, sequencing, warnings, and separation/resting instructions.
- You may remove numbering/bullet markers from the source, but you must not remove the actual recipe information.
- Do not add ingredients that are not in the source. Do not invent missing quantities.
- If the source contains an optional ingredient, preserve it as optional.
- The output should be a faithful structured transcription first; classification and metadata are secondary.
- Before returning JSON, check that every ingredient and every substantive method instruction from the source is represented in the output.

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

CRITICAL: When parsing ingredients, distinguish between ingredient group headers (sections that contain multiple ingredients) and individual ingredients. Group headers can appear in various formats:
- ALL CAPS: "MARINADE", "FLATBREADS", "SAUCE", "GARNISH", "TOPPING"
- Title Case: "Marinade", "Flatbreads", "For the Sauce"
- With colons: "For the marinade:", "MARINADE:", "Sauce:"
- Without colons: "MARINADE", "Flatbreads"
- Common patterns: "For the [name]:", "[NAME]", "[Name]"

Look for words that represent recipe sections or components (marinade, sauce, dressing, crust, filling, topping, garnish, flatbreads, etc.) rather than actual ingredients. Use your semantic understanding to identify these section headers based on context - they typically appear before a group of related ingredients and represent a component of the recipe.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["MARINADE", "2 tbsp yogurt", "1 tsp spices", "FLATBREADS", "200g flour", "For the garnish:", "6 slices pancetta"],
  "ingredientGroupIndices": [0, 3, 6],
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

IMPORTANT: ingredientGroupIndices must be an array of zero-based indices indicating which positions in the ingredients array are group headers. For example, if "MARINADE" is at index 0, "FLATBREADS" is at index 3, and "For the garnish:" is at index 6, then ingredientGroupIndices should be [0, 3, 6]. Always include ALL section headers regardless of their format (ALL CAPS, title case, with/without colons). If there are no group headers, use an empty array [].

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

      userPrompt = `Parse this recipe text faithfully into the required JSON structure.

IMPORTANT: This is a transcription/structuring task, NOT a recipe-writing task. Preserve all source ingredients, quantities, and detailed instructions. Do not summarise the method.

SOURCE RECIPE:
${body.recipeText}`;
      
    } else if (body.image && body.mimeType) {
      // Handle image processing with OCR
      console.log('Processing image with OCR:', body.mimeType);
      
      systemPrompt = `You are a recipe parsing assistant with vision capabilities. Read and extract recipe information from the provided image and classify it across 6 dimensions.

CRITICAL: You MUST carefully examine ingredients for meat content. If ANY meat (beef, pork, lamb, chicken, turkey, fish, seafood, etc.) is present, the recipe CANNOT be classified as "vegetarian" or "vegan". Be extremely careful about this classification.

CRITICAL: When parsing ingredients, distinguish between ingredient group headers (sections that contain multiple ingredients) and individual ingredients. Group headers can appear in various formats:
- ALL CAPS: "MARINADE", "FLATBREADS", "SAUCE", "GARNISH", "TOPPING"
- Title Case: "Marinade", "Flatbreads", "For the Sauce"
- With colons: "For the marinade:", "MARINADE:", "Sauce:"
- Without colons: "MARINADE", "Flatbreads"
- Common patterns: "For the [name]:", "[NAME]", "[Name]"

Look for words that represent recipe sections or components (marinade, sauce, dressing, crust, filling, topping, garnish, flatbreads, etc.) rather than actual ingredients. Use your semantic understanding to identify these section headers based on context - they typically appear before a group of related ingredients and represent a component of the recipe.

Return a JSON object with this EXACT structure:
{
  "title": "Recipe name",
  "description": "Brief description (1-2 sentences)",
  "ingredients": ["MARINADE", "2 tbsp yogurt", "1 tsp spices", "FLATBREADS", "200g flour", "For the garnish:", "6 slices pancetta"],
  "ingredientGroupIndices": [0, 3, 6],
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

IMPORTANT: ingredientGroupIndices must be an array of zero-based indices indicating which positions in the ingredients array are group headers. For example, if "MARINADE" is at index 0, "FLATBREADS" is at index 3, and "For the garnish:" is at index 6, then ingredientGroupIndices should be [0, 3, 6]. Always include ALL section headers regardless of their format (ALL CAPS, title case, with/without colons). If there are no group headers, use an empty array [].

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
  "ingredients": ["For the marinade:", "ingredient 1", "ingredient 2", "For the sauce:", "ingredient 3"],
  "ingredientGroupIndices": [0, 3],
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

IMPORTANT: ingredientGroupIndices must be an array of zero-based indices indicating which positions in the ingredients array are group headers. For example, if "For the marinade:" is at index 0 and "For the sauce:" is at index 3, then ingredientGroupIndices should be [0, 3]. If there are no group headers, use an empty array [].

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
    const content_text = getOpenAIText(data);

    console.log('OpenAI response received, parsing JSON...');

    if (!content_text) {
      throw new Error('OpenAI returned an empty response');
    }

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
      const rawInstructions = Array.isArray(parsedRecipe.instructions) ? parsedRecipe.instructions : [];

      // Never silently accept a text import that lost its ingredients or method.
      // A structured import must preserve the source recipe rather than returning a partial summary.
      if (body.recipeText) {
        const sourceText = String(body.recipeText);
        const sourceHasIngredients = /(^|\\n)\\s*(ingredients?|what you need)\\s*:?\\s*(\\n|$)/i.test(sourceText);
        const sourceHasMethod = /(^|\\n)\\s*(method|instructions?|directions?|steps?)\\s*:?\\s*(\\n|$)/i.test(sourceText);

        if ((sourceHasIngredients && rawIngredients.length === 0) || (sourceHasMethod && rawInstructions.length === 0)) {
          throw new Error('The recipe importer could not preserve all of the source recipe. Please try the import again.');
        }
      }
      
      // Use the group indices directly from AI response (much simpler!)
      const groupIndices = Array.isArray(parsedRecipe.ingredientGroupIndices) 
        ? parsedRecipe.ingredientGroupIndices.filter((idx: number) => typeof idx === 'number' && idx >= 0 && idx < rawIngredients.length)
        : [];
      
      const cleanedRecipe = {
        title: cleanMarkdownFormatting(parsedRecipe.title) || 'Untitled Recipe',
        description: parsedRecipe.description || '',
        ingredients: rawIngredients,
        ingredientGroupIndices: groupIndices.length > 0 ? groupIndices : undefined,
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
