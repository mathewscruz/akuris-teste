-- Parte 4: SOX (Sarbanes-Oxley 2002) (30 requisitos)
-- Framework: SOX 2002

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
  -- Seção 302: Responsabilidade Corporativa por Relatórios Financeiros
  ('302.1', 'Certificação do CEO e CFO', 'CEO e CFO devem certificar demonstrações financeiras', 'Seção 302 - Certificações', 'Alta Direção', 3, true, 1),
  ('302.2', 'Responsabilidade pelas Demonstrações', 'Executivos são responsáveis por estabelecer controles internos', 'Seção 302 - Certificações', 'Alta Direção', 3, true, 2),
  ('302.3', 'Avaliação de Controles Internos', 'Avaliar eficácia dos controles internos nos últimos 90 dias', 'Seção 302 - Certificações', 'Auditoria Interna', 3, true, 3),
  ('302.4', 'Divulgação de Deficiências', 'Divulgar deficiências materiais e fraudes aos auditores', 'Seção 302 - Certificações', 'Auditoria', 3, true, 4),
  ('302.5', 'Divulgação de Mudanças', 'Indicar mudanças nos controles internos após avaliação', 'Seção 302 - Certificações', 'Controles Internos', 3, true, 5),
  
  -- Seção 404: Avaliação de Controles Internos
  ('404.1', 'Relatório de Controles Internos da Gestão', 'Relatório anual deve incluir avaliação de controles internos', 'Seção 404 - Controles Internos', 'Controles Internos', 3, true, 6),
  ('404.2', 'Responsabilidade pela Estrutura de Controles', 'Gestão é responsável por estabelecer estrutura adequada', 'Seção 404 - Controles Internos', 'Controles Internos', 3, true, 7),
  ('404.3', 'Avaliação da Eficácia', 'Avaliar eficácia da estrutura de controles internos', 'Seção 404 - Controles Internos', 'Auditoria Interna', 3, true, 8),
  ('404.4', 'Atestação do Auditor Externo', 'Auditor externo deve atestar e reportar sobre controles', 'Seção 404 - Controles Internos', 'Auditoria Externa', 3, true, 9),
  ('404.5', 'Framework de Controle Reconhecido', 'Utilizar framework de controle estabelecido (ex: COSO)', 'Seção 404 - Controles Internos', 'Controles Internos', 3, true, 10),
  ('404.6', 'Documentação de Controles', 'Documentar processos e controles de relatórios financeiros', 'Seção 404 - Controles Internos', 'Controles Internos', 3, true, 11),
  ('404.7', 'Teste de Controles', 'Testar eficácia operacional dos controles', 'Seção 404 - Controles Internos', 'Auditoria Interna', 3, true, 12),
  ('404.8', 'Identificação de Deficiências', 'Identificar e reportar deficiências e fraquezas materiais', 'Seção 404 - Controles Internos', 'Auditoria Interna', 3, true, 13),
  ('404.9', 'Remediação de Deficiências', 'Implementar planos para remediar deficiências identificadas', 'Seção 404 - Controles Internos', 'Controles Internos', 3, true, 14),
  
  -- Seção 802: Penalidades Criminais por Adulteração de Documentos
  ('802.1', 'Retenção de Registros de Auditoria', 'Manter todos os papéis de trabalho de auditoria por 5 anos', 'Seção 802 - Registros', 'Auditoria', 3, true, 15),
  ('802.2', 'Destruição de Documentos', 'Proibição de destruição de documentos em investigações', 'Seção 802 - Registros', 'Gestão Documental', 3, true, 16),
  ('802.3', 'Política de Retenção de Documentos', 'Estabelecer política formal de retenção de documentos', 'Seção 802 - Registros', 'Gestão Documental', 3, true, 17),
  
  -- Seção 906: Responsabilidade Corporativa por Relatórios Financeiros
  ('906.1', 'Certificação de Relatórios Periódicos', 'CEO e CFO certificam que relatórios estão em conformidade', 'Seção 906 - Certificações Penais', 'Alta Direção', 3, true, 18),
  ('906.2', 'Representação Fidedigna', 'Relatórios representam fidedignamente condição financeira', 'Seção 906 - Certificações Penais', 'Financeiro', 3, true, 19),
  
  -- Controles Gerais de TI
  ('IT.1', 'Controles de Acesso', 'Implementar controles de acesso para sistemas financeiros', 'Controles de TI', 'Segurança da Informação', 3, true, 20),
  ('IT.2', 'Gestão de Mudanças de TI', 'Controlar mudanças em sistemas que afetam relatórios financeiros', 'Controles de TI', 'Gestão de Mudanças TI', 3, true, 21),
  ('IT.3', 'Backup e Recuperação', 'Estabelecer procedimentos de backup e recuperação', 'Controles de TI', 'Infraestrutura', 3, true, 22),
  ('IT.4', 'Segregação de Funções', 'Implementar segregação de funções em sistemas', 'Controles de TI', 'Segurança da Informação', 3, true, 23),
  ('IT.5', 'Logs e Auditoria', 'Manter logs de auditoria de transações financeiras', 'Controles de TI', 'Monitoramento', 3, true, 24),
  
  -- Controles de Processos de Negócio
  ('BP.1', 'Controles de Receita', 'Implementar controles sobre ciclo de receita', 'Controles de Processos', 'Financeiro', 3, true, 25),
  ('BP.2', 'Controles de Despesas', 'Implementar controles sobre ciclo de despesas', 'Controles de Processos', 'Financeiro', 3, true, 26),
  ('BP.3', 'Controles de Folha de Pagamento', 'Implementar controles sobre processamento de folha', 'Controles de Processos', 'Recursos Humanos', 3, true, 27),
  ('BP.4', 'Controles de Inventário', 'Implementar controles sobre gestão de inventário', 'Controles de Processos', 'Operações', 2, true, 28),
  ('BP.5', 'Reconciliações', 'Realizar reconciliações periódicas de contas', 'Controles de Processos', 'Contabilidade', 3, true, 29),
  ('BP.6', 'Fechamento Financeiro', 'Estabelecer controles para processo de fechamento', 'Controles de Processos', 'Contabilidade', 3, true, 30)
) AS r(codigo, titulo, descricao, categoria, area_responsavel, peso, obrigatorio, ordem)
WHERE f.nome = 'SOX 2002' AND f.versao = '2002';