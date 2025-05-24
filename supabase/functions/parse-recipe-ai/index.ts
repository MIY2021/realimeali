
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📦 Request body received:', { 
        hasRecipeText: !!requestBody.recipeText, 
        hasImageUrl: !!requestBody.imageUrl,
        recipeTextLength: requestBody.recipeText?.length || 0,
        imageUrlLength: requestBody.imageUrl?.length || 0
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

    const { recipeText, imageUrl } = requestBody;
    
    if (!recipeText && !imageUrl) {
      console.error('❌ No input provided');
      return new Response(JSON.stringify({ 
        error: 'Please provide either recipe text or an image URL',
        code: 'NO_INPUT'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📄 Processing recipe...');
    if (recipeText) {
      console.log('📝 Text input length:', recipeText.length);
    }
    if (imageUrl) {
      console.log('🖼️ Image URL provided:', imageUrl.substring(0, 50) + '...');
    }

    const messages = [
      {
        role: 'system',
        content: `You are a recipe extraction expert. Extract recipe information and return a JSON object with these exact fields:
        {
          "title": "Recipe title",
          "description": "Brief description", 
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": ["step 1", "step 2"],
          "categories": ["category1", "category2"],
          "prepTime": 15,
          "cookTime": 30,
          "servings": 4
        }

        Guidelines:
        - Extract a clear, concise title
        - Write a 1-2 sentence description
        - Clean up ingredients (remove extra spaces, standardize format)
        - Number instructions as separate array items
        - Choose from these categories only: "Bulk", "Easy", "Cheap", "Healthy", "Vegetarian", "Fish", "Super Tasty", "Pasta", "Tapas", "Winter", "BBQ", "Faffy", "Pricey!", "Not Yet Made", "Snacks", "Breakfast"
        - Estimate prep/cook times in minutes if not provided
        - Estimate servings if not provided
        - Return valid JSON only, no additional text`
      }
    ];

    // Handle image or text input
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Please extract the recipe information from this image:' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: recipeText
      });
    }

    // Prepare OpenAI request
    const openAIRequest = {
      model: imageUrl ? 'gpt-4o' : 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 1500,
    };

    console.log('🤖 Calling OpenAI API with model:', openAIRequest.model);
    console.log('📊 Request details:', {
      messageCount: messages.length,
      hasSystemPrompt: messages[0].role === 'system',
      temperature: openAIRequest.temperature,
      maxTokens: openAIRequest.max_tokens
    });

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
    console.log('📈 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorText;
      try {
        errorText = await response.text();
        console.error('❌ OpenAI API error response:', errorText);
      } catch (textError) {
        console.error('❌ Could not read error response:', textError);
        errorText = 'Could not read error response';
      }

      // Handle specific OpenAI error cases
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
      console.log('📊 Response structure:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasFirstChoice: !!data.choices?.[0],
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content
      });
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
    console.log('🔍 AI response preview:', content.substring(0, 200) + '...');
    
    // Parse the JSON response
    let parsedRecipe;
    try {
      parsedRecipe = JSON.parse(content);
      console.log('✅ Successfully parsed recipe JSON');
      console.log('📋 Recipe structure:', {
        hasTitle: !!parsedRecipe.title,
        hasIngredients: !!parsedRecipe.ingredients,
        hasInstructions: !!parsedRecipe.instructions,
        ingredientsCount: parsedRecipe.ingredients?.length || 0,
        instructionsCount: parsedRecipe.instructions?.length || 0
      });
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.error('🔍 Content that failed to parse:', content);
      return new Response(JSON.stringify({ 
        error: 'AI returned invalid format. Please try again with clearer recipe text.',
        code: 'INVALID_AI_RESPONSE',
        details: content
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate required fields
    const requiredFields = ['title', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!parsedRecipe[field]) {
        console.error(`❌ Missing required field: ${field}`);
        return new Response(JSON.stringify({ 
          error: `Missing required field: ${field}`,
          code: 'MISSING_REQUIRED_FIELD',
          field: field
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('🎉 Successfully processed recipe:', parsedRecipe.title);

    return new Response(JSON.stringify({ parsedRecipe }), {
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
