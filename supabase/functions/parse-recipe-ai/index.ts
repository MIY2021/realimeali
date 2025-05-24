
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
    console.log('Function called with OpenAI key present:', !!openAIApiKey);
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { recipeText } = await req.json();
    
    console.log('Parsing recipe text:', recipeText.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a recipe parsing expert. Parse the given unstructured recipe text and return a JSON object with these exact fields:
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
          },
          {
            role: 'user',
            content: recipeText
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('OpenAI content:', content);
    
    // Parse the JSON response
    let parsedRecipe;
    try {
      parsedRecipe = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    const requiredFields = ['title', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!parsedRecipe[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    console.log('Successfully parsed recipe:', parsedRecipe.title);

    return new Response(JSON.stringify({ parsedRecipe }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-recipe-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to parse recipe' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
