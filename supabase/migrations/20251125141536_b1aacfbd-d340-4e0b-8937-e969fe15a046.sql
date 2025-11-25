-- Parte 3: COBIT 2019 (40 objetivos)
-- Framework: COBIT 2019

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
  -- EDM (Avaliar, Dirigir e Monitorar)
  ('EDM01', 'Assegurar a Definição e Manutenção do Framework de Governança', 'Esclarecer e manter a missão, visão, valores e princípios da governança', 'EDM - Avaliar, Dirigir e Monitorar', 'Governança Corporativa', 3, true, 1),
  ('EDM02', 'Assegurar a Entrega de Benefícios', 'Otimizar a contribuição de valor das partes interessadas', 'EDM - Avaliar, Dirigir e Monitorar', 'Governança Corporativa', 3, true, 2),
  ('EDM03', 'Assegurar a Otimização de Riscos', 'Garantir que o apetite e tolerância a riscos da empresa sejam compreendidos', 'EDM - Avaliar, Dirigir e Monitorar', 'Gestão de Riscos', 3, true, 3),
  ('EDM04', 'Assegurar a Otimização de Recursos', 'Garantir que capacidades adequadas e suficientes estejam disponíveis', 'EDM - Avaliar, Dirigir e Monitorar', 'Gestão de Recursos', 3, true, 4),
  ('EDM05', 'Assegurar o Engajamento das Partes Interessadas', 'Garantir engajamento efetivo e transparente com stakeholders', 'EDM - Avaliar, Dirigir e Monitorar', 'Governança Corporativa', 3, true, 5),
  
  -- APO (Alinhar, Planejar e Organizar)
  ('APO01', 'Gerenciar o Framework de Gestão de TI', 'Esclarecer e manter a missão da função de TI', 'APO - Alinhar, Planejar e Organizar', 'TI', 3, true, 6),
  ('APO02', 'Gerenciar a Estratégia', 'Fornecer visão holística do ambiente de negócio atual', 'APO - Alinhar, Planejar e Organizar', 'Estratégia', 3, true, 7),
  ('APO03', 'Gerenciar a Arquitetura Empresarial', 'Estabelecer arquitetura comum composta por processos de negócio, informação, dados, aplicações e tecnologia', 'APO - Alinhar, Planejar e Organizar', 'Arquitetura Empresarial', 3, true, 8),
  ('APO04', 'Gerenciar a Inovação', 'Manter consciência das tendências de TI e negócios', 'APO - Alinhar, Planejar e Organizar', 'Inovação', 2, true, 9),
  ('APO05', 'Gerenciar o Portfólio', 'Executar direção estratégica definida para investimento em TI', 'APO - Alinhar, Planejar e Organizar', 'Gestão de Portfólio', 3, true, 10),
  ('APO06', 'Gerenciar o Orçamento e os Custos', 'Gerenciar atividades financeiras relacionadas a TI', 'APO - Alinhar, Planejar e Organizar', 'Financeiro', 3, true, 11),
  ('APO07', 'Gerenciar os Recursos Humanos', 'Fornecer abordagem estruturada para garantir otimização das capacidades dos recursos humanos', 'APO - Alinhar, Planejar e Organizar', 'Recursos Humanos', 2, true, 12),
  ('APO08', 'Gerenciar os Relacionamentos', 'Gerenciar relacionamento entre o negócio e TI de forma formalizada e transparente', 'APO - Alinhar, Planejar e Organizar', 'Relacionamento', 2, true, 13),
  ('APO09', 'Gerenciar os Acordos de Serviço', 'Alinhar serviços habilitados por TI e níveis de serviço com necessidades da empresa', 'APO - Alinhar, Planejar e Organizar', 'Gestão de Serviços', 3, true, 14),
  ('APO10', 'Gerenciar os Fornecedores', 'Gerenciar serviços de TI fornecidos por todos os tipos de fornecedores', 'APO - Alinhar, Planejar e Organizar', 'Fornecedores', 3, true, 15),
  ('APO11', 'Gerenciar a Qualidade', 'Definir e comunicar requisitos de qualidade em todos os processos', 'APO - Alinhar, Planejar e Organizar', 'Qualidade', 2, true, 16),
  ('APO12', 'Gerenciar os Riscos', 'Identificar, avaliar e reduzir riscos relacionados a TI continuamente', 'APO - Alinhar, Planejar e Organizar', 'Gestão de Riscos', 3, true, 17),
  ('APO13', 'Gerenciar a Segurança', 'Definir, operar e monitorar sistema de gestão de segurança da informação', 'APO - Alinhar, Planejar e Organizar', 'Segurança da Informação', 3, true, 18),
  ('APO14', 'Gerenciar os Dados', 'Gerenciar dados como ativo corporativo valioso', 'APO - Alinhar, Planejar e Organizar', 'Gestão de Dados', 3, true, 19),
  
  -- BAI (Construir, Adquirir e Implementar)
  ('BAI01', 'Gerenciar Programas', 'Gerenciar todos os programas de investimento requeridos para alcançar objetivos estratégicos', 'BAI - Construir, Adquirir e Implementar', 'Gestão de Projetos', 3, true, 20),
  ('BAI02', 'Gerenciar a Definição de Requisitos', 'Identificar soluções e analisar requisitos antes da aquisição ou criação', 'BAI - Construir, Adquirir e Implementar', 'Análise de Negócios', 3, true, 21),
  ('BAI03', 'Gerenciar a Identificação e Construção de Soluções', 'Estabelecer e manter soluções identificadas em linha com requisitos da empresa', 'BAI - Construir, Adquirir e Implementar', 'Desenvolvimento', 3, true, 22),
  ('BAI04', 'Gerenciar a Disponibilidade e Capacidade', 'Equilibrar necessidades atuais e futuras de disponibilidade, performance e capacidade', 'BAI - Construir, Adquirir e Implementar', 'Infraestrutura', 3, true, 23),
  ('BAI05', 'Gerenciar a Mudança Organizacional', 'Maximizar probabilidade de implementação bem-sucedida de mudanças empresariais', 'BAI - Construir, Adquirir e Implementar', 'Gestão de Mudanças', 2, true, 24),
  ('BAI06', 'Gerenciar Mudanças em TI', 'Gerenciar todas as mudanças de maneira controlada', 'BAI - Construir, Adquirir e Implementar', 'Gestão de Mudanças TI', 3, true, 25),
  ('BAI07', 'Gerenciar a Aceitação da Mudança e Transição', 'Aceitar formalmente e tornar operacionais novas soluções', 'BAI - Construir, Adquirir e Implementar', 'Gestão de Mudanças', 3, true, 26),
  ('BAI08', 'Gerenciar o Conhecimento', 'Fornecer, compartilhar, usar e reter conhecimento', 'BAI - Construir, Adquirir e Implementar', 'Gestão do Conhecimento', 2, true, 27),
  ('BAI09', 'Gerenciar os Ativos', 'Gerenciar ativos de TI através do ciclo de vida', 'BAI - Construir, Adquirir e Implementar', 'Gestão de Ativos', 3, true, 28),
  ('BAI10', 'Gerenciar a Configuração', 'Definir e manter descrições e relacionamentos entre recursos e capacidades-chave', 'BAI - Construir, Adquirir e Implementar', 'Gestão de Configuração', 3, true, 29),
  ('BAI11', 'Gerenciar Projetos', 'Gerenciar todas as atividades de projeto', 'BAI - Construir, Adquirir e Implementar', 'Gestão de Projetos', 3, true, 30),
  
  -- DSS (Entregar, Servir e Suportar)
  ('DSS01', 'Gerenciar Operações', 'Coordenar e executar atividades e procedimentos operacionais para entregar serviços', 'DSS - Entregar, Servir e Suportar', 'Operações TI', 3, true, 31),
  ('DSS02', 'Gerenciar Requisições e Incidentes de Serviço', 'Fornecer resposta oportuna e efetiva a requisições de usuário e resolução de incidentes', 'DSS - Entregar, Servir e Suportar', 'Service Desk', 3, true, 32),
  ('DSS03', 'Gerenciar Problemas', 'Identificar e classificar problemas e suas causas raízes', 'DSS - Entregar, Servir e Suportar', 'Service Desk', 3, true, 33),
  ('DSS04', 'Gerenciar a Continuidade', 'Estabelecer e manter plano para habilitar o negócio e TI a responder a incidentes', 'DSS - Entregar, Servir e Suportar', 'Continuidade de Negócios', 3, true, 34),
  ('DSS05', 'Gerenciar Serviços de Segurança', 'Proteger informações da empresa para manter nível de risco aceitável', 'DSS - Entregar, Servir e Suportar', 'Segurança da Informação', 3, true, 35),
  ('DSS06', 'Gerenciar Controles de Processos de Negócio', 'Definir e manter controles de processos de negócio apropriados', 'DSS - Entregar, Servir e Suportar', 'Controles Internos', 3, true, 36),
  
  -- MEA (Monitorar, Avaliar e Medir)
  ('MEA01', 'Monitorar, Avaliar e Medir o Desempenho e a Conformidade', 'Coletar, validar e avaliar metas de negócio, TI e objetivos de processos', 'MEA - Monitorar, Avaliar e Medir', 'Auditoria e Compliance', 3, true, 37),
  ('MEA02', 'Monitorar, Avaliar e Medir o Sistema de Controles Internos', 'Monitorar e avaliar continuamente ambiente de controle', 'MEA - Monitorar, Avaliar e Medir', 'Auditoria Interna', 3, true, 38),
  ('MEA03', 'Monitorar, Avaliar e Medir a Conformidade com Requisitos Externos', 'Avaliar se processos e práticas de TI estão em conformidade com leis e regulamentações', 'MEA - Monitorar, Avaliar e Medir', 'Compliance', 3, true, 39),
  ('MEA04', 'Gerenciar a Garantia', 'Planejar, buscar e gerenciar garantia independente de conformidade e assurance', 'MEA - Monitorar, Avaliar e Medir', 'Auditoria', 2, true, 40)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'COBIT 2019' AND f.versao = '2019';