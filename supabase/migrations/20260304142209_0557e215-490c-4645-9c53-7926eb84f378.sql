
-- Add compliance context fields to empresas table
ALTER TABLE public.empresas 
  ADD COLUMN IF NOT EXISTS setor_atuacao text,
  ADD COLUMN IF NOT EXISTS porte_empresa text,
  ADD COLUMN IF NOT EXISTS objetivo_compliance text,
  ADD COLUMN IF NOT EXISTS data_alvo_certificacao date;
