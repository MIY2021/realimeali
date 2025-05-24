
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
      throw new Error('OpenAI API key not configured. Please add your API key in the Supabase secrets.');
    }

    const { recipeText, imageUrl } = await req.json();
    
    if (!recipeText && !imageUrl) {
      throw new Error('Please provide either recipe text or an image URL');
    }

    console.log('📄 Processing recipe...');
    if (recipeText) {
      console.log('Text input length:', recipeText.length);
    }
    if (imageUrl) {
      console.log('Image URL provided:', imageUrl.substring(0, 50) + '...');
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageUrl ? 'gpt-4o' : 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    console.log('🤖 OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('📝 AI response content length:', content.length);
    
    // Parse the JSON response
    let parsedRecipe;
    try {
      parsedRecipe = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('AI returned invalid format. Please try again with clearer recipe text.');
    }

    // Validate required fields
    const requiredFields = ['title', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!parsedRecipe[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    console.log('🎉 Successfully processed recipe:', parsedRecipe.title);

    return new Response(JSON.stringify({ parsedRecipe }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in recipe AI function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process recipe',
      details: 'Check the function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
