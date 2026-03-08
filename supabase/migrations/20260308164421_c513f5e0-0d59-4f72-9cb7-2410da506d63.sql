
-- Tabela principal: Planos de Continuidade de Negócios
CREATE TABLE public.continuidade_planos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'bcp', -- bcp, drp, ambos
  descricao TEXT,
  escopo TEXT,
  objetivos TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho', -- rascunho, ativo, em_revisao, desativado
  responsavel_id UUID REFERENCES public.profiles(user_id),
  rto_horas INTEGER, -- Recovery Time Objective em horas
  rpo_horas INTEGER, -- Recovery Point Objective em horas
  data_ultima_revisao TIMESTAMPTZ,
  proxima_revisao DATE,
  versao TEXT DEFAULT '1.0',
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tarefas vinculadas a planos
CREATE TABLE public.continuidade_tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.continuidade_planos(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel_id UUID REFERENCES public.profiles(user_id),
  prioridade TEXT NOT NULL DEFAULT 'media', -- baixa, media, alta, critica
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, em_andamento, concluida
  prazo DATE,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testes periódicos de planos
CREATE TABLE public.continuidade_testes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.continuidade_planos(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo_teste TEXT NOT NULL DEFAULT 'tabletop', -- tabletop, simulacao, real
  descricao TEXT,
  data_teste DATE NOT NULL,
  resultado TEXT, -- aprovado, reprovado, parcial
  observacoes TEXT,
  participantes TEXT[],
  licoes_aprendidas TEXT,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vínculos com riscos e ativos
CREATE TABLE public.continuidade_vinculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_id UUID NOT NULL REFERENCES public.continuidade_planos(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo_vinculo TEXT NOT NULL, -- risco, ativo
  registro_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.continuidade_planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuidade_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuidade_testes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuidade_vinculos ENABLE ROW LEVEL SECURITY;

-- Policies para continuidade_planos
CREATE POLICY "Users can view their company plans" ON public.continuidade_planos
  FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert plans for their company" ON public.continuidade_planos
  FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update their company plans" ON public.continuidade_planos
  FOR UPDATE TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete their company plans" ON public.continuidade_planos
  FOR DELETE TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

-- Policies para continuidade_tarefas
CREATE POLICY "Users can view their company tasks" ON public.continuidade_tarefas
  FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert tasks for their company" ON public.continuidade_tarefas
  FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update their company tasks" ON public.continuidade_tarefas
  FOR UPDATE TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete their company tasks" ON public.continuidade_tarefas
  FOR DELETE TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

-- Policies para continuidade_testes
CREATE POLICY "Users can view their company tests" ON public.continuidade_testes
  FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert tests for their company" ON public.continuidade_testes
  FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update their company tests" ON public.continuidade_testes
  FOR UPDATE TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete their company tests" ON public.continuidade_testes
  FOR DELETE TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

-- Policies para continuidade_vinculos
CREATE POLICY "Users can view their company links" ON public.continuidade_vinculos
  FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert links for their company" ON public.continuidade_vinculos
  FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete their company links" ON public.continuidade_vinculos
  FOR DELETE TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_continuidade_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_continuidade_planos_updated_at
  BEFORE UPDATE ON public.continuidade_planos
  FOR EACH ROW EXECUTE FUNCTION public.update_continuidade_updated_at();

CREATE TRIGGER update_continuidade_tarefas_updated_at
  BEFORE UPDATE ON public.continuidade_tarefas
  FOR EACH ROW EXECUTE FUNCTION public.update_continuidade_updated_at();

CREATE TRIGGER update_continuidade_testes_updated_at
  BEFORE UPDATE ON public.continuidade_testes
  FOR EACH ROW EXECUTE FUNCTION public.update_continuidade_updated_at();
