-- Parte 3: ITIL v4 (34 práticas)
-- Framework: ITIL v4

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
  -- Práticas Gerais de Gestão
  ('GMP01', 'Gestão de Arquitetura', 'Fornecer compreensão de todos os elementos que compõem a organização', 'Práticas Gerais de Gestão', 'Arquitetura Empresarial', 3, true, 1),
  ('GMP02', 'Melhoria Contínua', 'Alinhar práticas e serviços da organização com necessidades de negócio em mudança', 'Práticas Gerais de Gestão', 'Melhoria Contínua', 3, true, 2),
  ('GMP03', 'Gestão de Segurança da Informação', 'Proteger informações necessárias para conduzir os negócios', 'Práticas Gerais de Gestão', 'Segurança da Informação', 3, true, 3),
  ('GMP04', 'Gestão do Conhecimento', 'Manter e melhorar uso efetivo, eficiente e conveniente de informação e conhecimento', 'Práticas Gerais de Gestão', 'Gestão do Conhecimento', 2, true, 4),
  ('GMP05', 'Medição e Reporte', 'Apoiar boa tomada de decisão e melhoria contínua', 'Práticas Gerais de Gestão', 'Métricas e KPIs', 3, true, 5),
  ('GMP06', 'Gestão de Mudança Organizacional', 'Garantir que mudanças na organização sejam implementadas de forma suave e bem-sucedida', 'Práticas Gerais de Gestão', 'Gestão de Mudanças', 2, true, 6),
  ('GMP07', 'Gestão de Portfólio', 'Garantir que a organização tenha mix certo de programas, projetos, produtos e serviços', 'Práticas Gerais de Gestão', 'Gestão de Portfólio', 3, true, 7),
  ('GMP08', 'Gestão de Projetos', 'Garantir que todos os projetos da organização sejam entregues com sucesso', 'Práticas Gerais de Gestão', 'Gestão de Projetos', 3, true, 8),
  ('GMP09', 'Gestão de Relacionamento', 'Estabelecer e nutrir vínculos entre organização e suas partes interessadas', 'Práticas Gerais de Gestão', 'Relacionamento', 2, true, 9),
  ('GMP10', 'Gestão de Riscos', 'Garantir que a organização entenda e lide efetivamente com riscos', 'Práticas Gerais de Gestão', 'Gestão de Riscos', 3, true, 10),
  ('GMP11', 'Gestão Financeira de Serviços', 'Apoiar estratégias e planos da organização para gestão de serviços', 'Práticas Gerais de Gestão', 'Financeiro', 3, true, 11),
  ('GMP12', 'Gestão de Estratégia', 'Formular objetivos da organização e adotar cursos de ação', 'Práticas Gerais de Gestão', 'Estratégia', 3, true, 12),
  ('GMP13', 'Gestão de Fornecedores', 'Garantir que fornecedores da organização e seus desempenhos sejam gerenciados apropriadamente', 'Práticas Gerais de Gestão', 'Fornecedores', 3, true, 13),
  ('GMP14', 'Gestão de Força de Trabalho e Talentos', 'Garantir que a organização tenha pessoas certas com habilidades e conhecimentos apropriados', 'Práticas Gerais de Gestão', 'Recursos Humanos', 2, true, 14),
  
  -- Práticas de Gestão de Serviços
  ('SMP01', 'Gestão de Disponibilidade', 'Garantir que serviços entreguem níveis acordados de disponibilidade', 'Práticas de Gestão de Serviços', 'Gestão de Serviços', 3, true, 15),
  ('SMP02', 'Análise de Negócio', 'Analisar um negócio ou algum elemento dele', 'Práticas de Gestão de Serviços', 'Análise de Negócios', 2, true, 16),
  ('SMP03', 'Gestão de Capacidade e Desempenho', 'Garantir que serviços alcancem níveis acordados e esperados de desempenho', 'Práticas de Gestão de Serviços', 'Capacidade', 3, true, 17),
  ('SMP04', 'Habilitação de Mudança', 'Maximizar número de mudanças bem-sucedidas de serviços e produtos', 'Práticas de Gestão de Serviços', 'Gestão de Mudanças', 3, true, 18),
  ('SMP05', 'Gestão de Incidentes', 'Minimizar impacto negativo de incidentes restaurando operação normal do serviço rapidamente', 'Práticas de Gestão de Serviços', 'Service Desk', 3, true, 19),
  ('SMP06', 'Gestão de Ativos de TI', 'Planejar e gerenciar ciclo de vida completo de todos os ativos de TI', 'Práticas de Gestão de Serviços', 'Gestão de Ativos', 3, true, 20),
  ('SMP07', 'Monitoramento e Gestão de Eventos', 'Observar sistematicamente serviços e componentes e registrar e reportar mudanças de estado', 'Práticas de Gestão de Serviços', 'Monitoramento', 3, true, 21),
  ('SMP08', 'Gestão de Problemas', 'Reduzir probabilidade e impacto de incidentes identificando causas reais e potenciais', 'Práticas de Gestão de Serviços', 'Service Desk', 3, true, 22),
  ('SMP09', 'Gestão de Liberação', 'Tornar serviços e recursos novos e alterados disponíveis para uso', 'Práticas de Gestão de Serviços', 'Gestão de Liberação', 3, true, 23),
  ('SMP10', 'Gestão de Catálogo de Serviços', 'Fornecer fonte única de informações consistentes sobre todos os serviços', 'Práticas de Gestão de Serviços', 'Gestão de Serviços', 2, true, 24),
  ('SMP11', 'Gestão de Configuração de Serviços', 'Garantir que informações precisas e confiáveis sobre configuração de serviços estejam disponíveis', 'Práticas de Gestão de Serviços', 'Gestão de Configuração', 3, true, 25),
  ('SMP12', 'Gestão de Continuidade de Serviços', 'Garantir que disponibilidade e desempenho de serviço sejam mantidos em desastre', 'Práticas de Gestão de Serviços', 'Continuidade', 3, true, 26),
  ('SMP13', 'Design de Serviços', 'Projetar produtos e serviços adequados ao propósito e uso', 'Práticas de Gestão de Serviços', 'Design de Serviços', 3, true, 27),
  ('SMP14', 'Service Desk', 'Capturar demanda de resolução de incidentes e requisições de serviço', 'Práticas de Gestão de Serviços', 'Service Desk', 3, true, 28),
  ('SMP15', 'Gestão de Nível de Serviço', 'Definir metas claras baseadas em negócio para desempenho de serviço', 'Práticas de Gestão de Serviços', 'Gestão de Serviços', 3, true, 29),
  ('SMP16', 'Requisição de Serviço', 'Apoiar qualidade acordada de serviço lidando com requisições de usuário predefinidas', 'Práticas de Gestão de Serviços', 'Service Desk', 3, true, 30),
  ('SMP17', 'Validação e Teste de Serviços', 'Garantir que produtos e serviços novos ou alterados atendam requisitos definidos', 'Práticas de Gestão de Serviços', 'Qualidade', 3, true, 31),
  
  -- Práticas de Gestão Técnica
  ('TMP01', 'Gestão de Implantação', 'Mover hardware, software, documentação, processos ou qualquer outro componente para ambientes', 'Práticas de Gestão Técnica', 'Infraestrutura', 3, true, 32),
  ('TMP02', 'Gestão de Infraestrutura e Plataforma', 'Supervisionar infraestrutura e plataformas usadas pela organização', 'Práticas de Gestão Técnica', 'Infraestrutura', 3, true, 33),
  ('TMP03', 'Desenvolvimento e Gestão de Software', 'Garantir que aplicações atendam necessidades das partes interessadas', 'Práticas de Gestão Técnica', 'Desenvolvimento', 3, true, 34)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'ITIL v4' AND f.versao = 'v4';