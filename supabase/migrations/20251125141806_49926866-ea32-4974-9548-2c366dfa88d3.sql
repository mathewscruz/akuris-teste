-- Parte 4: ISO 37301:2021 (40 requisitos)
-- Framework: ISO 37301:2021

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
  ('4.1', 'Entender a Organização e seu Contexto', 'Determinar questões externas e internas relevantes ao sistema de gestão de compliance', 'Contexto da Organização', 'Compliance', 3, true, 1),
  ('4.2', 'Entender Necessidades das Partes Interessadas', 'Determinar partes interessadas e seus requisitos de compliance', 'Contexto da Organização', 'Compliance', 3, true, 2),
  ('4.3', 'Determinar Escopo do Sistema de Gestão', 'Estabelecer limites e aplicabilidade do sistema de gestão de compliance', 'Contexto da Organização', 'Compliance', 3, true, 3),
  ('4.4', 'Sistema de Gestão de Compliance', 'Estabelecer, implementar, manter e melhorar continuamente o sistema', 'Contexto da Organização', 'Compliance', 3, true, 4),
  
  -- Liderança
  ('5.1', 'Liderança e Comprometimento', 'Alta direção deve demonstrar liderança e comprometimento', 'Liderança', 'Alta Direção', 3, true, 5),
  ('5.2', 'Governança de Compliance', 'Estabelecer, implementar e manter função de compliance', 'Liderança', 'Compliance', 3, true, 6),
  ('5.3', 'Política de Compliance', 'Estabelecer política de compliance apropriada', 'Liderança', 'Compliance', 3, true, 7),
  ('5.4', 'Papéis, Responsabilidades e Autoridades', 'Atribuir e comunicar responsabilidades e autoridades', 'Liderança', 'Recursos Humanos', 3, true, 8),
  
  -- Planejamento
  ('6.1', 'Ações para Abordar Riscos de Compliance', 'Identificar e avaliar riscos e oportunidades de compliance', 'Planejamento', 'Gestão de Riscos', 3, true, 9),
  ('6.2', 'Objetivos de Compliance', 'Estabelecer objetivos de compliance mensuráveis', 'Planejamento', 'Compliance', 3, true, 10),
  ('6.3', 'Planejamento de Mudanças', 'Planejar mudanças no sistema de gestão de compliance', 'Planejamento', 'Gestão de Mudanças', 2, true, 11),
  
  -- Suporte
  ('7.1', 'Recursos', 'Determinar e prover recursos necessários', 'Suporte', 'Recursos', 3, true, 12),
  ('7.2', 'Competência', 'Determinar competências necessárias', 'Suporte', 'Recursos Humanos', 2, true, 13),
  ('7.3', 'Conscientização', 'Garantir conscientização sobre política e obrigações de compliance', 'Suporte', 'Treinamento', 2, true, 14),
  ('7.4', 'Comunicação', 'Estabelecer comunicações internas e externas', 'Suporte', 'Comunicação', 2, true, 15),
  ('7.5', 'Informação Documentada', 'Manter informação documentada requerida', 'Suporte', 'Gestão Documental', 3, true, 16),
  
  -- Operação
  ('8.1', 'Planejamento e Controle Operacional', 'Planejar, implementar e controlar processos de compliance', 'Operação', 'Compliance', 3, true, 17),
  ('8.2', 'Identificar Obrigações de Compliance', 'Estabelecer, implementar e manter processo para identificar obrigações', 'Operação', 'Compliance', 3, true, 18),
  ('8.3', 'Determinar e Autorizar Controles', 'Estabelecer controles para abordar obrigações de compliance', 'Operação', 'Compliance', 3, true, 19),
  ('8.4', 'Estabelecer Objetivos de Controles', 'Estabelecer objetivos mensuráveis para controles', 'Operação', 'Compliance', 3, true, 20),
  ('8.5', 'Implementar Controles', 'Implementar e manter controles estabelecidos', 'Operação', 'Compliance', 3, true, 21),
  ('8.6', 'Gestão de Eventos de Compliance', 'Estabelecer processo para identificar e gerenciar eventos', 'Operação', 'Compliance', 3, true, 22),
  ('8.7', 'Investigações e Tratamento de Não Conformidades', 'Investigar eventos e determinar ações', 'Operação', 'Auditoria Interna', 3, true, 23),
  ('8.8', 'Due Diligence de Terceiros', 'Estabelecer processo de due diligence para terceiros', 'Operação', 'Due Diligence', 3, true, 24),
  ('8.9', 'Levantar Preocupações', 'Estabelecer processo para relatar preocupações de compliance', 'Operação', 'Canal de Denúncias', 3, true, 25),
  ('8.10', 'Investigações e Resposta a Preocupações', 'Investigar preocupações relatadas de forma apropriada', 'Operação', 'Auditoria Interna', 3, true, 26),
  ('8.11', 'Tratamento de Não Conformidades com Obrigações', 'Estabelecer processo para tratar não conformidades', 'Operação', 'Compliance', 3, true, 27),
  ('8.12', 'Análises de Compliance pela Direção', 'Fornecer informações para análises pela direção', 'Operação', 'Compliance', 3, true, 28),
  
  -- Avaliação de Desempenho
  ('9.1', 'Monitoramento, Medição, Análise e Avaliação', 'Determinar o que precisa ser monitorado e medido', 'Avaliação de Desempenho', 'Métricas', 3, true, 29),
  ('9.2', 'Auditoria Interna', 'Conduzir auditorias internas em intervalos planejados', 'Avaliação de Desempenho', 'Auditoria Interna', 3, true, 30),
  ('9.3', 'Análise Crítica pela Direção', 'Alta direção deve analisar criticamente o sistema', 'Avaliação de Desempenho', 'Alta Direção', 3, true, 31),
  
  -- Melhoria
  ('10.1', 'Não Conformidade e Ação Corretiva', 'Reagir a não conformidades e tomar ações corretivas', 'Melhoria', 'Qualidade', 3, true, 32),
  ('10.2', 'Melhoria Contínua', 'Melhorar continuamente adequação e eficácia do sistema', 'Melhoria', 'Melhoria Contínua', 2, true, 33),
  
  -- Requisitos Adicionais
  ('A.1', 'Cultura de Compliance', 'Promover cultura organizacional de compliance', 'Requisitos Adicionais', 'Cultura Organizacional', 3, true, 34),
  ('A.2', 'Treinamento e Desenvolvimento', 'Fornecer treinamento apropriado e regular', 'Requisitos Adicionais', 'Treinamento', 3, true, 35),
  ('A.3', 'Proteção de Denunciantes', 'Estabelecer proteção para quem relata preocupações', 'Requisitos Adicionais', 'Canal de Denúncias', 3, true, 36),
  ('A.4', 'Gestão de Conflitos de Interesse', 'Identificar e gerenciar conflitos de interesse', 'Requisitos Adicionais', 'Ética', 3, true, 37),
  ('A.5', 'Brindes e Hospitalidade', 'Estabelecer controles para brindes e hospitalidade', 'Requisitos Adicionais', 'Ética', 2, true, 38),
  ('A.6', 'Contribuições Políticas', 'Controlar contribuições políticas e lobbying', 'Requisitos Adicionais', 'Ética', 2, true, 39),
  ('A.7', 'Gestão de Registros de Compliance', 'Manter registros apropriados de compliance', 'Requisitos Adicionais', 'Gestão Documental', 3, true, 40)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'ISO 37301:2021' AND f.versao = '2021';