-- Update the default image generation prompt to include full recipe context
UPDATE public.app_settings
SET 
  value = 'A high-quality editorial food photograph of {title}.

Composition: Randomly choose one of the following two compositions:
• Top-down (overhead) shot with the dish perfectly centred in the frame
• Side-on (45–90° angle) shot with the dish centred and clearly framed

In all cases, the food must be the absolute centre of attention, positioned in the middle of the image with no cropping of the main dish - and more or less fill the image.

Modern cookbook photography style. Realistic textures, natural colours, appetising but not over-styled. Professional food photography suitable for a premium meal planning app. Ensure you read and understand the full recipe before generating image:

{description}

{ingredients}

{instructions}

The image must accurately represent the finished dish based on the recipe details above. The dish should appear exactly as it would when prepared according to the instructions provided. Include visible ingredients from the recipe where appropriate, and ensure the styling, presentation, and appearance match how the dish would look when following the recipe instructions.',
  description = 'The prompt template used for AI image generation. Available placeholders: {title}, {description}, {ingredients}, and {instructions}. The AI will automatically include the full recipe context when generating images.',
  updated_at = now()
WHERE id = 'image_generation_prompt';

