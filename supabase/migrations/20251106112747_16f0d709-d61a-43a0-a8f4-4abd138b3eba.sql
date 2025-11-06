-- Permitir NULL na coluna documento_id já que agora fazemos upload direto
ALTER TABLE public.gap_analysis_adherence_assessments 
ALTER COLUMN documento_id DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.gap_analysis_adherence_assessments.documento_id IS 
'Referência opcional ao documento do sistema. Pode ser NULL quando o documento é carregado diretamente via upload.';
