
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  
  // Preserve recipe-specific sections better
  const recipeKeywords = ['recipe', 'ingredient', 'instruction', 'direction', 'method', 'preparation', 'cooking', 'prep', 'cook', 'serve', 'yield'];
  
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

// Helper function to validate and normalize URLs
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Recipe AI function called');
    console.log('📝 OpenAI API key configured:', !!openAIApiKey);
    
    if (!openAIApiKey) {
      console.error('❌ No OpenAI API key found');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add your API key in the Supabase secrets.',
        code: 'NO_API_KEY'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📦 Request body received:', { 
        hasRecipeText: !!requestBody.recipeText, 
        hasImageUrl: !!requestBody.imageUrl,
        hasWebsiteUrl: !!requestBody.websiteUrl,
        extractImages: !!requestBody.extractImages,
        downloadImages: !!requestBody.downloadImages,
        recipeTextLength: requestBody.recipeText?.length || 0,
        imageUrlLength: requestBody.imageUrl?.length || 0,
        websiteUrlLength: requestBody.websiteUrl?.length || 0
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request body format',
        code: 'INVALID_REQUEST_BODY'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { recipeText, imageUrl, websiteUrl, extractImages, downloadImages } = requestBody;
    
    if (!recipeText && !imageUrl && !websiteUrl) {
      console.error('❌ No input provided');
      return new Response(JSON.stringify({ 
        error: 'Please provide recipe text, an image URL, or a website URL',
        code: 'NO_INPUT'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      
      if (!isValidUrl(websiteUrl)) {
        console.error('❌ Invalid website URL format');
        return new Response(JSON.stringify({ 
          error: 'Please provide a valid website URL',
          code: 'INVALID_URL'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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
            error: `Could not access the website (${websiteResponse.status}). Please check the URL and try again.`,
            code: 'WEBSITE_FETCH_ERROR'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const htmlContent = await websiteResponse.text();
        
        // Try to extract structured data first
        structuredData = extractStructuredData(htmlContent);
        console.log('🔍 Structured data found:', !!structuredData);
        
        processedText = extractTextFromHTML(htmlContent);
        
        // Extract images if requested
        if (extractImages) {
          websiteImages = extractImagesFromHTML(htmlContent, websiteUrl);
          console.log('🖼️ Found images:', websiteImages.length);

          // Download and store images if requested
          if (downloadImages && websiteImages.length > 0) {
            console.log('📥 Starting image downloads...');
            
            for (let i = 0; i < websiteImages.length; i++) {
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
            error: 'Could not extract enough content from the website. Please try a different URL or use the text input instead.',
            code: 'INSUFFICIENT_CONTENT'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Increase text limit to preserve more content
        if (processedText.length > 12000) {
          processedText = processedText.substring(0, 12000) + '...';
          console.log('⚠️ Text truncated to 12000 characters');
        }

      } catch (fetchError) {
        console.error('❌ Error fetching website:', fetchError);
        return new Response(JSON.stringify({ 
          error: 'Could not access the website. Please check the URL and try again.',
          code: 'NETWORK_ERROR',
          details: fetchError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    // Handle text input
    else if (recipeText) {
      console.log('📝 Text input length:', recipeText.length);
      processedText = recipeText;
    }
    // Handle image input
    else if (imageUrl) {
      console.log('🖼️ Image provided for OCR extraction');
      isImageInput = true;
      
      if (!imageUrl.startsWith('data:image/')) {
        console.error('❌ Invalid image format - must be base64 data URL');
        return new Response(JSON.stringify({ 
          error: 'Invalid image format. Please upload a valid image file.',
          code: 'INVALID_IMAGE_FORMAT'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Enhanced system prompt for better extraction
    const messages = [
      {
        role: 'system',
        content: `You are a recipe extraction expert. Your goal is to extract recipe information as faithfully as possible from the source content.

        EXTRACTION PRIORITIES:
        1. PRESERVE ORIGINAL TEXT: Extract ingredients and instructions exactly as written in the source
        2. EXTRACT ORIGINAL DESCRIPTIONS: Use the actual description from the website if available
        3. ESTIMATE ONLY WHEN MISSING: Only estimate prep/cook times and servings if not found in source
        4. GENERATE DESCRIPTIONS: If no description exists in source, write a brief 1-2 sentence description

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
        - Copy ingredients and instructions exactly as written (preserve measurements, formatting)
        - Choose from these categories only: "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey", "Not-Yet-Made", "Snacks", "Breakfast"
        - Extract exact prep/cook times if mentioned, otherwise estimate reasonably
        - Extract exact servings/yield if mentioned, otherwise estimate
        - For images: ONLY extract text that is clearly visible in the image
        - Return valid JSON only, no additional text`
      }
    ];

    if (isImageInput) {
      messages.push({
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Please extract ONLY the recipe information that is clearly visible and readable in this image. Do not create or assume any recipe details that are not explicitly shown in the image. If the image does not contain enough recipe information, please indicate that in the response.' 
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
      temperature: 0.1, // Lower temperature for more consistent extraction
      max_tokens: 1500,
    };

    console.log('🤖 Calling OpenAI API with model:', openAIRequest.model, 'temperature:', openAIRequest.temperature);

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
        error: 'Network error while calling OpenAI API',
        code: 'NETWORK_ERROR',
        details: fetchError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
          error: 'OpenAI API rate limit exceeded. Please try again in a moment.',
          code: 'RATE_LIMIT'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'OpenAI API key is invalid or expired.',
          code: 'INVALID_API_KEY'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          error: `OpenAI API error: ${response.status}`,
          code: 'OPENAI_API_ERROR',
          details: errorText
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        error: 'Invalid JSON response from OpenAI',
        code: 'INVALID_JSON_RESPONSE'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from OpenAI:', data);
      return new Response(JSON.stringify({ 
        error: 'Invalid response structure from OpenAI',
        code: 'INVALID_RESPONSE_STRUCTURE'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      console.error('🔍 Content that failed to parse:', content);
      return new Response(JSON.stringify({ 
        error: 'AI returned invalid format. Please try again with clearer recipe text or image.',
        code: 'INVALID_AI_RESPONSE',
        details: content
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requiredFields = ['title', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!parsedRecipe[field] || (Array.isArray(parsedRecipe[field]) && parsedRecipe[field].length === 0)) {
        console.error(`❌ Missing or empty required field: ${field}`);
        return new Response(JSON.stringify({ 
          error: `The image or text does not contain enough ${field} information to create a complete recipe. Please try with a clearer image or more detailed text.`,
          code: 'INSUFFICIENT_RECIPE_DATA',
          field: field
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('🎉 Successfully processed recipe:', parsedRecipe.title);

    const responseData: any = { 
      parsedRecipe,
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Unexpected error in recipe AI function:', error);
    console.error('🔍 Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
