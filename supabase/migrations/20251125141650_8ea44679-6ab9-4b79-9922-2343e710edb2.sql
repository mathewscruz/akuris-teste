-- Parte 4: COSO ERM 2017 (20 princípios)
-- Framework: COSO ERM 2017

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
  -- Governança e Cultura
  ('P1', 'Exercita Supervisão de Riscos pelo Conselho', 'Conselho supervisiona estratégia e assume responsabilidade pela supervisão de riscos', 'Governança e Cultura', 'Conselho de Administração', 3, true, 1),
  ('P2', 'Estabelece Estruturas Operacionais', 'Organização estabelece estruturas operacionais para buscar estratégia e objetivos', 'Governança e Cultura', 'Governança Corporativa', 3, true, 2),
  ('P3', 'Define Cultura Desejada', 'Organização define comportamentos desejados que caracterizam a cultura desejada', 'Governança e Cultura', 'Recursos Humanos', 2, true, 3),
  ('P4', 'Demonstra Compromisso com Valores Essenciais', 'Organização demonstra compromisso com valores essenciais da entidade', 'Governança e Cultura', 'Compliance', 3, true, 4),
  ('P5', 'Atrai, Desenvolve e Retém Pessoas Capazes', 'Organização está comprometida em construir capital humano alinhado com estratégia', 'Governança e Cultura', 'Recursos Humanos', 2, true, 5),
  
  -- Estratégia e Definição de Objetivos
  ('P6', 'Analisa Contexto do Negócio', 'Organização considera impactos potenciais do contexto externo', 'Estratégia e Definição de Objetivos', 'Estratégia', 3, true, 6),
  ('P7', 'Define Apetite a Risco', 'Organização define apetite a risco no contexto de criação, preservação e realização de valor', 'Estratégia e Definição de Objetivos', 'Gestão de Riscos', 3, true, 7),
  ('P8', 'Avalia Estratégias Alternativas', 'Organização avalia estratégias alternativas e impacto potencial no perfil de risco', 'Estratégia e Definição de Objetivos', 'Estratégia', 3, true, 8),
  ('P9', 'Formula Objetivos de Negócio', 'Organização considera risco enquanto estabelece objetivos em vários níveis', 'Estratégia e Definição de Objetivos', 'Estratégia', 3, true, 9),
  
  -- Desempenho
  ('P10', 'Identifica Riscos', 'Organização identifica riscos que impactam desempenho de estratégia e objetivos', 'Desempenho', 'Gestão de Riscos', 3, true, 10),
  ('P11', 'Avalia Severidade dos Riscos', 'Organização avalia severidade dos riscos', 'Desempenho', 'Gestão de Riscos', 3, true, 11),
  ('P12', 'Prioriza Riscos', 'Organização prioriza riscos como base para seleção de respostas aos riscos', 'Desempenho', 'Gestão de Riscos', 3, true, 12),
  ('P13', 'Implementa Respostas aos Riscos', 'Organização identifica e seleciona respostas aos riscos', 'Desempenho', 'Gestão de Riscos', 3, true, 13),
  ('P14', 'Desenvolve Visão de Portfólio', 'Organização desenvolve e avalia visão de portfólio de riscos', 'Desempenho', 'Gestão de Riscos', 3, true, 14),
  
  -- Revisão e Modificação
  ('P15', 'Avalia Mudanças Substanciais', 'Organização identifica e avalia mudanças que possam impactar substancialmente estratégia e objetivos', 'Revisão e Modificação', 'Gestão de Riscos', 3, true, 15),
  ('P16', 'Revisa Risco e Desempenho', 'Organização revisa desempenho da entidade e considera risco', 'Revisão e Modificação', 'Métricas', 3, true, 16),
  ('P17', 'Busca Melhoria na Gestão de Riscos Empresariais', 'Organização busca melhoria contínua da gestão de riscos', 'Revisão e Modificação', 'Melhoria Contínua', 2, true, 17),
  
  -- Informação, Comunicação e Reporte
  ('P18', 'Alavanca Sistemas de Informação', 'Organização alavanca sistemas de informação da entidade para apoiar gestão de riscos', 'Informação, Comunicação e Reporte', 'TI', 3, true, 18),
  ('P19', 'Comunica Informações sobre Riscos', 'Organização usa canais de comunicação para apoiar gestão de riscos', 'Informação, Comunicação e Reporte', 'Comunicação', 2, true, 19),
  ('P20', 'Reporta sobre Risco, Cultura e Desempenho', 'Organização reporta sobre risco, cultura e desempenho em múltiplos níveis', 'Informação, Comunicação e Reporte', 'Reporte Gerencial', 3, true, 20)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'COSO ERM 2017' AND f.versao = '2017';