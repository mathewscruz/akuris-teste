-- Parte 5: ISO 14001:2015 (45 requisitos)
-- Framework: ISO 14001:2015

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
  -- Contexto da Organização
  ('4.1', 'Entendendo a Organização e seu Contexto', 'Determinar questões ambientais externas e internas', 'Contexto da Organização', 'Meio Ambiente', 3, true, 1),
  ('4.2', 'Entendendo Necessidades das Partes Interessadas', 'Determinar partes interessadas e requisitos ambientais', 'Contexto da Organização', 'Meio Ambiente', 3, true, 2),
  ('4.3', 'Determinando Escopo do SGA', 'Determinar limites e aplicabilidade do sistema ambiental', 'Contexto da Organização', 'Meio Ambiente', 3, true, 3),
  ('4.4', 'Sistema de Gestão Ambiental', 'Estabelecer, implementar, manter e melhorar SGA', 'Contexto da Organização', 'Meio Ambiente', 3, true, 4),
  
  -- Liderança
  ('5.1', 'Liderança e Comprometimento', 'Alta direção deve demonstrar liderança ambiental', 'Liderança', 'Alta Direção', 3, true, 5),
  ('5.2', 'Política Ambiental', 'Estabelecer, implementar e manter política ambiental', 'Liderança', 'Meio Ambiente', 3, true, 6),
  ('5.3', 'Papéis, Responsabilidades e Autoridades', 'Atribuir responsabilidades ambientais', 'Liderança', 'Recursos Humanos', 2, true, 7),
  
  -- Planejamento
  ('6.1.1', 'Ações para Abordar Riscos Ambientais', 'Determinar riscos e oportunidades ambientais', 'Planejamento', 'Gestão de Riscos', 3, true, 8),
  ('6.1.2', 'Aspectos Ambientais', 'Identificar aspectos ambientais e impactos significativos', 'Planejamento', 'Meio Ambiente', 3, true, 9),
  ('6.1.3', 'Requisitos Legais e Outros', 'Determinar requisitos legais ambientais aplicáveis', 'Planejamento', 'Compliance', 3, true, 10),
  ('6.1.4', 'Planejamento de Ações', 'Planejar ações para abordar aspectos e requisitos', 'Planejamento', 'Meio Ambiente', 3, true, 11),
  ('6.2', 'Objetivos Ambientais', 'Estabelecer objetivos ambientais mensuráveis', 'Planejamento', 'Meio Ambiente', 3, true, 12),
  
  -- Suporte
  ('7.1', 'Recursos', 'Determinar e prover recursos para SGA', 'Suporte', 'Recursos', 3, true, 13),
  ('7.2', 'Competência', 'Determinar competências ambientais necessárias', 'Suporte', 'Recursos Humanos', 2, true, 14),
  ('7.3', 'Conscientização', 'Garantir conscientização sobre política ambiental', 'Suporte', 'Treinamento', 2, true, 15),
  ('7.4', 'Comunicação', 'Estabelecer comunicações ambientais internas e externas', 'Suporte', 'Comunicação', 2, true, 16),
  ('7.5', 'Informação Documentada', 'Manter informação documentada do SGA', 'Suporte', 'Gestão Documental', 3, true, 17),
  
  -- Operação
  ('8.1', 'Planejamento e Controle Operacional', 'Planejar e controlar processos ambientalmente significativos', 'Operação', 'Operações', 3, true, 18),
  ('8.2', 'Preparação e Resposta a Emergências', 'Estabelecer processos para emergências ambientais', 'Operação', 'Segurança', 3, true, 19),
  
  -- Aspectos Ambientais Específicos
  ('9.1.1', 'Monitoramento e Medição - Generalidades', 'Monitorar e medir características de operações', 'Avaliação de Desempenho', 'Métricas', 3, true, 20),
  ('9.1.2', 'Avaliação do Atendimento a Requisitos Legais', 'Avaliar atendimento a requisitos legais ambientais', 'Avaliação de Desempenho', 'Compliance', 3, true, 21),
  ('9.2', 'Auditoria Interna', 'Conduzir auditorias ambientais internas', 'Avaliação de Desempenho', 'Auditoria Interna', 3, true, 22),
  ('9.3', 'Análise Crítica pela Direção', 'Alta direção deve analisar criticamente SGA', 'Avaliação de Desempenho', 'Alta Direção', 3, true, 23),
  
  -- Melhoria
  ('10.1', 'Generalidades da Melhoria', 'Determinar oportunidades de melhoria ambiental', 'Melhoria', 'Melhoria Contínua', 2, true, 24),
  ('10.2', 'Não Conformidade e Ação Corretiva', 'Reagir a não conformidades ambientais', 'Melhoria', 'Meio Ambiente', 3, true, 25),
  ('10.3', 'Melhoria Contínua', 'Melhorar continuamente desempenho ambiental', 'Melhoria', 'Melhoria Contínua', 2, true, 26),
  
  -- Gestão de Resíduos
  ('RES.1', 'Identificação e Classificação de Resíduos', 'Identificar e classificar resíduos gerados', 'Gestão de Resíduos', 'Meio Ambiente', 3, true, 27),
  ('RES.2', 'Armazenamento de Resíduos', 'Armazenar resíduos de forma adequada', 'Gestão de Resíduos', 'Operações', 3, true, 28),
  ('RES.3', 'Destinação de Resíduos', 'Destinar resíduos conforme legislação', 'Gestão de Resíduos', 'Meio Ambiente', 3, true, 29),
  ('RES.4', 'Redução de Resíduos', 'Implementar programa de redução de resíduos', 'Gestão de Resíduos', 'Meio Ambiente', 2, true, 30),
  
  -- Emissões e Efluentes
  ('EM.1', 'Monitoramento de Emissões Atmosféricas', 'Monitorar emissões de gases e material particulado', 'Emissões', 'Meio Ambiente', 3, true, 31),
  ('EM.2', 'Controle de Efluentes Líquidos', 'Tratar e monitorar efluentes líquidos', 'Emissões', 'Meio Ambiente', 3, true, 32),
  ('EM.3', 'Redução de Emissões de GEE', 'Implementar programa de redução de gases efeito estufa', 'Emissões', 'Meio Ambiente', 2, true, 33),
  
  -- Uso de Recursos
  ('REC.1', 'Gestão de Consumo de Energia', 'Monitorar e reduzir consumo de energia', 'Recursos', 'Meio Ambiente', 3, true, 34),
  ('REC.2', 'Gestão de Consumo de Água', 'Monitorar e reduzir consumo de água', 'Recursos', 'Meio Ambiente', 3, true, 35),
  ('REC.3', 'Uso de Materiais Sustentáveis', 'Priorizar uso de materiais sustentáveis', 'Recursos', 'Compras', 2, true, 36),
  
  -- Biodiversidade
  ('BIO.1', 'Avaliação de Impactos na Biodiversidade', 'Avaliar impactos em áreas de biodiversidade', 'Biodiversidade', 'Meio Ambiente', 2, true, 37),
  ('BIO.2', 'Proteção de Habitats', 'Implementar medidas de proteção de habitats', 'Biodiversidade', 'Meio Ambiente', 2, true, 38),
  
  -- Fornecedores e Terceiros
  ('FOR.1', 'Avaliação Ambiental de Fornecedores', 'Avaliar desempenho ambiental de fornecedores', 'Fornecedores', 'Compras', 3, true, 39),
  ('FOR.2', 'Requisitos Ambientais para Contratados', 'Estabelecer requisitos ambientais para terceiros', 'Fornecedores', 'Compras', 3, true, 40),
  
  -- Ciclo de Vida
  ('CV.1', 'Perspectiva de Ciclo de Vida', 'Considerar ciclo de vida em decisões ambientais', 'Ciclo de Vida', 'Meio Ambiente', 2, true, 41),
  ('CV.2', 'Design para Sustentabilidade', 'Incorporar critérios ambientais no design de produtos', 'Ciclo de Vida', 'Desenvolvimento', 2, true, 42),
  
  -- Prevenção de Poluição
  ('POL.1', 'Prevenção de Contaminação do Solo', 'Implementar medidas de prevenção de contaminação', 'Prevenção', 'Meio Ambiente', 3, true, 43),
  ('POL.2', 'Controle de Substâncias Perigosas', 'Gerenciar substâncias perigosas adequadamente', 'Prevenção', 'Meio Ambiente', 3, true, 44),
  ('POL.3', 'Plano de Contingência Ambiental', 'Estabelecer plano para acidentes ambientais', 'Prevenção', 'Segurança', 3, true, 45)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'ISO 14001:2015' AND f.versao = '2015';