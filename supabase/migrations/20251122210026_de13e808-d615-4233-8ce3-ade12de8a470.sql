-- Fix handle_new_user function which has empty search_path
-- This function was created with SET search_path TO '' which should be SET search_path = public
ALTER FUNCTION public.handle_new_user() SET search_path = public;