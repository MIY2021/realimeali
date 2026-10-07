import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "integer" },
          category: {
            type: "string",
            enum: [
              "Fruit & Vegetables", "Meat & Fish", "Chilled Food", "Bakery",
              "Frozen Food", "Food Cupboard", "Snacks & Treats", "World & Dietary",
              "Drinks", "Alcohol", "Other"
            ]
          },
          shoppingName: { type: "string" }
        },
        required: ["id", "category", "shoppingName"]
      }
    }
  },
  required: ["items"]
};

const systemPrompt = `You are RealiMeali's supermarket shopping-name normaliser.

For every supplied recipe ingredient, return the best concise ingredient name a UK shopper should search for on a supermarket website such as Ocado.

This is semantic normalisation, not text shortening.

Rules:
- Return ONLY the food/product name in shoppingName. NEVER include quantity, measurement, serving size or amount.
- Remove recipe preparation language and physical-form instructions when they do not define a different product.
- Remove words describing how much or how it is prepared: bunch, bunches, pinch, handful, wedge, wedges, slice, slices, chopped, diced, sliced, grated, peeled, crushed, halved, drained, etc.
- Remove container wording such as tin, tins, can, cans, packet, packets, jar, jars when it describes packaging rather than the product.
- Remove generic size/quality wording such as small, medium, large, good quality and nice.
- Preserve the actual ingredient and meaningful product characteristics that affect what someone should buy.
- Do NOT remove meaningful characteristics such as smoked paprika, ground cumin, curry paste, light coconut milk, frozen spinach, skinless chicken thighs or 5% fat beef mince.
- Do NOT replace one ingredient with another.
- Do NOT invent brands.
- Use natural UK supermarket terminology.
- Prefer the simplest useful search phrase.

Examples:
"Bunch Kale" -> "Kale"
"Lemon Wedges" -> "Lemon"
"1/2–1 Teaspoon Ground Cumin" -> "Ground Cumin"
"Tin Coconut Milk" -> "Coconut Milk"
"Pinch Of Salt" -> "Salt"
"2–3 tbsp Curry Paste" -> "Curry Paste"
"Small Red Onion" -> "Red Onion"
"400g 5% fat beef mince" -> "5% Fat Beef Mince"
"500g frozen spinach" -> "Frozen Spinach"
"2 chicken thighs, skin removed" -> "Chicken Thighs"

Preserve meaningful distinctions. For example, "lemon juice" is not the same product as "lemon", and "coconut cream" is not "coconut milk".

Return exactly one result for each supplied ingredient, keeping the supplied id unchanged.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!openAIApiKey) throw new Error("OpenAI API key not configured");

    const body = await req.json();
    const ingredients = Array.isArray(body?.ingredients) ? body.ingredients : [];

    if (!ingredients.length) {
      throw new Error("At least one ingredient is required");
    }

    if (ingredients.length > 100) {
      throw new Error("Too many ingredients in one request");
    }

    const cleaned = ingredients
      .map((item: any, index: number) => ({
        id: Number.isInteger(item?.id) ? item.id : index,
        text: typeof item?.text === "string" ? item.text.trim() : ""
      }))
      .filter((item: any) => item.text);

    if (!cleaned.length) throw new Error("No valid ingredients supplied");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify(cleaned)
          }
        ],
        temperature: 0,
        max_tokens: Math.max(300, cleaned.length * 35),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "shopping_ingredients",
            strict: true,
            schema
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `OpenAI request failed (${response.status})`);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI returned no shopping ingredient data");

    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Shopping ingredient normalisation failed:", error);

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Shopping ingredient normalisation failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
