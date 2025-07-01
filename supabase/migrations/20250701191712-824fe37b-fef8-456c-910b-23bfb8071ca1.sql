
-- Create table for storing RealiChef chat messages
CREATE TABLE public.realichef_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  page_context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.realichef_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own chat messages
CREATE POLICY "Users can view their own chat messages" 
  ON public.realichef_chat_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" 
  ON public.realichef_chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" 
  ON public.realichef_chat_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" 
  ON public.realichef_chat_messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_realichef_chat_messages_updated_at
  BEFORE UPDATE ON public.realichef_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_realichef_chat_messages_user_created 
  ON public.realichef_chat_messages(user_id, created_at DESC);

-- Enable realtime for live updates
ALTER TABLE public.realichef_chat_messages REPLICA IDENTITY FULL;
