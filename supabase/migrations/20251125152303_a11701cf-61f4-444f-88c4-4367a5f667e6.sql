-- Corrigir function com search_path seguro
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;