-- Parte 5: ISO 9001:2015 (50 requisitos)
-- Framework: ISO 9001:2015

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
  ('4.1', 'Entendendo a Organização e seu Contexto', 'Determinar questões externas e internas relevantes', 'Contexto da Organização', 'Qualidade', 3, true, 1),
  ('4.2', 'Entendendo Necessidades das Partes Interessadas', 'Determinar partes interessadas e seus requisitos', 'Contexto da Organização', 'Qualidade', 3, true, 2),
  ('4.3', 'Determinando Escopo do SGQ', 'Determinar limites e aplicabilidade do sistema de gestão', 'Contexto da Organização', 'Qualidade', 3, true, 3),
  ('4.4', 'Sistema de Gestão da Qualidade', 'Estabelecer, implementar, manter e melhorar continuamente SGQ', 'Contexto da Organização', 'Qualidade', 3, true, 4),
  
  -- Liderança
  ('5.1', 'Liderança e Comprometimento', 'Alta direção deve demonstrar liderança e comprometimento', 'Liderança', 'Alta Direção', 3, true, 5),
  ('5.2', 'Política da Qualidade', 'Estabelecer, implementar e manter política da qualidade', 'Liderança', 'Qualidade', 3, true, 6),
  ('5.3', 'Papéis, Responsabilidades e Autoridades', 'Atribuir responsabilidades e autoridades relevantes', 'Liderança', 'Recursos Humanos', 2, true, 7),
  
  -- Planejamento
  ('6.1', 'Ações para Abordar Riscos e Oportunidades', 'Determinar riscos e oportunidades que precisam ser abordados', 'Planejamento', 'Gestão de Riscos', 3, true, 8),
  ('6.2', 'Objetivos da Qualidade', 'Estabelecer objetivos da qualidade mensuráveis', 'Planejamento', 'Qualidade', 3, true, 9),
  ('6.3', 'Planejamento de Mudanças', 'Planejar mudanças no SGQ de forma sistemática', 'Planejamento', 'Gestão de Mudanças', 2, true, 10),
  
  -- Suporte
  ('7.1.1', 'Recursos - Generalidades', 'Determinar e prover recursos necessários', 'Suporte', 'Recursos', 3, true, 11),
  ('7.1.2', 'Pessoas', 'Determinar e prover pessoas necessárias', 'Suporte', 'Recursos Humanos', 3, true, 12),
  ('7.1.3', 'Infraestrutura', 'Determinar, prover e manter infraestrutura', 'Suporte', 'Infraestrutura', 3, true, 13),
  ('7.1.4', 'Ambiente para Operação dos Processos', 'Determinar e prover ambiente adequado', 'Suporte', 'Operações', 2, true, 14),
  ('7.1.5', 'Recursos de Monitoramento e Medição', 'Determinar e prover recursos para monitoramento', 'Suporte', 'Métricas', 3, true, 15),
  ('7.1.6', 'Conhecimento Organizacional', 'Determinar conhecimento necessário para operações', 'Suporte', 'Gestão do Conhecimento', 2, true, 16),
  ('7.2', 'Competência', 'Determinar competências necessárias de pessoas', 'Suporte', 'Recursos Humanos', 2, true, 17),
  ('7.3', 'Conscientização', 'Garantir conscientização sobre política e objetivos', 'Suporte', 'Treinamento', 2, true, 18),
  ('7.4', 'Comunicação', 'Determinar comunicações internas e externas', 'Suporte', 'Comunicação', 2, true, 19),
  ('7.5', 'Informação Documentada', 'Incluir informação documentada requerida', 'Suporte', 'Gestão Documental', 3, true, 20),
  
  -- Operação
  ('8.1', 'Planejamento e Controle Operacional', 'Planejar, implementar e controlar processos', 'Operação', 'Operações', 3, true, 21),
  ('8.2.1', 'Comunicação com o Cliente', 'Comunicar com clientes sobre produtos e serviços', 'Operação', 'Relacionamento', 3, true, 22),
  ('8.2.2', 'Determinação de Requisitos', 'Determinar requisitos relacionados a produtos e serviços', 'Operação', 'Qualidade', 3, true, 23),
  ('8.2.3', 'Análise Crítica de Requisitos', 'Analisar criticamente requisitos antes de comprometer-se', 'Operação', 'Qualidade', 3, true, 24),
  ('8.2.4', 'Mudanças nos Requisitos', 'Garantir que alterações sejam comunicadas', 'Operação', 'Gestão de Mudanças', 3, true, 25),
  ('8.3.1', 'Projeto e Desenvolvimento - Generalidades', 'Estabelecer processo de projeto e desenvolvimento', 'Operação', 'Desenvolvimento', 3, true, 26),
  ('8.3.2', 'Planejamento de Projeto e Desenvolvimento', 'Planejar estágios e controles de projeto', 'Operação', 'Desenvolvimento', 3, true, 27),
  ('8.3.3', 'Entradas de Projeto e Desenvolvimento', 'Determinar requisitos essenciais para projeto', 'Operação', 'Desenvolvimento', 3, true, 28),
  ('8.3.4', 'Controles de Projeto e Desenvolvimento', 'Aplicar controles ao processo de projeto', 'Operação', 'Desenvolvimento', 3, true, 29),
  ('8.3.5', 'Saídas de Projeto e Desenvolvimento', 'Garantir que saídas atendam requisitos de entrada', 'Operação', 'Desenvolvimento', 3, true, 30),
  ('8.3.6', 'Mudanças de Projeto e Desenvolvimento', 'Identificar e controlar mudanças', 'Operação', 'Gestão de Mudanças', 3, true, 31),
  ('8.4.1', 'Controle de Provedores Externos', 'Garantir conformidade de processos externos', 'Operação', 'Fornecedores', 3, true, 32),
  ('8.4.2', 'Tipo e Extensão do Controle', 'Determinar controles sobre provedores externos', 'Operação', 'Fornecedores', 3, true, 33),
  ('8.4.3', 'Informação para Provedores Externos', 'Comunicar requisitos a provedores', 'Operação', 'Fornecedores', 2, true, 34),
  ('8.5.1', 'Controle de Produção e Provisão de Serviço', 'Implementar produção sob condições controladas', 'Operação', 'Produção', 3, true, 35),
  ('8.5.2', 'Identificação e Rastreabilidade', 'Identificar saídas quando necessário', 'Operação', 'Produção', 3, true, 36),
  ('8.5.3', 'Propriedade do Cliente', 'Cuidar de propriedade do cliente', 'Operação', 'Operações', 2, true, 37),
  ('8.5.4', 'Preservação', 'Preservar saídas durante processamento', 'Operação', 'Operações', 2, true, 38),
  ('8.5.5', 'Atividades Pós-Entrega', 'Atender requisitos de atividades pós-entrega', 'Operação', 'Suporte ao Cliente', 2, true, 39),
  ('8.5.6', 'Controle de Mudanças', 'Analisar e controlar mudanças na produção', 'Operação', 'Gestão de Mudanças', 3, true, 40),
  ('8.6', 'Liberação de Produtos e Serviços', 'Implementar arranjos para verificar conformidade', 'Operação', 'Qualidade', 3, true, 41),
  ('8.7', 'Controle de Saídas Não Conformes', 'Garantir que saídas não conformes sejam identificadas e controladas', 'Operação', 'Qualidade', 3, true, 42),
  
  -- Avaliação de Desempenho
  ('9.1', 'Monitoramento, Medição, Análise e Avaliação', 'Determinar o que precisa ser monitorado', 'Avaliação de Desempenho', 'Métricas', 3, true, 43),
  ('9.2', 'Auditoria Interna', 'Conduzir auditorias internas em intervalos planejados', 'Avaliação de Desempenho', 'Auditoria Interna', 3, true, 44),
  ('9.3', 'Análise Crítica pela Direção', 'Alta direção deve analisar criticamente SGQ', 'Avaliação de Desempenho', 'Alta Direção', 3, true, 45),
  
  -- Melhoria
  ('10.1', 'Generalidades da Melhoria', 'Determinar e selecionar oportunidades de melhoria', 'Melhoria', 'Melhoria Contínua', 2, true, 46),
  ('10.2', 'Não Conformidade e Ação Corretiva', 'Reagir a não conformidades e tomar ações', 'Melhoria', 'Qualidade', 3, true, 47),
  ('10.3', 'Melhoria Contínua', 'Melhorar continuamente adequação e eficácia do SGQ', 'Melhoria', 'Melhoria Contínua', 2, true, 48),
  
  -- Satisfação do Cliente
  ('SC.1', 'Satisfação do Cliente', 'Monitorar percepção do cliente sobre satisfação', 'Satisfação do Cliente', 'Relacionamento', 3, true, 49),
  ('SC.2', 'Análise de Dados de Satisfação', 'Analisar dados de satisfação do cliente', 'Satisfação do Cliente', 'Análise', 3, true, 50)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'ISO 9001:2015' AND f.versao = '2015';