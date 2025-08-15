-- Adicionar campos para solicitação de aprovação na tabela documentos_aprovacoes
ALTER TABLE public.documentos_aprovacoes 
ADD COLUMN IF NOT EXISTS solicitado_por uuid,
ADD COLUMN IF NOT EXISTS data_solicitacao timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS tipo_acao text DEFAULT 'aprovacao' CHECK (tipo_acao IN ('solicitacao', 'aprovacao')),
ADD COLUMN IF NOT EXISTS notificacao_enviada boolean DEFAULT false;

-- Atualizar RLS policies para incluir quem solicitou a aprovação
DROP POLICY IF EXISTS "Users can insert document approvals in their empresa" ON public.documentos_aprovacoes;
DROP POLICY IF EXISTS "Users can view document approvals from their empresa" ON public.documentos_aprovacoes;
DROP POLICY IF EXISTS "Users can update document approvals from their empresa" ON public.documentos_aprovacoes;
DROP POLICY IF EXISTS "Users can delete document approvals from their empresa" ON public.documentos_aprovacoes;

-- Policy para inserir: permite inserir se for da mesma empresa e for o solicitante ou aprovador
CREATE POLICY "Users can manage document approvals in their empresa" 
ON public.documentos_aprovacoes
FOR ALL
USING (
  documento_pertence_empresa(documento_id) AND 
  (aprovador_id = auth.uid() OR solicitado_por = auth.uid())
)
WITH CHECK (
  documento_pertence_empresa(documento_id) AND 
  (aprovador_id = auth.uid() OR solicitado_por = auth.uid())
);

-- Criar função para enviar notificação de solicitação de aprovação
CREATE OR REPLACE FUNCTION public.enviar_notificacao_aprovacao()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  documento_nome text;
  solicitante_nome text;
BEGIN
  -- Só processar se for uma solicitação (não aprovação direta)
  IF NEW.tipo_acao = 'solicitacao' AND NEW.notificacao_enviada = false THEN
    -- Buscar nome do documento
    SELECT nome INTO documento_nome 
    FROM documentos 
    WHERE id = NEW.documento_id;
    
    -- Buscar nome do solicitante
    SELECT nome INTO solicitante_nome 
    FROM profiles 
    WHERE user_id = NEW.solicitado_por;
    
    -- Inserir notificação para o aprovador
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      link_to,
      metadata
    ) VALUES (
      NEW.aprovador_id,
      'Solicitação de Aprovação de Documento',
      CONCAT(solicitante_nome, ' solicitou a aprovação do documento "', documento_nome, '"'),
      'info',
      '/documentos',
      jsonb_build_object(
        'documento_id', NEW.documento_id,
        'aprovacao_id', NEW.id,
        'tipo', 'solicitacao_aprovacao_documento'
      )
    );
    
    -- Marcar notificação como enviada
    UPDATE documentos_aprovacoes 
    SET notificacao_enviada = true 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para envio automático de notificações
DROP TRIGGER IF EXISTS trigger_notificacao_aprovacao ON public.documentos_aprovacoes;
CREATE TRIGGER trigger_notificacao_aprovacao
  AFTER INSERT ON public.documentos_aprovacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.enviar_notificacao_aprovacao();