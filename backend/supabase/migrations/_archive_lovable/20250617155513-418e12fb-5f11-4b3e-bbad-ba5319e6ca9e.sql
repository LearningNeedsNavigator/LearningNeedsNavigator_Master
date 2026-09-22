
-- Create analytics events table to track user interactions
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment analytics table for tracking assessment progress
CREATE TABLE public.assessment_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  segment_id TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  results_data JSONB
);

-- Enable RLS on both tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_events
CREATE POLICY "Users can view their own analytics events" 
  ON public.analytics_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events" 
  ON public.analytics_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for assessment_analytics
CREATE POLICY "Users can view their own assessment analytics" 
  ON public.assessment_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessment analytics" 
  ON public.assessment_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment analytics" 
  ON public.assessment_analytics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_assessment_analytics_user_id ON public.assessment_analytics(user_id);
CREATE INDEX idx_assessment_analytics_segment_id ON public.assessment_analytics(segment_id);
