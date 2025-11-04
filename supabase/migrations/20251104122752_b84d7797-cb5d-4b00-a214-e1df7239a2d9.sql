-- Criar tabelas para Avaliação de Aderência no Gap Analysis

-- Tabela principal de avaliações de aderência
CREATE TABLE IF NOT EXISTS public.gap_analysis_adherence_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  framework_id UUID NOT NULL REFERENCES public.gap_analysis_frameworks(id) ON DELETE CASCADE,
  documento_id UUID NOT NULL REFERENCES public.documentos(id) ON DELETE CASCADE,
  nome_analise TEXT NOT NULL,
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'erro')),
  resultado_geral TEXT CHECK (resultado_geral IN ('conforme', 'nao_conforme', 'parcial')),
  percentual_conformidade NUMERIC(5,2) DEFAULT 0 CHECK (percentual_conformidade >= 0 AND percentual_conformidade <= 100),
  pontos_fortes JSONB DEFAULT '[]'::jsonb,
  pontos_melhoria JSONB DEFAULT '[]'::jsonb,
  gaps_identificados JSONB DEFAULT '[]'::jsonb,
  recomendacoes JSONB DEFAULT '[]'::jsonb,
  analise_detalhada TEXT,
  documento_nome TEXT,
  documento_tipo TEXT,
  framework_nome TEXT,
  framework_versao TEXT,
  metadados_analise JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de detalhes por requisito
CREATE TABLE IF NOT EXISTS public.gap_analysis_adherence_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.gap_analysis_adherence_assessments(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES public.gap_analysis_requirements(id) ON DELETE CASCADE,
  requisito_codigo TEXT,
  requisito_titulo TEXT,
  status_aderencia TEXT NOT NULL CHECK (status_aderencia IN ('conforme', 'nao_conforme', 'parcial', 'nao_aplicavel')),
  evidencias_encontradas TEXT,
  gaps_especificos TEXT,
  score_conformidade NUMERIC(3,1) CHECK (score_conformidade >= 0 AND score_conformidade <= 10),
  observacoes_ia TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_adherence_assessments_empresa ON public.gap_analysis_adherence_assessments(empresa_id);
CREATE INDEX IF NOT EXISTS idx_adherence_assessments_framework ON public.gap_analysis_adherence_assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_adherence_assessments_documento ON public.gap_analysis_adherence_assessments(documento_id);
CREATE INDEX IF NOT EXISTS idx_adherence_assessments_status ON public.gap_analysis_adherence_assessments(status);
CREATE INDEX IF NOT EXISTS idx_adherence_details_assessment ON public.gap_analysis_adherence_details(assessment_id);
CREATE INDEX IF NOT EXISTS idx_adherence_details_requirement ON public.gap_analysis_adherence_details(requirement_id);

-- Habilitar RLS
ALTER TABLE public.gap_analysis_adherence_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gap_analysis_adherence_details ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para gap_analysis_adherence_assessments
CREATE POLICY "Users can view adherence assessments from their company"
ON public.gap_analysis_adherence_assessments FOR SELECT
USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users can insert adherence assessments in their company"
ON public.gap_analysis_adherence_assessments FOR INSERT
WITH CHECK (empresa_id = get_user_empresa_id());

CREATE POLICY "Users can update adherence assessments from their company"
ON public.gap_analysis_adherence_assessments FOR UPDATE
USING (empresa_id = get_user_empresa_id());

CREATE POLICY "Users can delete adherence assessments from their company"
ON public.gap_analysis_adherence_assessments FOR DELETE
USING (empresa_id = get_user_empresa_id());

-- Políticas RLS para gap_analysis_adherence_details
CREATE POLICY "Users can view adherence details from their company"
ON public.gap_analysis_adherence_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gap_analysis_adherence_assessments
    WHERE id = gap_analysis_adherence_details.assessment_id
    AND empresa_id = get_user_empresa_id()
  )
);

CREATE POLICY "Users can insert adherence details in their company"
ON public.gap_analysis_adherence_details FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.gap_analysis_adherence_assessments
    WHERE id = gap_analysis_adherence_details.assessment_id
    AND empresa_id = get_user_empresa_id()
  )
);

CREATE POLICY "Users can update adherence details from their company"
ON public.gap_analysis_adherence_details FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.gap_analysis_adherence_assessments
    WHERE id = gap_analysis_adherence_details.assessment_id
    AND empresa_id = get_user_empresa_id()
  )
);

CREATE POLICY "Users can delete adherence details from their company"
ON public.gap_analysis_adherence_details FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.gap_analysis_adherence_assessments
    WHERE id = gap_analysis_adherence_details.assessment_id
    AND empresa_id = get_user_empresa_id()
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_adherence_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_adherence_assessments_updated_at
BEFORE UPDATE ON public.gap_analysis_adherence_assessments
FOR EACH ROW
EXECUTE FUNCTION update_adherence_assessments_updated_at();