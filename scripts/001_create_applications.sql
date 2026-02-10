-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Applied',
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline DATE,
  priority TEXT NOT NULL DEFAULT 'Medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own applications
CREATE POLICY "applications_select_own" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "applications_insert_own" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_update_own" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "applications_delete_own" ON public.applications
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_deadline ON public.applications(deadline);
