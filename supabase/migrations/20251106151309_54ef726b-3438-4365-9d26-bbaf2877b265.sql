-- Adicionar foreign key constraint entre contas_privilegiadas e sistemas_privilegiados
ALTER TABLE contas_privilegiadas 
ADD CONSTRAINT fk_contas_privilegiadas_sistema 
FOREIGN KEY (sistema_id) 
REFERENCES sistemas_privilegiados(id) 
ON DELETE CASCADE;

-- Criar índice para melhorar performance das queries com JOIN
CREATE INDEX IF NOT EXISTS idx_contas_privilegiadas_sistema_id 
ON contas_privilegiadas(sistema_id);

-- Adicionar comentário para documentação
COMMENT ON CONSTRAINT fk_contas_privilegiadas_sistema ON contas_privilegiadas 
IS 'Foreign key para vincular conta privilegiada ao sistema privilegiado';