-- Parte 4: COSO Internal Control 2013 (17 princípios)
-- Framework: COSO Internal Control 2013

INSERT INTO public.gap_analysis_requirements (framework_id, codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
SELECT 
  f.id,
  r.codigo,
  r.titulo,
  r.descricao,
  r.categoria,
  r.area_responsavel,
  r.peso,
  r.obrigatorio,
  r.ordem
FROM public.gap_analysis_frameworks f
CROSS JOIN (VALUES
  -- Ambiente de Controle
  ('P1', 'Demonstra Compromisso com Integridade', 'Organização demonstra compromisso com integridade e valores éticos', 'Ambiente de Controle', 'Compliance', 3, true, 1),
  ('P2', 'Exercita Responsabilidade de Supervisão', 'Conselho demonstra independência da gestão e supervisiona desenvolvimento de controles internos', 'Ambiente de Controle', 'Conselho de Administração', 3, true, 2),
  ('P3', 'Estabelece Estrutura, Autoridade e Responsabilidade', 'Gestão estabelece estruturas, linhas de reporte e autoridades apropriadas', 'Ambiente de Controle', 'Governança Corporativa', 3, true, 3),
  ('P4', 'Demonstra Compromisso com Competência', 'Organização demonstra compromisso em atrair, desenvolver e reter pessoas competentes', 'Ambiente de Controle', 'Recursos Humanos', 2, true, 4),
  ('P5', 'Reforça Responsabilização', 'Organização mantém pessoas responsáveis por suas responsabilidades de controle interno', 'Ambiente de Controle', 'Compliance', 3, true, 5),
  
  -- Avaliação de Riscos
  ('P6', 'Especifica Objetivos Relevantes', 'Organização especifica objetivos com claridade suficiente para permitir identificação de riscos', 'Avaliação de Riscos', 'Estratégia', 3, true, 6),
  ('P7', 'Identifica e Analisa Riscos', 'Organização identifica riscos para alcance de seus objetivos e os analisa', 'Avaliação de Riscos', 'Gestão de Riscos', 3, true, 7),
  ('P8', 'Avalia Risco de Fraude', 'Organização considera potencial de fraude na avaliação de riscos', 'Avaliação de Riscos', 'Auditoria Interna', 3, true, 8),
  ('P9', 'Identifica e Analisa Mudanças Significativas', 'Organização identifica e avalia mudanças que poderiam impactar sistema de controle interno', 'Avaliação de Riscos', 'Gestão de Riscos', 3, true, 9),
  
  -- Atividades de Controle
  ('P10', 'Seleciona e Desenvolve Atividades de Controle', 'Organização seleciona e desenvolve atividades de controle que contribuem para mitigação de riscos', 'Atividades de Controle', 'Controles Internos', 3, true, 10),
  ('P11', 'Seleciona e Desenvolve Controles Gerais sobre Tecnologia', 'Organização seleciona e desenvolve atividades de controle geral sobre tecnologia', 'Atividades de Controle', 'TI', 3, true, 11),
  ('P12', 'Implementa através de Políticas e Procedimentos', 'Organização implementa atividades de controle através de políticas e procedimentos', 'Atividades de Controle', 'Compliance', 3, true, 12),
  
  -- Informação e Comunicação
  ('P13', 'Usa Informação Relevante', 'Organização obtém ou gera e usa informação relevante e de qualidade', 'Informação e Comunicação', 'TI', 3, true, 13),
  ('P14', 'Comunica Internamente', 'Organização comunica internamente informações necessárias para apoiar controle interno', 'Informação e Comunicação', 'Comunicação', 2, true, 14),
  ('P15', 'Comunica Externamente', 'Organização comunica com partes externas sobre assuntos que afetam controle interno', 'Informação e Comunicação', 'Comunicação', 2, true, 15),
  
  -- Atividades de Monitoramento
  ('P16', 'Conduz Avaliações Contínuas e/ou Separadas', 'Organização seleciona, desenvolve e realiza avaliações contínuas e/ou separadas', 'Atividades de Monitoramento', 'Auditoria Interna', 3, true, 16),
  ('P17', 'Avalia e Comunica Deficiências', 'Organização avalia e comunica deficiências de controle interno em tempo hábil', 'Atividades de Monitoramento', 'Auditoria Interna', 3, true, 17)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'COSO Internal Control 2013' AND f.versao = '2013';