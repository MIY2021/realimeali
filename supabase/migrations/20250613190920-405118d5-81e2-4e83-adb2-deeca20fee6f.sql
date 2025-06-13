
-- Check if admin policies exist and create them if they don't
DO $$
BEGIN
    -- Add admin SELECT policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feedback_suggestions' 
        AND policyname = 'Admins can view all feedback'
    ) THEN
        CREATE POLICY "Admins can view all feedback" 
        ON public.feedback_suggestions 
        FOR SELECT 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    
    -- Add admin UPDATE policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feedback_suggestions' 
        AND policyname = 'Admins can update all feedback'
    ) THEN
        CREATE POLICY "Admins can update all feedback" 
        ON public.feedback_suggestions 
        FOR UPDATE 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    
    -- Add user view policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'feedback_suggestions' 
        AND policyname = 'Users can view their own feedback'
    ) THEN
        CREATE POLICY "Users can view their own feedback" 
        ON public.feedback_suggestions 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
END
$$;
