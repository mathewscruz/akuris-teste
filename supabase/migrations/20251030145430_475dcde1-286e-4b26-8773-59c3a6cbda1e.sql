
-- Corrigir inconsistência de status na tabela contas_privilegiadas
-- Atualizar registros existentes de 'ativa' para 'ativo'
UPDATE contas_privilegiadas 
SET status = 'ativo' 
WHERE status = 'ativa';

-- Atualizar o default da coluna status
ALTER TABLE contas_privilegiadas 
ALTER COLUMN status SET DEFAULT 'ativo'::text;

-- Comentário: Agora o status está consistente com o código TypeScript
