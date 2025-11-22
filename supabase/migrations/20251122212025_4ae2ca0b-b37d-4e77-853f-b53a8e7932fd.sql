-- Fix Urgent Security Issue: Household Enumeration
-- Remove the policy that allows all authenticated users to browse all households
-- Households should only be visible to members, not enumerable by everyone

DROP POLICY IF EXISTS "Allow authenticated users to read households for joining" ON public.households;

-- Note: Existing policies remain that allow:
-- 1. Users to view households they are members of (via is_household_member_simple)
-- 2. Household owners to update/delete their households
-- 3. Users to create new households
-- This change prevents household enumeration while maintaining proper access for members