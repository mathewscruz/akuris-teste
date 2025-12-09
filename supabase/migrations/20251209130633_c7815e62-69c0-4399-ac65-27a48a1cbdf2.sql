-- Adicionar coluna mencoes na tabela de comentários
ALTER TABLE public.auditoria_itens_comentarios 
ADD COLUMN IF NOT EXISTS mencoes UUID[] DEFAULT '{}';

-- Criar tabela de áreas/sistemas auditados
CREATE TABLE IF NOT EXISTS public.auditoria_areas_sistemas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auditoria_id UUID REFERENCES public.auditorias(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'area', -- 'area', 'sistema', 'processo'
  descricao TEXT,
  empresa_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar área/sistema ao item de auditoria
ALTER TABLE public.auditoria_itens 
ADD COLUMN IF NOT EXISTS area_sistema_id UUID REFERENCES public.auditoria_areas_sistemas(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.auditoria_areas_sistemas ENABLE ROW LEVEL SECURITY;

-- RLS Policies para auditoria_areas_sistemas
CREATE POLICY "Users can view areas from their company"
  ON public.auditoria_areas_sistemas
  FOR SELECT
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert areas for their company"
  ON public.auditoria_areas_sistemas
  FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update areas from their company"
  ON public.auditoria_areas_sistemas
  FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete areas from their company"
  ON public.auditoria_areas_sistemas
  FOR DELETE
  USING (empresa_id = public.get_user_empresa_id());