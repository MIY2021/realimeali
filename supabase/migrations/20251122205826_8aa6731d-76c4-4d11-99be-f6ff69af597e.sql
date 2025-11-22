-- Fix SECURITY DEFINER functions by setting search_path to prevent search path manipulation attacks
-- This addresses the Supabase linter warning: Function Search Path Mutable

-- Functions that check permissions/roles
ALTER FUNCTION public.has_role(_user_id uuid, _role text) SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_household_member(household_id uuid, user_id uuid) SET search_path = public;
ALTER FUNCTION public.is_household_member_simple(household_id uuid, user_id uuid) SET search_path = public;
ALTER FUNCTION public.is_household_owner(household_id uuid, user_id uuid) SET search_path = public;
ALTER FUNCTION public.is_user_household_member(check_household_id uuid, check_user_id uuid) SET search_path = public;
ALTER FUNCTION public.is_user_household_owner(check_household_id uuid, check_user_id uuid) SET search_path = public;

-- Household and user management functions
ALTER FUNCTION public.add_default_recipe_to_household() SET search_path = public;
ALTER FUNCTION public.check_approval_completion() SET search_path = public;
ALTER FUNCTION public.create_household_with_owner(household_name text) SET search_path = public;
ALTER FUNCTION public.get_user_households(user_id uuid) SET search_path = public;

-- Recipe management functions
ALTER FUNCTION public.cleanup_old_deleted_recipes() SET search_path = public;
ALTER FUNCTION public.increment_recipe_meal_plan_count(recipe_id_param uuid) SET search_path = public;
ALTER FUNCTION public.permanent_delete_recipe(recipe_id uuid) SET search_path = public;
ALTER FUNCTION public.restore_recipe(recipe_id uuid) SET search_path = public;
ALTER FUNCTION public.soft_delete_recipe(recipe_id uuid) SET search_path = public;
ALTER FUNCTION public.update_recipe_updater() SET search_path = public;
ALTER FUNCTION public.toggle_recipe_cooking_status(recipe_id_param uuid, household_id_param uuid) SET search_path = public;
ALTER FUNCTION public.toggle_recipe_cooking_status_simple(recipe_id_param uuid) SET search_path = public;

-- Community recipe functions
ALTER FUNCTION public.approve_community_recipe(recipe_id uuid) SET search_path = public;
ALTER FUNCTION public.reject_community_recipe(recipe_id uuid) SET search_path = public;
ALTER FUNCTION public.toggle_community_recipe_favorite(recipe_id uuid) SET search_path = public;

-- Share tracking function
ALTER FUNCTION public.increment_share_view_count(share_id text) SET search_path = public;