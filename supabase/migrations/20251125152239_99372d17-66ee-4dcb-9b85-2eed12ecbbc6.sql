-- Adicionar campos para sistema de trial na tabela empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS status_licenca text DEFAULT 'em_operacao',
ADD COLUMN IF NOT EXISTS data_inicio_trial timestamp with time zone;

-- Constraint para valores válidos
ALTER TABLE empresas 
ADD CONSTRAINT check_status_licenca 
CHECK (status_licenca IN ('trial', 'em_operacao'));

-- Function para verificar e desabilitar empresas com trial expirado
CREATE OR REPLACE FUNCTION check_trial_expiration()
RETURNS void AS $$
BEGIN
  UPDATE empresas
  SET ativo = false
  WHERE status_licenca = 'trial'
    AND data_inicio_trial IS NOT NULL
    AND data_inicio_trial + INTERVAL '14 days' < NOW()
    AND ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;