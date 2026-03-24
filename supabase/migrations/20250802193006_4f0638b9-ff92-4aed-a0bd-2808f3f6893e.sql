-- Drop the existing update policy to replace it with a clearer one
DROP POLICY IF EXISTS "Household members can update household recipes" ON public.recipes;
DROP POLICY IF EXISTS "Household members can edit all household recipes" ON public.recipes;

-- Create a more explicit policy for household members to edit any recipe in their household
CREATE POLICY "Household members can edit all household recipes" 
ON public.recipes 
FOR UPDATE 
TO authenticated
USING (
  -- Check if the current user is a member of the household that owns this recipe
  EXISTS (
    SELECT 1 
    FROM public.household_members hm
    WHERE hm.household_id = recipes.household_id 
    AND hm.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Also check on update that the recipe stays in a household where the user is a member
  EXISTS (
    SELECT 1 
    FROM public.household_members hm
    WHERE hm.household_id = recipes.household_id 
    AND hm.user_id = auth.uid()
  )
);