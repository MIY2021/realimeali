-- Create app_settings table for storing configurable settings like prompts
CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings (needed for image generation)
CREATE POLICY "Anyone can read app settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update app settings"
ON public.app_settings
FOR UPDATE
USING (public.is_admin());

-- Only admins can insert settings
CREATE POLICY "Only admins can insert app settings"
ON public.app_settings
FOR INSERT
WITH CHECK (public.is_admin());

-- Insert the default image generation prompt
INSERT INTO public.app_settings (id, value, description)
VALUES (
  'image_generation_prompt',
  'A high-quality editorial food photograph of {title}, a fresh, vibrant homemade meal served in a shallow ceramic bowl. The dish is the clear focal point, centred in the frame and filling most of the image. Ingredients are neatly arranged in defined sections, colourful but natural. Shot using soft natural daylight from the side, creating gentle highlights and subtle shadows. Clean white or very light stone background with no clutter or unnecessary props. Shallow depth of field, sharp focus on the food, slight background blur. Modern cookbook photography style, realistic textures, appetising but not over-styled. Ultra-realistic, high detail, professional food photography, suitable for a premium meal planning app.',
  'The prompt template used for AI image generation. Use {title} as a placeholder for the recipe title.'
);