
-- Drop ALL existing check constraints on feedback_suggestions table
ALTER TABLE public.feedback_suggestions 
DROP CONSTRAINT IF EXISTS feedback_suggestions_status_check;

ALTER TABLE public.feedback_suggestions 
DROP CONSTRAINT IF EXISTS feedback_suggestions_priority_check;

-- Update all status values to the correct format
UPDATE public.feedback_suggestions 
SET status = CASE 
  WHEN status = 'new' THEN 'pending'
  WHEN status = 'completed' THEN 'complete'
  WHEN status = 'reviewed' THEN 'complete'
  WHEN status = 'closed' THEN 'dismissed'
  ELSE status
END
WHERE status NOT IN ('pending', 'in_progress', 'complete', 'dismissed');

-- Add missing columns for admin functionality
ALTER TABLE public.feedback_suggestions 
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';

ALTER TABLE public.feedback_suggestions 
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add the new check constraints
ALTER TABLE public.feedback_suggestions 
ADD CONSTRAINT feedback_suggestions_status_check 
CHECK (status IN ('pending', 'in_progress', 'complete', 'dismissed'));

ALTER TABLE public.feedback_suggestions 
ADD CONSTRAINT feedback_suggestions_priority_check 
CHECK (priority IN ('low', 'medium', 'high'));
