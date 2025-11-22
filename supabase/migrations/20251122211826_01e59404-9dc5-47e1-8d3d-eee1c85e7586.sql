-- Fix Critical Security Vulnerabilities in RLS Policies

-- 1. Fix profiles table - Remove public access to all user data
-- This prevents GDPR violation by restricting access to user emails and personal data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Allow users to view only their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Fix feedback_suggestions table - Remove exposure of anonymous feedback
-- This prevents business intelligence leakage by removing the NULL user_id loophole
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback_suggestions;

-- Recreate policy without the NULL check
CREATE POLICY "Users can view their own feedback" 
ON public.feedback_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Note: Admins already have a separate "Admins can view all feedback" policy
-- which continues to work via has_role(auth.uid(), 'admin')