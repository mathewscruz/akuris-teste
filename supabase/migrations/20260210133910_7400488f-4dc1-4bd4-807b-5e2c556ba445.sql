
-- =============================================
-- MÓDULO 1: RELATÓRIOS CUSTOMIZÁVEIS
-- =============================================

-- Relatórios salvos
CREATE TABLE public.relatorios_customizados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'customizado' CHECK (tipo IN ('customizado', 'template')),
  template_base TEXT, -- 'lgpd_anpd', 'iso27001_auditoria', 'executivo_trimestral', etc.
  configuracao JSONB NOT NULL DEFAULT '{}', -- widgets, layout, filtros
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'arquivado')),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_relatorios_empresa ON public.relatorios_customizados(empresa_id);
ALTER TABLE public.relatorios_customizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relatorios_select" ON public.relatorios_customizados FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "relatorios_insert" ON public.relatorios_customizados FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "relatorios_update" ON public.relatorios_customizados FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "relatorios_delete" ON public.relatorios_customizados FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE TRIGGER update_relatorios_updated_at
  BEFORE UPDATE ON public.relatorios_customizados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Agendamentos de relatórios
CREATE TABLE public.relatorio_agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relatorio_id UUID NOT NULL REFERENCES public.relatorios_customizados(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  frequencia TEXT NOT NULL CHECK (frequencia IN ('semanal', 'mensal', 'trimestral')),
  dia_envio INTEGER DEFAULT 1, -- dia da semana (1-7) ou dia do mês (1-28)
  destinatarios TEXT[] NOT NULL DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  ultimo_envio TIMESTAMP WITH TIME ZONE,
  proximo_envio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.relatorio_agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agendamentos_select" ON public.relatorio_agendamentos FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "agendamentos_insert" ON public.relatorio_agendamentos FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "agendamentos_update" ON public.relatorio_agendamentos FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "agendamentos_delete" ON public.relatorio_agendamentos FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON public.relatorio_agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- MÓDULO 2: POLÍTICAS E TREINAMENTOS
-- =============================================

-- Políticas
CREATE TABLE public.politicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'seguranca' CHECK (categoria IN ('seguranca', 'privacidade', 'compliance', 'rh', 'ti', 'operacional', 'outra')),
  conteudo TEXT, -- conteúdo HTML/markdown da política
  arquivo_url TEXT,
  arquivo_nome TEXT,
  versao INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada', 'em_revisao', 'arquivada')),
  data_publicacao TIMESTAMP WITH TIME ZONE,
  data_validade DATE,
  requer_aceite BOOLEAN NOT NULL DEFAULT true,
  requer_questionario BOOLEAN NOT NULL DEFAULT false,
  nota_minima_aprovacao INTEGER DEFAULT 70, -- % mínimo no questionário
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_politicas_empresa ON public.politicas(empresa_id);
ALTER TABLE public.politicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "politicas_select" ON public.politicas FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "politicas_insert" ON public.politicas FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "politicas_update" ON public.politicas FOR UPDATE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "politicas_delete" ON public.politicas FOR DELETE
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE TRIGGER update_politicas_updated_at
  BEFORE UPDATE ON public.politicas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Aceites de políticas
CREATE TABLE public.politica_aceites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politica_id UUID NOT NULL REFERENCES public.politicas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  aceito BOOLEAN NOT NULL DEFAULT false,
  data_aceite TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  versao_politica INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(politica_id, user_id, versao_politica)
);

CREATE INDEX idx_aceites_politica ON public.politica_aceites(politica_id);
CREATE INDEX idx_aceites_user ON public.politica_aceites(user_id);
ALTER TABLE public.politica_aceites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aceites_select" ON public.politica_aceites FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "aceites_insert" ON public.politica_aceites FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "aceites_update" ON public.politica_aceites FOR UPDATE
  USING (user_id = auth.uid());

-- Questionários de políticas
CREATE TABLE public.politica_questionarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politica_id UUID NOT NULL REFERENCES public.politicas(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL DEFAULT '[]', -- [{texto, correta}]
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.politica_questionarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questionarios_select" ON public.politica_questionarios FOR SELECT
  USING (politica_id IN (SELECT id FROM public.politicas WHERE empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "questionarios_insert" ON public.politica_questionarios FOR INSERT
  WITH CHECK (politica_id IN (SELECT id FROM public.politicas WHERE empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "questionarios_update" ON public.politica_questionarios FOR UPDATE
  USING (politica_id IN (SELECT id FROM public.politicas WHERE empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "questionarios_delete" ON public.politica_questionarios FOR DELETE
  USING (politica_id IN (SELECT id FROM public.politicas WHERE empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid())));

-- Respostas dos questionários
CREATE TABLE public.politica_respostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politica_id UUID NOT NULL REFERENCES public.politicas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  respostas JSONB NOT NULL DEFAULT '[]', -- [{pergunta_id, opcao_selecionada, correta}]
  nota INTEGER NOT NULL DEFAULT 0, -- percentual de acerto
  aprovado BOOLEAN NOT NULL DEFAULT false,
  tentativa INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_respostas_politica ON public.politica_respostas(politica_id);
ALTER TABLE public.politica_respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "respostas_select" ON public.politica_respostas FOR SELECT
  USING (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "respostas_insert" ON public.politica_respostas FOR INSERT
  WITH CHECK (empresa_id IN (SELECT empresa_id FROM public.profiles WHERE user_id = auth.uid()));
