-- 1. Adicionar coluna requer_aprovacao na tabela documentos
ALTER TABLE public.documentos 
ADD COLUMN IF NOT EXISTS requer_aprovacao BOOLEAN DEFAULT false;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_requer_aprovacao 
ON public.documentos(requer_aprovacao);

-- 2. Remover duplicatas da tabela documentos_aprovacoes (mantendo apenas o mais recente)
DELETE FROM public.documentos_aprovacoes
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY documento_id, aprovador_id 
             ORDER BY created_at DESC
           ) as rn
    FROM public.documentos_aprovacoes
  ) t
  WHERE t.rn > 1
);

-- 3. Criar constraint único para evitar solicitações duplicadas ao mesmo aprovador
ALTER TABLE public.documentos_aprovacoes 
ADD CONSTRAINT unique_documento_aprovador 
UNIQUE (documento_id, aprovador_id);

-- 4. Criar função para verificar se todas as aprovações foram concedidas
CREATE OR REPLACE FUNCTION public.check_all_approvals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_aprovadores INT;
  total_aprovados INT;
  documento_requer_aprovacao BOOLEAN;
BEGIN
  -- Buscar se documento requer aprovação
  SELECT requer_aprovacao INTO documento_requer_aprovacao
  FROM documentos
  WHERE id = NEW.documento_id;

  -- Se não requer aprovação, não fazer nada
  IF NOT documento_requer_aprovacao THEN
    RETURN NEW;
  END IF;

  -- Contar total de aprovadores para este documento
  SELECT COUNT(*) INTO total_aprovadores
  FROM documentos_aprovacoes
  WHERE documento_id = NEW.documento_id;

  -- Contar quantos aprovaram
  SELECT COUNT(*) INTO total_aprovados
  FROM documentos_aprovacoes
  WHERE documento_id = NEW.documento_id
    AND status = 'aprovado';

  -- Se todos aprovaram, atualizar status do documento
  IF total_aprovadores > 0 AND total_aprovadores = total_aprovados THEN
    UPDATE documentos
    SET status = 'ativo',
        data_aprovacao = NOW()
    WHERE id = NEW.documento_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. Criar trigger para executar após UPDATE na tabela de aprovações
DROP TRIGGER IF EXISTS trigger_check_all_approvals ON documentos_aprovacoes;

CREATE TRIGGER trigger_check_all_approvals
AFTER UPDATE OF status ON documentos_aprovacoes
FOR EACH ROW
WHEN (NEW.status = 'aprovado')
EXECUTE FUNCTION check_all_approvals();