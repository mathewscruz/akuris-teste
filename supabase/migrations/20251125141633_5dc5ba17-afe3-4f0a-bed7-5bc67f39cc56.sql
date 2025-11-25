-- Parte 3: ISO/IEC 20000-1:2018 (40 requisitos)
-- Framework: ISO/IEC 20000-1:2018

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
  ('4.1', 'Entendimento da Organização e seu Contexto', 'Determinar questões externas e internas relevantes ao propósito do SMS', 'Contexto da Organização', 'Governança', 3, true, 1),
  ('4.2', 'Entendimento das Necessidades das Partes Interessadas', 'Determinar partes interessadas relevantes ao SMS e seus requisitos', 'Contexto da Organização', 'Governança', 3, true, 2),
  ('4.3', 'Determinação do Escopo do SMS', 'Determinar limites e aplicabilidade do SMS', 'Contexto da Organização', 'Governança', 3, true, 3),
  ('4.4', 'Sistema de Gestão de Serviços', 'Estabelecer, implementar, manter e melhorar continuamente o SMS', 'Contexto da Organização', 'Gestão de Serviços', 3, true, 4),
  
  -- Liderança
  ('5.1', 'Liderança e Comprometimento', 'Demonstrar liderança e comprometimento em relação ao SMS', 'Liderança', 'Alta Direção', 3, true, 5),
  ('5.2', 'Política de Gestão de Serviços', 'Estabelecer política de gestão de serviços apropriada ao propósito', 'Liderança', 'Alta Direção', 3, true, 6),
  ('5.3', 'Papéis, Responsabilidades e Autoridades', 'Garantir que responsabilidades e autoridades sejam atribuídas e comunicadas', 'Liderança', 'Recursos Humanos', 3, true, 7),
  
  -- Planejamento
  ('6.1', 'Ações para Abordar Riscos e Oportunidades', 'Planejar ações para abordar riscos e oportunidades', 'Planejamento', 'Gestão de Riscos', 3, true, 8),
  ('6.2', 'Objetivos de Gestão de Serviços', 'Estabelecer objetivos de gestão de serviços em funções e níveis relevantes', 'Planejamento', 'Gestão de Serviços', 3, true, 9),
  ('6.3', 'Planejamento de Mudanças no SMS', 'Planejar mudanças no SMS de forma sistemática', 'Planejamento', 'Gestão de Mudanças', 3, true, 10),
  
  -- Suporte
  ('7.1', 'Recursos', 'Determinar e prover recursos necessários para SMS', 'Suporte', 'Recursos', 3, true, 11),
  ('7.2', 'Competência', 'Determinar competência necessária de pessoas que afetam o desempenho do SMS', 'Suporte', 'Recursos Humanos', 2, true, 12),
  ('7.3', 'Conscientização', 'Garantir que pessoas estejam conscientes da política e objetivos do SMS', 'Suporte', 'Recursos Humanos', 2, true, 13),
  ('7.4', 'Comunicação', 'Determinar necessidades de comunicação interna e externa relevantes ao SMS', 'Suporte', 'Comunicação', 2, true, 14),
  ('7.5', 'Informação Documentada', 'Incluir informação documentada requerida pela norma e necessária para eficácia', 'Suporte', 'Gestão Documental', 3, true, 15),
  
  -- Operação - Planejamento e Controle
  ('8.1', 'Planejamento e Controle Operacional', 'Planejar, implementar e controlar processos necessários para atender requisitos', 'Operação', 'Operações', 3, true, 16),
  ('8.2', 'Gestão de Portfólio de Serviços', 'Definir e manter informações sobre todos os serviços', 'Operação', 'Gestão de Serviços', 3, true, 17),
  ('8.3', 'Gestão de Relacionamento', 'Estabelecer e manter relacionamento entre provedor e cliente', 'Operação', 'Relacionamento', 3, true, 18),
  ('8.4', 'Gestão de Fornecedores', 'Gerenciar fornecedores e seus desempenhos', 'Operação', 'Fornecedores', 3, true, 19),
  ('8.5', 'Orçamento e Contabilização de Serviços', 'Orçar e contabilizar custos de fornecimento de serviços', 'Operação', 'Financeiro', 2, true, 20),
  ('8.6', 'Gestão de Capacidade', 'Garantir que capacidade de serviços atenda requisitos acordados', 'Operação', 'Capacidade', 3, true, 21),
  ('8.7', 'Gestão de Disponibilidade', 'Garantir que níveis de disponibilidade atendam objetivos acordados', 'Operação', 'Disponibilidade', 3, true, 22),
  ('8.8', 'Gestão de Continuidade de Serviços', 'Gerenciar riscos que poderiam impactar severamente serviços', 'Operação', 'Continuidade', 3, true, 23),
  ('8.9', 'Gestão de Segurança da Informação', 'Gerenciar segurança da informação efetivamente dentro de todos os serviços', 'Operação', 'Segurança da Informação', 3, true, 24),
  
  -- Processos de Resolução
  ('9.1', 'Gestão de Incidentes', 'Restaurar serviço o mais rápido possível após interrupção', 'Processos de Resolução', 'Service Desk', 3, true, 25),
  ('9.2', 'Gestão de Requisições de Serviço', 'Lidar com requisições de serviço de forma eficaz', 'Processos de Resolução', 'Service Desk', 3, true, 26),
  ('9.3', 'Gestão de Problemas', 'Reduzir impacto adverso de incidentes e problemas', 'Processos de Resolução', 'Service Desk', 3, true, 27),
  
  -- Processos de Controle
  ('10.1', 'Gestão de Configuração', 'Definir e controlar componentes de serviços e infraestrutura', 'Processos de Controle', 'Gestão de Configuração', 3, true, 28),
  ('10.2', 'Gestão de Mudança', 'Garantir que mudanças sejam avaliadas, aprovadas, implementadas e revisadas', 'Processos de Controle', 'Gestão de Mudanças', 3, true, 29),
  ('10.3', 'Gestão de Liberação e Implantação', 'Disponibilizar serviços novos e modificados para uso', 'Processos de Controle', 'Gestão de Liberação', 3, true, 30),
  
  -- Avaliação de Desempenho
  ('11.1', 'Monitoramento e Medição', 'Determinar o que precisa ser monitorado e medido', 'Avaliação de Desempenho', 'Métricas', 3, true, 31),
  ('11.2', 'Análise e Avaliação', 'Analisar e avaliar dados e informações de monitoramento e medição', 'Avaliação de Desempenho', 'Análise', 3, true, 32),
  ('11.3', 'Auditoria Interna', 'Conduzir auditorias internas em intervalos planejados', 'Avaliação de Desempenho', 'Auditoria Interna', 3, true, 33),
  ('11.4', 'Análise Crítica pela Direção', 'Alta direção deve analisar criticamente SMS em intervalos planejados', 'Avaliação de Desempenho', 'Alta Direção', 3, true, 34),
  
  -- Melhoria
  ('12.1', 'Não Conformidade e Ação Corretiva', 'Reagir a não conformidade e tomar ações para controlar e corrigir', 'Melhoria', 'Qualidade', 3, true, 35),
  ('12.2', 'Melhoria Contínua', 'Melhorar continuamente adequação, suficiência e eficácia do SMS', 'Melhoria', 'Melhoria Contínua', 3, true, 36),
  
  -- Processos Adicionais de Serviço
  ('13.1', 'Design de Serviços Novos ou Modificados', 'Projetar serviços que atendam requisitos de negócio atuais e futuros', 'Novos Serviços', 'Design de Serviços', 3, true, 37),
  ('13.2', 'Transição de Serviços Novos ou Modificados', 'Estabelecer serviços novos ou modificados em ambientes suportados', 'Novos Serviços', 'Transição', 3, true, 38),
  ('13.3', 'Validação e Teste de Serviço', 'Garantir que liberações criarão serviços que atendam requisitos', 'Novos Serviços', 'Qualidade', 3, true, 39),
  ('13.4', 'Gestão de Ativos de Serviço', 'Contabilizar e reportar ativos de serviço e componentes de configuração', 'Novos Serviços', 'Gestão de Ativos', 3, true, 40)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'ISO/IEC 20000-1:2018' AND f.versao = '2018';