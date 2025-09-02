-- Create contact_form_submissions table to store contact form data
CREATE TABLE IF NOT EXISTS public.contact_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed'))
);

-- Enable RLS
ALTER TABLE public.contact_form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous users to insert contact forms
CREATE POLICY "Anyone can submit contact forms" 
ON public.contact_form_submissions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Create policy to allow authenticated admins to view submissions
CREATE POLICY "Admins can view contact submissions" 
ON public.contact_form_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);