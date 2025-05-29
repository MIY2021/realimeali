
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Security headers
const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Input validation
const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) && url.length <= 2048;
  } catch {
    return false;
  }
};

const validateText = (text: string): boolean => {
  if (!text || text.length < 10 || text.length > 50000) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(text));
};

const sanitizeText = (text: string): string => {
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Helper function to extract structured recipe data from HTML
function extractStructuredData(html: string): any {
  // Look for JSON-LD structured data
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gsi;
  let match = jsonLdRegex.exec(html);
  
  while (match) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'Recipe' || (Array.isArray(data) && data.find(item => item['@type'] === 'Recipe'))) {
        const recipe = Array.isArray(data) ? data.find(item => item['@type'] === 'Recipe') : data;
        return recipe;
      }
    } catch (e) {
      console.log('Failed to parse JSON-LD:', e);
    }
    match = jsonLdRegex.exec(html);
  }
  
  return null;
}

// Enhanced text extraction with better content preservation
function extractTextFromHTML(html: string): string {
  // Remove script and style elements
  let cleanedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleanedHtml = cleanedHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags and decode entities
  let text = cleanedHtml.replace(/<[^>]*>/g, ' ');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace but preserve some structure
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to extract images from HTML
function extractImagesFromHTML(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    
    if (src.startsWith('//')) {
      src = 'https:' + src;
    } else if (src.startsWith('/')) {
      const url = new URL(baseUrl);
      src = url.origin + src;
    } else if (!src.startsWith('http')) {
      const url = new URL(baseUrl);
      src = new URL(src, url.origin).toString();
    }
    
    if (src.includes('recipe') || src.includes('food') || 
        src.includes('dish') || src.includes('cooking') ||
        src.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)) {
      images.push(src);
    }
  }
  
  return [...new Set(images)].slice(0, 6);
}

// Helper function to download and store image
async function downloadAndStoreImage(imageUrl: string, filename: string): Promise<string | null> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials not configured');
    return null;
  }

  try {
    console.log('📥 Downloading image:', imageUrl.substring(0, 50) + '...');
    
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to download image:', response.status);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error('❌ Invalid content type:', contentType);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileSize = arrayBuffer.byteLength;
    
    // Skip images that are too small (likely icons) or too large
    if (fileSize < 5000 || fileSize > 5000000) {
      console.log('⚠️ Skipping image due to size:', fileSize);
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.storage
      .from('recipe-images')
      .upload(filename, arrayBuffer, {
        contentType: contentType,
        upsert: true
      });

    if (error) {
      console.error('❌ Error uploading to storage:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(filename);

    console.log('✅ Image stored successfully:', filename);
    return publicUrl;

  } catch (error) {
    console.error('❌ Error downloading/storing image:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    console.log('🚀 Recipe AI function called');
    
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }), {
        status: 429,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key
    if (!openAIApiKey) {
      console.error('❌ No OpenAI API key found');
      return new Response(JSON.stringify({ 
        error: 'Service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }), {
        status: 500,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and sanitize request body
    let requestBody;
    try {
      const rawBody = await req.text();
      if (rawBody.length > 100000) { // 100KB limit
        throw new Error('Request too large');
      }
      requestBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Invalid request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request format',
        code: 'INVALID_REQUEST'
      }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { recipeText, imageUrl, websiteUrl, extractImages, downloadImages } = requestBody;
    
    // Input validation
    if (websiteUrl && !validateUrl(websiteUrl)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid website URL',
        code: 'INVALID_URL'
      }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (recipeText && !validateText(recipeText)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid recipe text content',
        code: 'INVALID_TEXT'
      }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!recipeText && !imageUrl && !websiteUrl) {
      return new Response(JSON.stringify({ 
        error: 'No input provided',
        code: 'NO_INPUT'
      }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📄 Processing recipe...');
    
    let processedText = '';
    let isImageInput = false;
    let websiteImages: string[] = [];
    let storedImages: { originalUrl: string; storedUrl: string; filename: string }[] = [];
    let structuredData: any = null;

    // Handle website URL
    if (websiteUrl) {
      console.log('🌐 Website URL provided:', websiteUrl.substring(0, 50) + '...');
      
      try {
        console.log('📡 Fetching website content...');
        const websiteResponse = await fetch(websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });

        if (!websiteResponse.ok) {
          console.error('❌ Failed to fetch website:', websiteResponse.status);
          return new Response(JSON.stringify({ 
            error: `Could not access the website (${websiteResponse.status})`,
            code: 'WEBSITE_FETCH_ERROR'
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' },
          });
        }

        const htmlContent = await websiteResponse.text();
        
        // Security: Limit HTML content size
        if (htmlContent.length > 5000000) { // 5MB limit
          return new Response(JSON.stringify({ 
            error: 'Website content too large',
            code: 'CONTENT_TOO_LARGE'
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Try to extract structured data first
        structuredData = extractStructuredData(htmlContent);
        console.log('🔍 Structured data found:', !!structuredData);
        
        processedText = sanitizeText(extractTextFromHTML(htmlContent));
        
        // Extract images if requested
        if (extractImages) {
          websiteImages = extractImagesFromHTML(htmlContent, websiteUrl);
          console.log('🖼️ Found images:', websiteImages.length);

          // Download and store images if requested
          if (downloadImages && websiteImages.length > 0) {
            console.log('📥 Starting image downloads...');
            
            for (let i = 0; i < Math.min(websiteImages.length, 3); i++) { // Limit to 3 images
              const imageUrl = websiteImages[i];
              const timestamp = Date.now();
              const imageIndex = i + 1;
              const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
              const filename = `website-${timestamp}-${imageIndex}.${extension}`;
              
              const storedUrl = await downloadAndStoreImage(imageUrl, filename);
              
              if (storedUrl) {
                storedImages.push({
                  originalUrl: imageUrl,
                  storedUrl: storedUrl,
                  filename: filename
                });
              }
            }
            
            console.log('✅ Downloaded and stored images:', storedImages.length);
          }
        }
        
        console.log('✅ Website content extracted, text length:', processedText.length);
        
        if (processedText.length < 50) {
          console.error('❌ Insufficient content extracted from website');
          return new Response(JSON.stringify({ 
            error: 'Could not extract enough content from the website',
            code: 'INSUFFICIENT_CONTENT'
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Limit processed text to prevent token overflow
        if (processedText.length > 12000) {
          processedText = processedText.substring(0, 12000) + '...';
          console.log('⚠️ Text truncated to 12000 characters');
        }

      } catch (fetchError) {
        console.error('❌ Error fetching website:', fetchError);
        return new Response(JSON.stringify({ 
          error: 'Could not access the website',
          code: 'NETWORK_ERROR'
        }), {
          status: 500,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    // Handle text input
    else if (recipeText) {
      console.log('📝 Text input length:', recipeText.length);
      processedText = sanitizeText(recipeText);
    }
    // Handle image input
    else if (imageUrl) {
      console.log('🖼️ Image provided for OCR extraction');
      isImageInput = true;
      
      if (!imageUrl.startsWith('data:image/')) {
        console.error('❌ Invalid image format - must be base64 data URL');
        return new Response(JSON.stringify({ 
          error: 'Invalid image format',
          code: 'INVALID_IMAGE_FORMAT'
        }), {
          status: 400,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Enhanced system prompt for better extraction
    const messages = [
      {
        role: 'system',
        content: `You are a recipe extraction expert. Extract recipe information faithfully from the source content.

        Return a JSON object with these exact fields:
        {
          "title": "Exact recipe title from source",
          "description": "Original description from source, or generate brief 1-2 sentences if missing", 
          "ingredients": ["exact ingredient text from source"],
          "instructions": ["exact instruction text from source"],
          "categories": ["category1", "category2"],
          "prepTime": 15,
          "cookTime": 30,
          "servings": 4
        }

        Guidelines:
        - Extract exact title as written in source
        - Use original description if found, otherwise generate brief description
        - Copy ingredients and instructions exactly as written
        - Choose from these categories only: "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey", "Not-Yet-Made", "Snacks", "Breakfast"
        - Extract exact prep/cook times if mentioned, otherwise estimate reasonably
        - Return valid JSON only, no additional text`
      }
    ];

    if (isImageInput) {
      messages.push({
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Extract ONLY the recipe information clearly visible in this image. Do not create or assume details not shown.' 
          },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    } else {
      let userContent = processedText;
      
      // If we have structured data, include it prominently
      if (structuredData) {
        userContent = `STRUCTURED RECIPE DATA (use this as primary source):\n${JSON.stringify(structuredData, null, 2)}\n\nADDITIONAL WEBSITE CONTENT:\n${processedText}`;
      }
      
      messages.push({
        role: 'user',
        content: userContent
      });
    }

    const openAIRequest = {
      model: isImageInput ? 'gpt-4o' : 'gpt-4o-mini',
      messages,
      temperature: 0.1,
      max_tokens: 1500,
    };

    console.log('🤖 Calling OpenAI API with model:', openAIRequest.model);

    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openAIRequest),
      });
    } catch (fetchError) {
      console.error('❌ Network error calling OpenAI:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }), {
        status: 500,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🤖 OpenAI response status:', response.status);
    
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        console.error('❌ OpenAI API error response:', errorText);
      } catch (textError) {
        console.error('❌ Could not read error response:', textError);
        errorText = 'Could not read error response';
      }

      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Service temporarily overloaded. Please try again later.',
          code: 'SERVICE_OVERLOADED'
        }), {
          status: 429,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          error: 'Service temporarily unavailable',
          code: 'SERVICE_ERROR'
        }), {
          status: 500,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let data;
    try {
      data = await response.json();
      console.log('✅ OpenAI response received successfully');
    } catch (jsonError) {
      console.error('❌ Failed to parse OpenAI JSON response:', jsonError);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from AI service',
        code: 'SERVICE_ERROR'
      }), {
        status: 500,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from OpenAI:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from AI service',
        code: 'SERVICE_ERROR'
      }), {
        status: 500,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = data.choices[0].message.content;
    console.log('📝 AI response content length:', content.length);
    
    let parsedRecipe;
    try {
      parsedRecipe = JSON.parse(content);
      console.log('✅ Successfully parsed recipe JSON');
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      return new Response(JSON.stringify({ 
        error: 'AI returned invalid format. Please try again.',
        code: 'INVALID_AI_RESPONSE'
      }), {
        status: 500,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    const requiredFields = ['title', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!parsedRecipe[field] || (Array.isArray(parsedRecipe[field]) && parsedRecipe[field].length === 0)) {
        console.error(`❌ Missing or empty required field: ${field}`);
        return new Response(JSON.stringify({ 
          error: `Insufficient ${field} information to create a complete recipe`,
          code: 'INSUFFICIENT_RECIPE_DATA'
        }), {
          status: 400,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Sanitize the parsed recipe data
    const sanitizedRecipe = {
      title: sanitizeText(parsedRecipe.title),
      description: parsedRecipe.description ? sanitizeText(parsedRecipe.description) : undefined,
      ingredients: parsedRecipe.ingredients.map((ing: string) => sanitizeText(ing)),
      instructions: parsedRecipe.instructions.map((inst: string) => sanitizeText(inst)),
      categories: parsedRecipe.categories || [],
      prepTime: Math.max(0, Math.min(1440, parsedRecipe.prepTime || 0)),
      cookTime: Math.max(0, Math.min(1440, parsedRecipe.cookTime || 0)),
      servings: Math.max(1, Math.min(100, parsedRecipe.servings || 1))
    };

    console.log('🎉 Successfully processed recipe:', sanitizedRecipe.title);

    const responseData: any = { 
      parsedRecipe: sanitizedRecipe,
      extractionInfo: {
        hasStructuredData: !!structuredData,
        textLength: processedText.length,
        temperature: openAIRequest.temperature
      }
    };
    
    if (websiteImages.length > 0) {
      responseData.websiteImages = websiteImages;
      console.log('🖼️ Including website images in response:', websiteImages.length);
    }

    if (storedImages.length > 0) {
      responseData.storedImages = storedImages;
      console.log('💾 Including stored images in response:', storedImages.length);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...securityHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Unexpected error in recipe AI function:', error);
    return new Response(JSON.stringify({ 
      error: 'Service temporarily unavailable',
      code: 'SERVICE_ERROR'
    }), {
      status: 500,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }
});
