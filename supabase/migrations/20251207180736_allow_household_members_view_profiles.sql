-- Allow household members to view each other's profiles
-- This enables displaying names in activity feeds and member lists
-- while maintaining security by only allowing access to profiles of users in the same household
--
-- This policy works alongside "Users can view own profile" to allow:
-- 1. Users to view their own profile (existing policy)
-- 2. Household members to view each other's profiles (this new policy)

CREATE POLICY "Household members can view each other's profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Check if the current user and the profile owner are in the same household
  EXISTS (
    SELECT 1 
    FROM public.household_members hm1
    INNER JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
    WHERE hm1.user_id = auth.uid()    -- Current user is a household member
    AND hm2.user_id = profiles.id      -- Profile belongs to another member in the same household
  )
);
