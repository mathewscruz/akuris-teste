
-- SoA (Statement of Applicability) table
CREATE TABLE IF NOT EXISTS public.gap_analysis_soa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES public.gap_analysis_frameworks(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.gap_analysis_requirements(id) ON DELETE CASCADE,
  aplicavel boolean NOT NULL DEFAULT true,
  justificativa text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(framework_id, empresa_id, requirement_id)
);

ALTER TABLE public.gap_analysis_soa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own empresa SoA"
  ON public.gap_analysis_soa FOR SELECT
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can insert own empresa SoA"
  ON public.gap_analysis_soa FOR INSERT
  TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can update own empresa SoA"
  ON public.gap_analysis_soa FOR UPDATE
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id());

CREATE POLICY "Users can delete own empresa SoA"
  ON public.gap_analysis_soa FOR DELETE
  TO authenticated
  USING (empresa_id = public.get_user_empresa_id());
