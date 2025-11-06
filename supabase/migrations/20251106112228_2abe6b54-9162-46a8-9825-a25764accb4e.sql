-- Adicionar frameworks padrão para avaliação de aderência
INSERT INTO public.gap_analysis_frameworks (nome, versao, tipo_framework, descricao, empresa_id)
SELECT 
  frameworks.nome,
  frameworks.versao,
  frameworks.tipo_framework,
  frameworks.descricao,
  e.id as empresa_id
FROM (
  VALUES
    ('ISO/IEC 27001', '2022', 'seguranca_informacao', 'Sistema de Gestão de Segurança da Informação'),
    ('ISO 31000', '2018', 'gestao_riscos', 'Gestão de Riscos - Diretrizes'),
    ('COBIT', '2019', 'governanca_ti', 'Framework de Governança e Gestão de TI'),
    ('COSO ERM', '2017', 'gestao_riscos', 'Gerenciamento de Riscos Corporativos'),
    ('NIST CSF', '2.0', 'seguranca_informacao', 'Cybersecurity Framework'),
    ('GDPR', '2018', 'privacidade', 'Regulamento Geral de Proteção de Dados'),
    ('LGPD', '2020', 'privacidade', 'Lei Geral de Proteção de Dados'),
    ('PCI DSS', '4.0', 'seguranca_informacao', 'Payment Card Industry Data Security Standard'),
    ('CIS Controls', 'v8', 'seguranca_informacao', 'Center for Internet Security Controls'),
    ('ISO 37301', '2021', 'compliance', 'Sistemas de Gestão de Compliance'),
    ('ITIL', 'v4', 'governanca_ti', 'Information Technology Infrastructure Library'),
    ('SOX', '2002', 'compliance', 'Sarbanes-Oxley Act'),
    ('COSO Internal Control', '2013', 'controles_internos', 'Integrated Framework - Controles Internos'),
    ('ISO 9001', '2015', 'qualidade', 'Sistema de Gestão da Qualidade'),
    ('ISO 14001', '2015', 'meio_ambiente', 'Sistema de Gestão Ambiental'),
    ('ISO/IEC 27701', '2019', 'privacidade', 'Sistema de Gestão de Informações de Privacidade'),
    ('ISO/IEC 20000', '2018', 'governanca_ti', 'Sistema de Gestão de Serviços de TI'),
    ('HIPAA', '1996', 'privacidade', 'Health Insurance Portability and Accountability Act'),
    ('SOC 2', 'Type II', 'seguranca_informacao', 'Service Organization Control 2')
) AS frameworks(nome, versao, tipo_framework, descricao)
CROSS JOIN public.empresas e
WHERE NOT EXISTS (
  SELECT 1 FROM public.gap_analysis_frameworks f
  WHERE f.nome = frameworks.nome 
  AND f.empresa_id = e.id
);

-- Criar bucket de storage para documentos de aderência
INSERT INTO storage.buckets (id, name, public)
VALUES ('adherence-documents', 'adherence-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket adherence-documents
CREATE POLICY "Users can upload adherence docs to their empresa"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'adherence-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT empresa_id::text FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view adherence docs from their empresa"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'adherence-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT empresa_id::text FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete adherence docs from their empresa"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'adherence-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT empresa_id::text FROM public.profiles WHERE user_id = auth.uid()
  )
);