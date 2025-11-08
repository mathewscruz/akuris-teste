-- Criar tabela de revisões de acesso
CREATE TABLE IF NOT EXISTS public.access_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  sistema_id UUID NOT NULL REFERENCES public.sistemas_privilegiados(id) ON DELETE CASCADE,
  nome_revisao TEXT NOT NULL,
  descricao TEXT,
  tipo_revisao TEXT NOT NULL CHECK (tipo_revisao IN ('periodica', 'ad_hoc', 'recertificacao')),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_limite DATE NOT NULL,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  responsavel_revisao UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  link_token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_andamento', 'concluida', 'cancelada')),
  total_contas INTEGER NOT NULL DEFAULT 0,
  contas_revisadas INTEGER NOT NULL DEFAULT 0,
  contas_aprovadas INTEGER NOT NULL DEFAULT 0,
  contas_revogadas INTEGER NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens da revisão
CREATE TABLE IF NOT EXISTS public.access_review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.access_reviews(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES public.contas_privilegiadas(id) ON DELETE CASCADE,
  usuario_beneficiario TEXT NOT NULL,
  email_beneficiario TEXT,
  tipo_acesso TEXT NOT NULL,
  nivel_privilegio TEXT NOT NULL,
  data_concessao DATE,
  data_expiracao DATE,
  justificativa_original TEXT,
  decisao TEXT NOT NULL DEFAULT 'pendente' CHECK (decisao IN ('pendente', 'aprovar', 'revogar', 'modificar')),
  nova_data_expiracao DATE,
  justificativa_revisor TEXT,
  revisado_por UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  data_revisao TIMESTAMP WITH TIME ZONE,
  observacoes_revisor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, conta_id)
);

-- Criar tabela de histórico de revisões
CREATE TABLE IF NOT EXISTS public.access_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES public.access_reviews(id) ON DELETE CASCADE,
  conta_id UUID NOT NULL REFERENCES public.contas_privilegiadas(id) ON DELETE CASCADE,
  sistema_nome TEXT NOT NULL,
  usuario_beneficiario TEXT NOT NULL,
  email_beneficiario TEXT,
  tipo_acesso TEXT NOT NULL,
  nivel_privilegio TEXT NOT NULL,
  decisao TEXT NOT NULL,
  justificativa_revisor TEXT,
  revisado_por UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  data_revisao TIMESTAMP WITH TIME ZONE NOT NULL,
  acao_tomada TEXT NOT NULL CHECK (acao_tomada IN ('mantido', 'revogado', 'expirado_atualizado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_access_reviews_empresa ON public.access_reviews(empresa_id);
CREATE INDEX IF NOT EXISTS idx_access_reviews_sistema ON public.access_reviews(sistema_id);
CREATE INDEX IF NOT EXISTS idx_access_reviews_status ON public.access_reviews(status);
CREATE INDEX IF NOT EXISTS idx_access_reviews_responsavel ON public.access_reviews(responsavel_revisao);
CREATE INDEX IF NOT EXISTS idx_access_reviews_token ON public.access_reviews(link_token);

CREATE INDEX IF NOT EXISTS idx_access_review_items_review ON public.access_review_items(review_id);
CREATE INDEX IF NOT EXISTS idx_access_review_items_conta ON public.access_review_items(conta_id);
CREATE INDEX IF NOT EXISTS idx_access_review_items_decisao ON public.access_review_items(decisao);

CREATE INDEX IF NOT EXISTS idx_access_review_history_empresa ON public.access_review_history(empresa_id);
CREATE INDEX IF NOT EXISTS idx_access_review_history_review ON public.access_review_history(review_id);
CREATE INDEX IF NOT EXISTS idx_access_review_history_conta ON public.access_review_history(conta_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_access_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_access_reviews_updated_at
  BEFORE UPDATE ON public.access_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_access_reviews_updated_at();

CREATE TRIGGER update_access_review_items_updated_at
  BEFORE UPDATE ON public.access_review_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_access_reviews_updated_at();

-- Função auxiliar para verificar se revisão pertence à empresa
CREATE OR REPLACE FUNCTION public.review_pertence_empresa(review_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.access_reviews 
    WHERE id = review_id_param AND empresa_id = public.get_user_empresa_id()
  );
$$;

-- RLS Policies para access_reviews
ALTER TABLE public.access_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem revisões da própria empresa"
  ON public.access_reviews FOR SELECT
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Usuários podem criar revisões"
  ON public.access_reviews FOR INSERT
  WITH CHECK (
    empresa_id = public.get_user_empresa_id() AND
    created_by = auth.uid()
  );

CREATE POLICY "Admins podem atualizar revisões"
  ON public.access_reviews FOR UPDATE
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Admins podem deletar revisões"
  ON public.access_reviews FOR DELETE
  USING (empresa_id = public.get_user_empresa_id() AND public.is_admin_or_super_admin());

-- RLS Policies para access_review_items
ALTER TABLE public.access_review_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem itens de revisões da empresa"
  ON public.access_review_items FOR SELECT
  USING (public.review_pertence_empresa(review_id));

CREATE POLICY "Sistema pode criar itens"
  ON public.access_review_items FOR INSERT
  WITH CHECK (public.review_pertence_empresa(review_id));

CREATE POLICY "Usuários podem atualizar itens"
  ON public.access_review_items FOR UPDATE
  USING (public.review_pertence_empresa(review_id));

CREATE POLICY "Sistema pode deletar itens"
  ON public.access_review_items FOR DELETE
  USING (public.review_pertence_empresa(review_id));

-- RLS Policies para access_review_history
ALTER TABLE public.access_review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem histórico da própria empresa"
  ON public.access_review_history FOR SELECT
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Sistema pode inserir histórico"
  ON public.access_review_history FOR INSERT
  WITH CHECK (empresa_id = public.get_user_empresa_id());

-- Trigger para atualizar contadores na review
CREATE OR REPLACE FUNCTION public.update_review_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores quando decisão muda
  IF (TG_OP = 'UPDATE' AND OLD.decisao != NEW.decisao) OR TG_OP = 'INSERT' THEN
    UPDATE public.access_reviews SET
      contas_revisadas = (
        SELECT COUNT(*) FROM public.access_review_items 
        WHERE review_id = NEW.review_id AND decisao != 'pendente'
      ),
      contas_aprovadas = (
        SELECT COUNT(*) FROM public.access_review_items 
        WHERE review_id = NEW.review_id AND decisao = 'aprovar'
      ),
      contas_revogadas = (
        SELECT COUNT(*) FROM public.access_review_items 
        WHERE review_id = NEW.review_id AND decisao = 'revogar'
      )
    WHERE id = NEW.review_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_review_counters
  AFTER INSERT OR UPDATE ON public.access_review_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_counters();

-- Função para gerar token de revisão
CREATE OR REPLACE FUNCTION public.gerar_token_revisao()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token TEXT;
BEGIN
  token := encode(gen_random_bytes(32), 'hex');
  RETURN token;
END;
$$;