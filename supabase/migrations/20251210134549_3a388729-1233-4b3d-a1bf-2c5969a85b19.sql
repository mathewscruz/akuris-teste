-- =============================================
-- COMPREHENSIVE SECURITY FIX MIGRATION
-- Fixes 4 critical security issues:
-- 1. Create user_roles table (proper role architecture)
-- 2. Fix due_diligence_assessments token-based access
-- 3. Fix due_diligence_responses token-based access
-- 4. Update contact_form_submissions to use new role system
-- =============================================

-- =============================================
-- PART 1: Create user_roles table and functions
-- =============================================

-- Create app_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
  END IF;
END$$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create SECURITY DEFINER function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to check if current user is admin via new table
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
  )
$$;

-- Create helper function to check if current user is super_admin via new table
CREATE OR REPLACE FUNCTION public.has_super_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  )
$$;

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  CASE 
    WHEN role::text = 'super_admin' THEN 'super_admin'::app_role
    WHEN role::text = 'admin' THEN 'admin'::app_role
    ELSE 'user'::app_role
  END
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS policies for user_roles table
-- Only super_admins can manage roles
CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_super_admin_role() OR user_id = auth.uid());

CREATE POLICY "Only super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_super_admin_role());

CREATE POLICY "Only super admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_super_admin_role());

CREATE POLICY "Only super admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_super_admin_role());

-- =============================================
-- PART 2: Fix due_diligence_assessments policies
-- The current policy exposes ALL assessments with tokens
-- Fix: Require the token to be passed via request header
-- =============================================

-- Drop the insecure policies
DROP POLICY IF EXISTS "Simple view via link_token" ON public.due_diligence_assessments;
DROP POLICY IF EXISTS "Simple update via link_token" ON public.due_diligence_assessments;

-- Create secure token-based access policies
-- These require the actual token value to be passed in a header
CREATE POLICY "View assessment via matching link_token header"
ON public.due_diligence_assessments
FOR SELECT
USING (
  -- Authenticated users from same empresa
  empresa_id = get_user_empresa_id()
  OR
  -- External access via token header - token must match exactly
  (
    link_token IS NOT NULL 
    AND link_token = current_setting('request.headers', true)::json->>'x-assessment-token'
  )
);

CREATE POLICY "Update assessment via matching link_token header"
ON public.due_diligence_assessments
FOR UPDATE
USING (
  -- Authenticated users from same empresa
  empresa_id = get_user_empresa_id()
  OR
  -- External access via token header - token must match exactly
  (
    link_token IS NOT NULL 
    AND link_token = current_setting('request.headers', true)::json->>'x-assessment-token'
  )
)
WITH CHECK (
  empresa_id = get_user_empresa_id()
  OR
  (
    link_token IS NOT NULL 
    AND link_token = current_setting('request.headers', true)::json->>'x-assessment-token'
  )
);

-- Keep the empresa-based policies (they're correct)
-- Just update them to not conflict with the new ones
DROP POLICY IF EXISTS "Users can view assessments from their empresa" ON public.due_diligence_assessments;
DROP POLICY IF EXISTS "Users can update assessments from their empresa" ON public.due_diligence_assessments;

-- =============================================
-- PART 3: Fix due_diligence_responses policies
-- Same issue - exposes all responses for any assessment with a token
-- =============================================

-- Drop the insecure policies
DROP POLICY IF EXISTS "Simple view responses" ON public.due_diligence_responses;
DROP POLICY IF EXISTS "Simple insert responses" ON public.due_diligence_responses;
DROP POLICY IF EXISTS "Simple update responses" ON public.due_diligence_responses;

-- Create secure token-based access policies
CREATE POLICY "View responses via matching assessment token"
ON public.due_diligence_responses
FOR SELECT
USING (
  -- Authenticated users from same empresa
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.empresa_id = get_user_empresa_id()
  )
  OR
  -- External access - assessment token must match
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.link_token IS NOT NULL
    AND a.link_token = current_setting('request.headers', true)::json->>'x-assessment-token'
  )
);

CREATE POLICY "Insert responses via matching assessment token"
ON public.due_diligence_responses
FOR INSERT
WITH CHECK (
  -- Authenticated users from same empresa
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.empresa_id = get_user_empresa_id()
  )
  OR
  -- External access - assessment token must match
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.link_token IS NOT NULL
    AND a.link_token = current_setting('request.headers', true)::json->>'x-assessment-token'
  )
);

CREATE POLICY "Update responses via matching assessment token"
ON public.due_diligence_responses
FOR UPDATE
USING (
  -- Authenticated users from same empresa
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.empresa_id = get_user_empresa_id()
  )
  OR
  -- External access - assessment token must match
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.link_token IS NOT NULL
    AND a.link_token = current_setting('request.headers', true)::json->>'x-assessment-token'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.empresa_id = get_user_empresa_id()
  )
  OR
  EXISTS (
    SELECT 1 FROM due_diligence_assessments a
    WHERE a.id = due_diligence_responses.assessment_id
    AND a.link_token IS NOT NULL
    AND a.link_token = current_setting('request.headers', true)::json->>'x-assessment-token'
  )
);

-- Drop the old empresa-based policies for responses (now merged into new ones)
DROP POLICY IF EXISTS "Users can view responses from their empresa assessments" ON public.due_diligence_responses;
DROP POLICY IF EXISTS "Users can insert responses in their empresa assessments" ON public.due_diligence_responses;
DROP POLICY IF EXISTS "Users can update responses from their empresa assessments" ON public.due_diligence_responses;

-- =============================================
-- PART 4: Update contact_form_submissions policies
-- Use the new has_admin_role() function instead of querying profiles.role
-- =============================================

-- Drop old policies
DROP POLICY IF EXISTS "Only admins can view contact submissions" ON public.contact_form_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_form_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON public.contact_form_submissions;

-- Create new policies using secure role check
CREATE POLICY "Admins can view contact submissions"
ON public.contact_form_submissions
FOR SELECT
TO authenticated
USING (has_admin_role());

CREATE POLICY "Admins can update contact submissions"
ON public.contact_form_submissions
FOR UPDATE
TO authenticated
USING (has_admin_role());

CREATE POLICY "Admins can delete contact submissions"
ON public.contact_form_submissions
FOR DELETE
TO authenticated
USING (has_admin_role());

-- =============================================
-- PART 5: Add comments for documentation
-- =============================================
COMMENT ON TABLE public.user_roles IS 'Stores user roles separately from profiles for security. Prevents privilege escalation attacks.';
COMMENT ON FUNCTION public.has_role IS 'SECURITY DEFINER function to safely check if a user has a specific role without RLS recursion.';
COMMENT ON FUNCTION public.has_admin_role IS 'SECURITY DEFINER function to check if current user has admin or super_admin role.';
COMMENT ON FUNCTION public.has_super_admin_role IS 'SECURITY DEFINER function to check if current user has super_admin role.';