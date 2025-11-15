-- Drop the old unique constraint that includes household_id
ALTER TABLE public.user_achievements 
DROP CONSTRAINT IF EXISTS user_achievements_user_id_household_id_achievement_id_key;

-- Add new unique constraint on user_id and achievement_id only
-- This ensures each achievement can only be unlocked once per user, regardless of household
ALTER TABLE public.user_achievements 
ADD CONSTRAINT user_achievements_user_id_achievement_id_key 
UNIQUE (user_id, achievement_id);

-- Add comment to explain the design decision
COMMENT ON CONSTRAINT user_achievements_user_id_achievement_id_key ON public.user_achievements 
IS 'Ensures each achievement can only be unlocked once per user. household_id is stored for historical context only.';