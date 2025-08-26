-- Remove community recipe tables and related functionality
DROP TABLE IF EXISTS community_recipe_favorites CASCADE;
DROP TABLE IF EXISTS community_recipes CASCADE;

-- Remove community recipe related functions if they exist
DROP FUNCTION IF EXISTS increment_community_recipe_view_count(uuid);
DROP FUNCTION IF EXISTS increment_community_recipe_save_count(uuid);