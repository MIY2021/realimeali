
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  pageContext: {
    page: string;
    data?: any;
  };
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

const getContextualSystemPrompt = (pageContext: any) => {
  const baseName = "RealiChef";
  const basePersonality = `You are ${baseName}, a friendly and knowledgeable AI cooking assistant for the RealiMeali app. You have a warm, welcoming tone and are always helpful, patient, and informative. Always start responses with a chef emoji (👩‍🍳) and keep responses concise but helpful.`;
  
  switch (pageContext.page) {
    case 'my-recipes':
      return `${basePersonality} You're currently helping on the My Recipes page. Focus on recipe inspiration, cooking tips, ingredient suggestions, and help with recipe management. You can suggest recipe variations, cooking techniques, and answer questions about the recipes they have.`;
    
    case 'meal-planner':
      return `${basePersonality} You're currently helping on the Meal Planner page. Focus on meal suggestions, menu planning, leftover ideas, and helping balance meals throughout the week. Suggest efficient meal prep strategies and complementary dishes.`;
    
    case 'shopping-list':
      return `${basePersonality} You're currently helping on the Shopping List page. Focus on ingredient substitutions, budget-friendly alternatives, seasonal suggestions, and helping identify or categorize items. You can also suggest ways to optimize shopping trips.`;
    
    case 'recipe-detail':
      const recipeTitle = pageContext.data?.recipeTitle || 'this recipe';
      return `${basePersonality} You're currently helping on a recipe detail page for "${recipeTitle}". Focus on ingredient substitutions, cooking techniques, serving suggestions, pairing ideas, and troubleshooting cooking issues specific to this recipe.`;
    
    case 'find-recipes':
      return `${basePersonality} You're currently helping on the Find Recipes page. Focus on helping users discover new recipes, suggesting search strategies, and providing recommendations based on their preferences, dietary needs, or available ingredients.`;
    
    default:
      return `${basePersonality} You're helping users with general cooking questions, recipe suggestions, and culinary advice. Be ready to assist with any cooking-related queries.`;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, pageContext, conversationHistory = [] }: ChatRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('RealiChef chat request:', { message, pageContext });

    // Build conversation with context
    const systemPrompt = getContextualSystemPrompt(pageContext);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const realiChefResponse = data.choices[0].message.content;

    console.log('RealiChef response generated successfully');

    return new Response(JSON.stringify({ 
      response: realiChefResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in RealiChef chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Sorry, I had trouble processing that. Please try again!',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
