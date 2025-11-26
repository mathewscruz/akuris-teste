-- Ajustar unicidade das avaliações de frameworks para permitir múltiplas empresas
ALTER TABLE public.gap_analysis_evaluations
  DROP CONSTRAINT IF EXISTS gap_analysis_evaluations_framework_id_requirement_id_key;

ALTER TABLE public.gap_analysis_evaluations
  ADD CONSTRAINT gap_analysis_evaluations_framework_req_empresa_key
  UNIQUE (framework_id, requirement_id, empresa_id);
