-- ================================
-- MIGRATION: Correções Críticas de Segurança - Fase 1 (Final)
-- Data: 2025-10-08
-- Objetivo: Proteger dados sensíveis mantendo funcionalidades
-- ================================

-- ============================================================================
-- 1. PROTEGER DADOS DAS EMPRESAS
-- ============================================================================

-- Remover TODAS as políticas antigas da tabela empresas
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'empresas' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.empresas', policy_record.policyname);
  END LOOP;
END $$;

-- Criar políticas seguras: usuários veem apenas sua própria empresa
CREATE POLICY "Users can view their own empresa"
ON public.empresas
FOR SELECT
TO authenticated
USING (
  id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Admins can insert empresas"
ON public.empresas
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admins can update their empresa"
ON public.empresas
FOR UPDATE
TO authenticated
USING (
  (id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())
   AND EXISTS (
     SELECT 1 FROM public.profiles 
     WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
   ))
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

CREATE POLICY "Super admins can delete empresas"
ON public.empresas
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- ============================================================================
-- 2. PROTEGER LEADS DE CONTATO (FORMULÁRIOS)
-- ============================================================================

-- Remover todas as políticas antigas
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'contact_form_submissions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contact_form_submissions', policy_record.policyname);
  END LOOP;
END $$;

-- Público pode enviar formulários
CREATE POLICY "Anyone can submit contact forms"
ON public.contact_form_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Apenas admins veem os leads
CREATE POLICY "Only admins can view contact submissions"
ON public.contact_form_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admins can update contact submissions"
ON public.contact_form_submissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admins can delete contact submissions"
ON public.contact_form_submissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
  )
);

-- ============================================================================
-- 3. PROTEGER CONFIGURAÇÕES DO CANAL DE DENÚNCIA
-- ============================================================================

-- Remover políticas antigas
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'denuncias_configuracoes' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.denuncias_configuracoes', policy_record.policyname);
  END LOOP;
END $$;

-- Público pode ver configs básicas (necessário para formulário funcionar)
CREATE POLICY "Public can view basic denuncia config"
ON public.denuncias_configuracoes
FOR SELECT
TO anon, authenticated
USING (ativo = true);

-- Admins gerenciam as configurações
CREATE POLICY "Admins can manage denuncia config"
ON public.denuncias_configuracoes
FOR ALL
TO authenticated
USING (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  empresa_id = (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
  )
);

-- ============================================================================
-- 4. ADICIONAR ÍNDICES PARA PERFORMANCE (NOMES CORRETOS)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_empresa_id ON public.profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_role ON public.profiles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_denuncias_protocolo ON public.denuncias(protocolo);
CREATE INDEX IF NOT EXISTS idx_user_module_permissions_user_id ON public.user_module_permissions(user_id);

-- ============================================================================
-- 5. GARANTIR RLS HABILITADO
-- ============================================================================

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias_configuracoes ENABLE ROW LEVEL SECURITY;