-- Allow authenticated users to update their own profile row (e.g. has_seen_welcome, settings).
-- Required for client-side profile updates when RLS is enabled.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
