-- Set default value for is_featured to true for all new imported recipes
ALTER TABLE imported_recipes 
ALTER COLUMN is_featured SET DEFAULT true;

-- Update all existing imported recipes to be featured
UPDATE imported_recipes 
SET is_featured = true, 
    priority_score = 100 
WHERE is_featured = false;