-- Backup da coluna responsavel antes de modificar
ALTER TABLE controles ADD COLUMN IF NOT EXISTS responsavel_backup text;
UPDATE controles SET responsavel_backup = responsavel WHERE responsavel IS NOT NULL;

-- Criar coluna temporária para responsavel_id
ALTER TABLE controles ADD COLUMN IF NOT EXISTS responsavel_id uuid;

-- Tentar mapear responsáveis existentes (texto → user_id) onde possível
UPDATE controles c
SET responsavel_id = p.user_id
FROM profiles p
WHERE c.responsavel IS NOT NULL 
  AND c.responsavel != ''
  AND LOWER(c.responsavel) LIKE '%' || LOWER(p.nome) || '%'
  AND c.empresa_id = p.empresa_id;

-- Remover coluna antiga responsavel (texto)
ALTER TABLE controles DROP COLUMN IF EXISTS responsavel;

-- Adicionar foreign key para profiles
ALTER TABLE controles 
ADD CONSTRAINT fk_controles_responsavel 
FOREIGN KEY (responsavel_id) 
REFERENCES profiles(user_id) 
ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_controles_responsavel_id ON controles(responsavel_id);

-- Backup da coluna processo antes de remover
ALTER TABLE controles ADD COLUMN IF NOT EXISTS processo_backup text;
UPDATE controles SET processo_backup = processo WHERE processo IS NOT NULL;

-- Remover coluna processo (será substituída por relacionamento com riscos via controles_riscos)
ALTER TABLE controles DROP COLUMN IF EXISTS processo;

-- Criar tabela controles_auditorias para relacionamento N:N
CREATE TABLE IF NOT EXISTS controles_auditorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  controle_id uuid NOT NULL REFERENCES controles(id) ON DELETE CASCADE,
  auditoria_id uuid NOT NULL REFERENCES auditorias(id) ON DELETE CASCADE,
  tipo_relacao text DEFAULT 'testado_em',
  observacoes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(controle_id, auditoria_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_controles_auditorias_controle ON controles_auditorias(controle_id);
CREATE INDEX IF NOT EXISTS idx_controles_auditorias_auditoria ON controles_auditorias(auditoria_id);

-- Habilitar RLS
ALTER TABLE controles_auditorias ENABLE ROW LEVEL SECURITY;

-- RLS Policies para controles_auditorias
CREATE POLICY "Users can view controles_auditorias from their empresa"
ON controles_auditorias FOR SELECT
USING (controle_pertence_empresa(controle_id));

CREATE POLICY "Users can insert controles_auditorias in their empresa"
ON controles_auditorias FOR INSERT
WITH CHECK (controle_pertence_empresa(controle_id));

CREATE POLICY "Users can update controles_auditorias from their empresa"
ON controles_auditorias FOR UPDATE
USING (controle_pertence_empresa(controle_id));

CREATE POLICY "Users can delete controles_auditorias from their empresa"
ON controles_auditorias FOR DELETE
USING (controle_pertence_empresa(controle_id));

-- Trigger para updated_at
CREATE TRIGGER update_controles_auditorias_updated_at
  BEFORE UPDATE ON controles_auditorias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();