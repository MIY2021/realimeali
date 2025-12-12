-- Add has_seen_welcome field to profiles table
-- This tracks whether a user has completed the welcome onboarding slides
-- Database is the source of truth for cross-device consistency

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_seen_welcome BOOLEAN DEFAULT FALSE;

-- Set default value for existing users (they haven't seen it yet)
UPDATE public.profiles 
SET has_seen_welcome = FALSE 
WHERE has_seen_welcome IS NULL;

-- Make it NOT NULL with default
ALTER TABLE public.profiles 
ALTER COLUMN has_seen_welcome SET DEFAULT FALSE,
ALTER COLUMN has_seen_welcome SET NOT NULL;

